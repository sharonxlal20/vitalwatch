import express from 'express';
import Alert from '../models/Alert.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/:patientId', requireAuth, async (req, res) => {
  const alerts = await Alert.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
  res.json(alerts);
});

router.patch('/:id/acknowledge', requireAuth, requireRole('doctor', 'caregiver'), async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { acknowledged: true, acknowledgedBy: req.user.id },
    { new: true }
  );
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json(alert);
});

export default router;