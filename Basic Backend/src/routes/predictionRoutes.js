// src/routes/predictionRoutes.js
import express from 'express';
import * as controller from '../controllers/predictionController.js';

const router = express.Router();

router.post('/vitals', controller.saveVitalsResult);
router.post('/ecg/signal', controller.saveEcgSignalResult);
router.post('/ecg/image', controller.saveEcgImageResult);
router.get('/patient', controller.getResultsByPatient);
router.get('/patients', controller.getPatientsSummary);

export default router;
