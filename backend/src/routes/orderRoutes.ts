import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  createPaymentIntent,
  cancelOrder,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate); // All order routes require authentication

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.post('/payment-intent', createPaymentIntent);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus); // Admin only

export default router;
