import express from 'express';
import { getPrediction, chatWithAI, getForecast } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// AI Prediction Routes
router.post('/predict', protect, getPrediction);
router.post('/chat', protect, chatWithAI);
// Make forecast public for demo - remove protect middleware
router.get('/forecast', protect, getForecast);

export default router;
