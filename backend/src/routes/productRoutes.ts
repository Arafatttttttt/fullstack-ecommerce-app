import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { uploadMultiple } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('admin'), uploadMultiple.array('images', 10), createProduct);
router.put('/:id', authenticate, authorize('admin'), uploadMultiple.array('images', 10), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
