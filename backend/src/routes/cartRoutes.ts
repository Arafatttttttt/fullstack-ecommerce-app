import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate); // All cart routes require authentication

router.get('/', getCart);
router.post('/', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/clear', clearCart);

export default router;
