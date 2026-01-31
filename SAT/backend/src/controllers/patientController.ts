import { Request, Response } from 'express';
import Patient from '../models/Patient';
import { evaluatePatient } from '../services/agentService';

// Get all patients
export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await Patient.find().sort({ updatedAt: -1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

// Create a new patient (Simulates admission)
export const admitPatient = async (req: Request, res: Response) => {
    try {
        const { name, age, gender, chiefComplaint, vitals, status } = req.body;

        const newPatient = new Patient({
            name,
            age,
            gender,
            chiefComplaint,
            status: status || 'WAITING', // Use provided status or default to WAITING
            currentVitals: vitals, // Initial vitals
            vitalsHistory: [vitals]
        });

        await newPatient.save();

        // Trigger initial agent evaluation
        let decision = null;
        try {
            decision = await evaluatePatient(newPatient);
        } catch (aiError) {
            console.warn('AI Agent unavailable for initial evaluation:', aiError);
        }

        res.status(201).json({ patient: newPatient, initialDecision: decision });
    } catch (error) {
        res.status(500).json({ message: 'Error admitting patient' });
    }
};

// Update patient
export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, age, gender, chiefComplaint, status, vitals } = req.body;

        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Update patient fields
        if (name) patient.name = name;
        if (age) patient.age = age;
        if (gender) patient.gender = gender;
        if (chiefComplaint) patient.chiefComplaint = chiefComplaint;
        if (status) patient.status = status;

        // Update vitals if provided
        if (vitals) {
            patient.currentVitals = vitals;
            patient.vitalsHistory.push(vitals);
        }

        await patient.save();

        // Re-evaluate patient with updated data (Non-blocking for response)
        let decision = null;
        try {
            decision = await evaluatePatient(patient);
        } catch (aiError) {
            console.warn('AI Agent unavailable for re-evaluation:', aiError);
            // We continue without failing the update
        }

        res.json({ patient, decision });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ message: 'Error updating patient' });
    }
};

// Delete patient
export const deletePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findByIdAndDelete(id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully', patient });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ message: 'Error deleting patient' });
    }
};

import HospitalState from '../models/HospitalState';

// Simulate updates for all patients (Triggered by "Next Step" or Interval)
export const runSimulationStep = async (req: Request, res: Response) => {
    try {
        const patients = await Patient.find({ status: { $ne: 'DISCHARGED' } });
        const results = [];

        for (const patient of patients) {
            // 1. Randomly fluctuate vitals (Simulate condition change)
            // High risk patients fluctuate more
            const fluctuation = Math.random() > 0.5 ? 1 : -1;

            // Update SpO2
            if (patient.currentVitals.spO2) {
                let change = Math.floor(Math.random() * 3) * fluctuation;
                // Slight bias towards deterioration for demo purposes
                if (Math.random() > 0.7) change -= 2;
                patient.currentVitals.spO2 = Math.min(100, Math.max(70, patient.currentVitals.spO2 + change));
            }

            // Heart Rate
            if (patient.currentVitals.heartRate) {
                let change = Math.floor(Math.random() * 5) * fluctuation;
                patient.currentVitals.heartRate = Math.max(40, patient.currentVitals.heartRate + change);
            }

            // 2. Evaluate with Agent
            const decision = await evaluatePatient(patient);
            results.push({ name: patient.name, decision });
        }


        // 3. Simulate Hospital Resource Fluctuations
        const hospitalState = await HospitalState.findOne();
        if (hospitalState) {
            // Randomly discharge/admit to change occupancy
            if (Math.random() > 0.7) {
                const change = Math.random() > 0.5 ? 1 : -1;
                hospitalState.icuBedsOccupied = Math.max(0, Math.min(hospitalState.icuBedsTotal, hospitalState.icuBedsOccupied + change));
            }
            if (Math.random() > 0.6) {
                const change = Math.random() > 0.5 ? 1 : -1;
                hospitalState.wardBedsOccupied = Math.max(0, Math.min(hospitalState.wardBedsTotal, hospitalState.wardBedsOccupied + change));
            }
            await hospitalState.save();
        }

        res.json({ message: "Simulation step complete", results, hospitalState });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Simulation failed' });
    }
};
