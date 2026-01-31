import { Request, Response } from 'express';
import Alert from '../models/Alert';

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
export const getAlerts = async (req: Request, res: Response) => {
    try {
        const { hospitalId, read } = req.query;
        let query: any = {};

        if (hospitalId) {
            query.hospitalId = hospitalId;
        }

        if (read !== undefined) {
            query.read = read === 'true';
        }

        const alerts = await Alert.find(query).sort({ createdAt: -1 });
        res.status(200).json(alerts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private (Admin/System)
export const createAlert = async (req: Request, res: Response) => {
    try {
        const { title, message, type, hospitalId } = req.body;

        const alert = await Alert.create({
            title,
            message,
            type,
            hospitalId,
        });

        res.status(201).json(alert);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
export const markAlertAsRead = async (req: Request, res: Response) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        alert.read = true;
        await alert.save();

        res.status(200).json(alert);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
