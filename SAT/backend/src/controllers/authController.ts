import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';

// Generate JWT Token
const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register public user
// @route   POST /api/auth/signup/public
// @access  Public
export const signupPublic = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'public',
        });

        if (user) {
            res.status(201).json({
                _id: (user as any)._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user as any)._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register hospital staff
// @route   POST /api/auth/signup/hospital
// @access  Public
export const signupHospital = async (req: Request, res: Response) => {
    try {
        const { name, email, password, hospital_code } = req.body;

        if (!name || !email || !password || !hospital_code) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Simple validation for hospital code (mock)
        if (hospital_code !== 'HOSP123') {
            return res.status(400).json({ message: 'Invalid hospital code' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'hospital_staff',
        });

        if (user) {
            res.status(201).json({
                _id: (user as any)._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user as any)._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register pharmacy staff
// @route   POST /api/auth/signup/pharmacy
// @access  Public
export const signupPharmacy = async (req: Request, res: Response) => {
    try {
        const { name, email, password, pharmacy_code } = req.body;

        if (!name || !email || !password || !pharmacy_code) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Simple validation for pharmacy code (mock)
        if (pharmacy_code !== 'PHARM123') {
            return res.status(400).json({ message: 'Invalid pharmacy code' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'pharmacy',
        });

        if (user) {
            res.status(201).json({
                _id: (user as any)._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user as any)._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password as string))) {
            res.json({
                _id: (user as any)._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user as any)._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.preferences = req.body.preferences || user.preferences;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: (updatedUser as any)._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                preferences: updatedUser.preferences,
                token: generateToken((updatedUser as any)._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
