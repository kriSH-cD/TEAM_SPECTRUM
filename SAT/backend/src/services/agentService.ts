import axios from 'axios';
import Patient, { IPatient } from '../models/Patient';
import HospitalState from '../models/HospitalState';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

export const evaluatePatient = async (patient: IPatient) => {
    try {
        // 1. Get current Hospital State
        // For prototype, we ensure at least one state exists
        let hospitalState = await HospitalState.findOne().sort({ lastUpdated: -1 });
        if (!hospitalState) {
            hospitalState = await HospitalState.create({ department: "General Hospital" });
        }

        // 2. Prepare Payload
        const payload = {
            patient: {
                name: patient.name,
                status: patient.status,
                currentVitals: patient.currentVitals
            },
            hospital_state: {
                icuBedsTotal: hospitalState.icuBedsTotal,
                icuBedsOccupied: hospitalState.icuBedsOccupied,
                wardBedsTotal: hospitalState.wardBedsTotal,
                wardBedsOccupied: hospitalState.wardBedsOccupied,
                staffLoad: hospitalState.staffLoad
            }
        };

        // 3. Call AI Agent
        const response = await axios.post(`${AI_SERVICE_URL}/evaluate_patient`, payload);
        const decisionData = response.data;

        // 4. Update Patient Record with Agent Decision
        patient.riskScore = decisionData.risk_analysis.score;

        // Map risk level to trend for simplicity
        if (decisionData.risk_analysis.level === 'CRITICAL') patient.acuityTrend = 'DETERIORATING';
        else if (decisionData.risk_analysis.level === 'LOW') patient.acuityTrend = 'STABLE';

        // Log action to history
        patient.actionsHistory.push({
            timestamp: new Date(),
            action: decisionData.decision.action,
            reason: decisionData.decision.reason,
            agent: "Orchestrator"
        });

        // Save
        await patient.save();

        return decisionData;

    } catch (error) {
        console.error("Error connecting to AI Agent:", error);
        throw error;
    }
};
