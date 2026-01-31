import express from 'express';
import {
    getAlerts,
    createAlert,
    markAlertAsRead,
} from '../controllers/alertController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', protect, authorize('admin'), createAlert);
router.put('/:id/read', protect, markAlertAsRead);

export default router;
