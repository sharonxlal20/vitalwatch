import express from 'express';
import VitalReading from '../models/VitalReading.js';
import { requireAuth } from '../middleware/auth.js';
import { enqueueAnomalyCheck } from '../services/queue.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, value, recordedAt, source } = req.body;
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;

    const reading = await VitalReading.create({
      patientId, type, value,
      recordedAt: recordedAt || new Date(),
      source: source || 'manual',
    });

    await enqueueAnomalyCheck({ patientId, readingId: reading._id });

    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:patientId', requireAuth, async (req, res) => {
  const { patientId } = req.params;
  const { type, from, to, page = 1, limit = 50 } = req.query;

  const filter = { patientId };
  if (type) filter.type = type;
  if (from || to) {
    filter.recordedAt = {};
    if (from) filter.recordedAt.$gte = new Date(from);
    if (to) filter.recordedAt.$lte = new Date(to);
  }

  const readings = await VitalReading.find(filter)
    .sort({ recordedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(readings);
});

export default router;