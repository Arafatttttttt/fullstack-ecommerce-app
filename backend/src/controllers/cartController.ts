import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check stock
    if (product.stock < quantity) {
      const error: CustomError = new Error('Insufficient stock');
      error.statusCode = 400;
      return next(error);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        const error: CustomError = new Error('Insufficient stock');
        error.statusCode = 400;
        return next(error);
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });

      return res.json({
        success: true,
        message: 'Cart updated successfully',
        data: updatedItem,
      });
    } else {
      // Add new item
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: { product: true },
      });

      return res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      const error: CustomError = new Error('Cart item not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      const error: CustomError = new Error('Insufficient stock');
      error.statusCode = 400;
      return next(error);
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      const error: CustomError = new Error('Cart item not found');
      error.statusCode = 404;
      return next(error);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};
