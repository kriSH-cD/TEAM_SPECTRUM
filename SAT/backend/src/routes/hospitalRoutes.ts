import express from 'express';
import {
    getHospitals,
    getHospital,
    createHospital,
    updateHospital,
} from '../controllers/hospitalController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getHospitals);
router.get('/:id', getHospital);
router.post('/', protect, authorize('admin'), createHospital);
router.put('/:id', protect, authorize('admin', 'operator'), updateHospital);

export default router;
