import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { CustomError } from '../middleware/errorHandler';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate review statistics for each product
    const productsWithReviews = products.map((product) => {
      const reviews = product.reviews;
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      // Remove reviews from product object and add statistics
      const { reviews: _, ...productData } = product;
      return {
        ...productData,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      };
    });

    res.json({
      success: true,
      data: {
        products: productsWithReviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    // Handle multiple uploaded files
    let imageArray: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      // Store just the filename, not the full path
      imageArray = req.files.map((file: Express.Multer.File) => file.filename);
    } else if (req.file) {
      imageArray = [req.file.filename];
    } else if (images) {
      // Handle JSON string from form data
      try {
        imageArray = typeof images === 'string' ? JSON.parse(images) : images;
      } catch {
        imageArray = Array.isArray(images) ? images : [images];
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        images: imageArray.length > 0 ? imageArray : undefined,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, images } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = parseInt(stock);

    // Handle multiple uploaded files
    if (req.files && Array.isArray(req.files)) {
      // Store just the filename, not the full path
      updateData.images = req.files.map((file: Express.Multer.File) => file.filename);
    } else if (req.file) {
      // Get existing images and add new one
      const existing = await prisma.product.findUnique({ where: { id }, select: { images: true } });
      const existingImages = existing?.images ? (existing.images as string[]) : [];
      updateData.images = [...existingImages, req.file.filename];
    } else if (images) {
      try {
        updateData.images = typeof images === 'string' ? JSON.parse(images) : images;
      } catch {
        updateData.images = Array.isArray(images) ? images : [images];
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categoryList = categories.map((item) => item.category);

    res.json({
      success: true,
      data: categoryList,
    });
  } catch (error) {
    next(error);
  }
};
