import { spawn } from 'child_process';
import path from 'path';

export const runPredictionPipeline = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log('Starting AI Prediction Pipeline...');

        // Path to python script
        // Assuming backend is at /backend and ai-model is at /ai-model
        const scriptPath = path.join(__dirname, '../../../ai-model/predict.py');

        // Spawn python process
        // Note: 'python3' might need to be 'python' depending on the environment
        const pythonProcess = spawn('python3', [scriptPath]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`AI Engine (stdout): ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`AI Engine (stderr): ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('AI Prediction Pipeline completed successfully.');
                resolve();
            } else {
                console.error(`AI Prediction Pipeline failed with code ${code}`);
                reject(new Error(`Script exited with code ${code}`));
            }
        });
    });
};
