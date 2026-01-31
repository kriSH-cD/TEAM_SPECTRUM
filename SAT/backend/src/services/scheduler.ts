import cron from 'node-cron';
import { runPredictionPipeline } from './aiService';
import Prediction from '../models/Prediction';
import Alert from '../models/Alert';
import { sendEmail, sendSMS } from './notificationService';

export const initScheduler = () => {
    console.log('Initializing Background Scheduler...');

    // Schedule task to run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running scheduled prediction task...');
        try {
            // 1. Run AI Engine
            await runPredictionPipeline();

            // 2. Analyze Predictions for Alerts
            console.log('Analyzing predictions for alerts...');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find high-risk predictions generated today
            const riskyPredictions = await Prediction.find({
                createdAt: { $gte: today },
                riskLevel: { $in: ['high', 'critical'] }
            }).populate('hospitalId');

            for (const prediction of riskyPredictions) {
                const hospital = prediction.hospitalId as any;
                const hospitalName = hospital ? hospital.name : 'Unknown Hospital';

                // Create Alert Record
                const alertTitle = `High Risk: ${prediction.type.toUpperCase()} Surge`;
                const alertMessage = `Predicted ${prediction.type} surge for ${hospitalName} on ${new Date(prediction.date).toDateString()}. Risk Level: ${prediction.riskLevel.toUpperCase()}.`;

                await Alert.create({
                    title: alertTitle,
                    message: alertMessage,
                    type: prediction.riskLevel === 'critical' ? 'danger' : 'warning',
                    hospitalId: hospital._id,
                    read: false
                });

                // Send Notifications (Mock Admin Contact)
                const adminEmail = 'admin@medicast.com';
                const adminPhone = '+919876543210';

                await sendEmail(adminEmail, `[MediCast Alert] ${alertTitle}`, alertMessage);
                if (prediction.riskLevel === 'critical') {
                    await sendSMS(adminPhone, `CRITICAL: ${alertMessage}`);
                }
            }

            console.log(`Processed ${riskyPredictions.length} risky predictions.`);

        } catch (error) {
            console.error('Scheduled prediction task failed:', error);
        }
    });

    // Optional: Run immediately on startup for demonstration/testing
    // runPredictionPipeline().catch(err => console.error('Initial prediction run failed:', err));
};
