// src/controllers/predictionController.js
import Prediction from '../models/Prediction.js';

export const saveVitalsResult = async (req, res) => {
  try {
    console.log('[saveVitalsResult] payload:', JSON.stringify(req.body).slice(0, 1000));
    const { patientId, averageRisk, summary = {}, rawResult = {}, metadata = {} } = req.body;

    if (!patientId) return res.status(400).json({ error: 'patientId is required' });
    if (averageRisk === undefined || averageRisk === null) {
      return res.status(400).json({ error: 'averageRisk is required for vitals' });
    }

    const doc = await Prediction.create({
      patientId,
      type: 'vitals',
      averageRisk: Number(averageRisk),
      summary,
      rawResult,
      metadata,
    });

    console.log('[saveVitalsResult] saved id=', doc._id.toString());
    return res.status(201).json({ message: 'Vitals result saved', id: doc._id, doc });
  } catch (err) {
    console.error('[saveVitalsResult] error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const saveEcgSignalResult = async (req, res) => {
  try {
    console.log('[saveEcgSignalResult] payload:', JSON.stringify(req.body).slice(0,1000));
    const { patientId, riskScore, message = '', rawResult = {}, metadata = {} } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });
    if (riskScore === undefined || riskScore === null) {
      return res.status(400).json({ error: 'riskScore is required for ecg-signal' });
    }

    const doc = await Prediction.create({
      patientId,
      type: 'ecg-signal',
      riskScore: Number(riskScore),
      rawResult,
      metadata: { ...metadata, message },
    });

    console.log('[saveEcgSignalResult] saved id=', doc._1d ?? doc._id);
    return res.status(201).json({ message: 'ECG signal result saved', id: doc._id, doc });
  } catch (err) {
    console.error('[saveEcgSignalResult] error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const saveEcgImageResult = async (req, res) => {
  try {
    console.log('[saveEcgImageResult] payload:', JSON.stringify(req.body).slice(0,1000));
    const { patientId, predictedClass, confidenceScores = [], rawResult = {}, metadata = {} } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const doc = await Prediction.create({
      patientId,
      type: 'ecg-image',
      predictedClass,
      confidenceScores,
      rawResult,
      metadata,
    });

    console.log('[saveEcgImageResult] saved id=', doc._id.toString());
    return res.status(201).json({ message: 'ECG image result saved', id: doc._id, doc });
  } catch (err) {
    console.error('[saveEcgImageResult] error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getResultsByPatient = async (req, res) => {
  try {
    const { patientId, type } = req.query;
    if (!patientId) return res.status(400).json({ error: 'patientId query parameter required' });

    const filter = { patientId };
    if (type) filter.type = type;

    const docs = await Prediction.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json({ count: docs.length, results: docs });
  } catch (err) {
    console.error('[getResultsByPatient] error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPatientsSummary = async (req, res) => {
    try {
      // Aggregate: group by patientId, get last prediction doc for each patient
      const pipeline = [
        // sort by createdAt desc so $first gives the latest
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$patientId",
            lastDoc: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$lastDoc" },
        },
        // optionally limit or sort
        { $sort: { createdAt: -1 } },
        // You can $limit if you only want top N patients
      ];
  
      const rows = await Prediction.aggregate(pipeline).exec();
  
      const patients = rows.map((r) => {
        // Determine risk: prefer averageRisk (vitals), otherwise riskScore (ecg)
        let risk = null;
        if (typeof r.averageRisk === "number" && r.averageRisk !== null) risk = Number(r.averageRisk);
        else if (typeof r.riskScore === "number" && r.riskScore !== null) risk = Number(r.riskScore);
  
        // Normalize if risk seems 0..1
        if (risk !== null && risk <= 1) risk = risk * 100;
  
        // Determine status from thresholds (you can adjust thresholds)
        let status = null;
        if (risk !== null) {
          if (risk >= 70) status = "high";
          else if (risk >= 40) status = "medium";
          else status = "low";
        }
  
        // Pick lastPredictionAt
        const lastPredictionAt = r.createdAt ? new Date(r.createdAt).toISOString() : null;
  
        // Optional: if you stored name/age in metadata/rawResult, pick them
        const name = r.metadata?.patientName ?? r.rawResult?.patientName ?? null;
        const age = r.metadata?.patientAge ?? r.rawResult?.patientAge ?? null;
  
        return {
          patientId: r.patientId,
          name: name ?? null,
          age: age ?? null,
          lastPredictionAt,
          riskPercent: risk !== null ? Number(risk) : null,
          status,
        };
      });
  
      return res.json({ patients });
    } catch (err) {
      console.error("[getPatientsSummary] error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
