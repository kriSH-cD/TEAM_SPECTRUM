import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Load environment variables
dotenv.config({ override: true });

console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Permissive CORS for debugging
app.use(cors({
    origin: true, // Reflects the request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Explicitly handle preflight - Removed for Express 5 compatibility
// app.options('*', cors());

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

import authRoutes from './routes/authRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import predictionRoutes from './routes/predictionRoutes';
import alertRoutes from './routes/alertRoutes';
import patientRoutes from './routes/patientRoutes'; // Added patientRoutes import
import { initScheduler } from './services/scheduler';

// Connect to Database
connectDB();

// Initialize Scheduler
initScheduler();

// Routes
import aiRoutes from './routes/aiRoutes';

// ... other imports

app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/forecast', predictionRoutes);
app.use('/api/patients', patientRoutes); // Added patientRoutes usage
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('MediCast Backend API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
