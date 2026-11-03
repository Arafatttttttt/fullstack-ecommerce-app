import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      const error: CustomError = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      return next(error);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user has ordered and received this product
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'delivered',
        items: {
          some: {
            productId,
          },
        },
      },
      include: {
        items: {
          where: {
            productId,
          },
        },
      },
    });

    if (!deliveredOrder) {
      const error: CustomError = new Error('You can only review products that you have ordered and received');
      error.statusCode = 403;
      return next(error);
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReview) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.userId; // Optional, for checking if user can review

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    // Check if user can review (has delivered order)
    let canReview = false;
    if (userId) {
      const deliveredOrder = await prisma.order.findFirst({
        where: {
          userId,
          status: 'delivered',
          items: {
            some: {
              productId,
            },
          },
        },
      });
      canReview = !!deliveredOrder;
    }

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
        canReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      const error: CustomError = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }

    // Only allow user to delete their own review (or admin)
    if (review.userId !== userId && req.user!.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized');
      error.statusCode = 403;
      return next(error);
    }

    await prisma.review.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
