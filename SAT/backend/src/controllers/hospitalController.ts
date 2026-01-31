import { Request, Response } from 'express';
import Hospital from '../models/Hospital';

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
export const getHospitals = async (req: Request, res: Response) => {
    try {
        const { city, name } = req.query;
        let query: any = {};

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const hospitals = await Hospital.find(query);
        res.status(200).json(hospitals);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospital = async (req: Request, res: Response) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        res.status(200).json(hospital);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new hospital
// @route   POST /api/hospitals
// @access  Private (Admin only)
export const createHospital = async (req: Request, res: Response) => {
    try {
        const { name, city, location, totalBeds, icuBeds, departments } = req.body;

        const hospital = await Hospital.create({
            name,
            city,
            location,
            totalBeds,
            icuBeds,
            departments,
        });

        res.status(201).json(hospital);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private (Admin/Operator)
export const updateHospital = async (req: Request, res: Response) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        const updatedHospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedHospital);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
