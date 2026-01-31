import { Request, Response } from 'express';
import Prediction from '../models/Prediction';

// @desc    Get predictions by city
// @route   GET /api/forecast/:city
// @access  Public
export const getPredictionsByCity = async (req: Request, res: Response) => {
    try {
        const { city } = req.params;

        // In a real app, we would join with Hospital model to filter by city
        // For now, we'll assume the frontend passes the city and we might filter differently
        // Or we find hospitals in that city first

        // Mock implementation for now as we need data populated
        // Real implementation:
        // 1. Find hospitals in city
        // 2. Find predictions for those hospitals

        res.status(200).json({ message: `Predictions for city ${city}` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get predictions by hospital
// @route   GET /api/forecast/:city/:hospitalId
// @access  Public
export const getPredictionsByHospital = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.params;

        const predictions = await Prediction.find({ hospitalId }).sort({ date: 1 });

        res.status(200).json(predictions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
