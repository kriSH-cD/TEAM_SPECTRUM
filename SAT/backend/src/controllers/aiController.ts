import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

const AI_SERVICE_URL = 'http://127.0.0.1:5002';
const REQUEST_TIMEOUT = 120000; // 120 seconds (2 minutes)

// Proxy to Python Service for Forecasts
export const getPrediction = async (req: Request, res: Response) => {
    try {
        // Call the Multi-Layer AI Pipeline
        const response = await axios.post(`${AI_SERVICE_URL}/predict/pipeline`, req.body, {
            timeout: REQUEST_TIMEOUT
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('AI Service Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'AI Service is currently unavailable. Please try again later.',
                error: 'Service connection refused'
            });
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return res.status(504).json({
                message: 'AI Service request timed out. Please try again.',
                error: 'Request timeout'
            });
        }

        res.status(500).json({
            message: 'AI Service unavailable',
            error: error.message
        });
    }
};

// Proxy to Python Service for Chat
export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/chat`, req.body, {
            timeout: REQUEST_TIMEOUT
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('AI Chat Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'AI Chat service is currently unavailable. Please try again later.',
                error: 'Service connection refused'
            });
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return res.status(504).json({
                message: 'Chat request timed out. Please try again.',
                error: 'Request timeout'
            });
        }

        res.status(500).json({
            message: 'Chat unavailable',
            error: error.message
        });
    }
};

// Proxy to Python Service for Forecasting
export const getForecast = async (req: Request, res: Response) => {
    try {
        // Extract query parameters
        const role = (req.query.role as string) || 'public';
        const horizon = parseInt(req.query.horizon as string) || 14;

        // Validate role
        const validRoles = ['public', 'hospital_staff', 'pharmacy', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role. Must be one of: public, hospital_staff, pharmacy, admin',
                error: 'Invalid parameter'
            });
        }

        // RBAC: Check if user is authorized to view this role's forecast
        const user = (req as any).user;
        if (user.role !== 'admin' && role !== 'public' && role !== user.role) {
            return res.status(403).json({
                message: `Access denied. You are not authorized to view ${role} forecasts.`,
                error: 'Forbidden'
            });
        }

        // Validate horizon
        if (horizon < 1 || horizon > 30) {
            return res.status(400).json({
                message: 'Invalid horizon. Must be between 1 and 30 days',
                error: 'Invalid parameter'
            });
        }

        console.log(`Fetching forecast: role=${role}, horizon=${horizon}`);

        // Call AI service
        const response = await axios.get(`${AI_SERVICE_URL}/predict/final`, {
            params: { role, horizon },
            timeout: REQUEST_TIMEOUT,
            validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });

        // Check if AI service returned an error
        if (response.status >= 400) {
            return res.status(response.status).json({
                message: 'AI service returned an error',
                error: response.data.error || response.statusText
            });
        }

        // Return successful forecast
        res.json(response.data);

    } catch (error: any) {
        console.error('Forecast Error:', error.message);

        // Handle connection refused (AI service not running)
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'AI Forecast service is currently unavailable. Please ensure the AI service is running.',
                error: 'Service connection refused',
                details: 'The AI prediction service at port 5002 is not responding. Please start the service.'
            });
        }

        // Handle timeout
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return res.status(504).json({
                message: 'Forecast request timed out. The AI model is taking too long to respond.',
                error: 'Request timeout',
                details: 'Please try again with a smaller horizon or wait for the model to finish processing.'
            });
        }

        // Handle network errors
        if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
            return res.status(503).json({
                message: 'Unable to reach AI service. Network error.',
                error: 'Network error'
            });
        }

        // Generic error
        res.status(500).json({
            message: 'Forecast service encountered an error',
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
};
