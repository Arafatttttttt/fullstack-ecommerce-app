import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';
import {
  createReview,
  getProductReviews,
  deleteReview,
} from '../controllers/reviewController';

const router = express.Router();

router.get('/product/:productId', optionalAuthenticate, getProductReviews);
router.post('/product/:productId', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
