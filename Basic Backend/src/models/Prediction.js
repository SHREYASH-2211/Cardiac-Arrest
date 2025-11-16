// src/models/Prediction.js
import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
  patientId: { type: String, required: true, trim: true, index: true },
  type: { type: String, required: true, enum: ['vitals', 'ecg-signal', 'ecg-image'] },
  averageRisk: { type: Number, min: 0, max: 100, default: null },
  riskScore: { type: Number, min: 0, max: 100, default: null },
  predictedClass: { type: String, default: null },
  confidenceScores: { type: [Number], default: [] },
  rawResult: { type: mongoose.Schema.Types.Mixed, default: {} },
  summary: { type: mongoose.Schema.Types.Mixed, default: {} },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const Prediction = mongoose.models?.Prediction || mongoose.model('Prediction', PredictionSchema);
export default Prediction;
