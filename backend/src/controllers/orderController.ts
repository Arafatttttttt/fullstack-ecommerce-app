import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';
import Stripe from 'stripe';
import { config } from '../config/env';
import { validateUPI } from '../utils/upiValidation';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { address, city, state, zipCode, country, paymentIntentId, paymentMethod, upiId } = req.body;

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      const error: CustomError = new Error('Cart is empty');
      error.statusCode = 400;
      return next(error);
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Verify payment based on payment method
    let finalPaymentId = null;
    if (paymentMethod === 'card' && paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          const error: CustomError = new Error('Payment not completed');
          error.statusCode = 400;
          return next(error);
        }
        finalPaymentId = paymentIntentId;
      } catch (stripeError) {
        const error: CustomError = new Error('Invalid payment intent');
        error.statusCode = 400;
        return next(error);
      }
    } else if (paymentMethod === 'upi') {
      // Validate UPI ID
      if (!upiId) {
        const error: CustomError = new Error('UPI ID is required for UPI payments');
        error.statusCode = 400;
        return next(error);
      }
      
      const upiValidation = validateUPI(upiId);
      if (!upiValidation.isValid) {
        const error: CustomError = new Error(upiValidation.error || 'Invalid UPI ID format');
        error.statusCode = 400;
        return next(error);
      }
      
      // For UPI, store UPI ID as payment ID (in production, you'd integrate with UPI gateway)
      finalPaymentId = upiId;
    } else if (paymentMethod === 'cod') {
      // For COD, mark as cash on delivery
      finalPaymentId = 'cod';
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        address,
        city,
        state,
        zipCode,
        country,
        paymentId: finalPaymentId,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock (reduce stock for all payment methods)
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { amount } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      const error: CustomError = new Error('Cart is empty');
      error.statusCode = 400;
      return next(error);
    }

    const calculatedTotal = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((amount || calculatedTotal) * 100), // Convert to paise (smallest currency unit for INR)
      currency: 'inr',
      metadata: {
        userId,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      const error: CustomError = new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      const error: CustomError = new Error('Cancellation reason is required');
      error.statusCode = 400;
      return next(error);
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      const error: CustomError = new Error('Order is already cancelled');
      error.statusCode = 400;
      return next(error);
    }

    if (order.status === 'delivered') {
      const error: CustomError = new Error('Cannot cancel a delivered order');
      error.statusCode = 400;
      return next(error);
    }

    // Update order status and reason
    await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // If payment was made, you might want to process a refund here
    // For now, we'll just update the order status

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};
