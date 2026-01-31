import express from 'express';
import { getPatients, admitPatient, updatePatient, deletePatient, runSimulationStep } from '../controllers/patientController';

const router = express.Router();

router.get('/', getPatients);
router.post('/admit', admitPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);
router.post('/simulate', runSimulationStep);

export default router;

