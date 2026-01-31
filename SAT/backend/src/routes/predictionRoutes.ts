import express from 'express';
import {
    getPredictionsByCity,
    getPredictionsByHospital,
} from '../controllers/predictionController';

const router = express.Router();

router.get('/:city', getPredictionsByCity);
router.get('/:city/:hospitalId', getPredictionsByHospital);

export default router;
