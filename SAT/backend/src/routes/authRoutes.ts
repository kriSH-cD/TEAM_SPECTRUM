import express from 'express';
import { login, getMe, updateProfile, signupPublic, signupHospital, signupPharmacy } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup/public', signupPublic);
router.post('/signup/hospital', signupHospital);
router.post('/signup/pharmacy', signupPharmacy);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
