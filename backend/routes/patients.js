import express from 'express';
import PatientProfile from '../models/PatientProfile.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create own profile (patient only, once)
router.post('/', requireAuth, requireRole('patient'), async (req, res) => {
  try {
    const existing = await PatientProfile.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });

    const { conditions, baseline, assignedDoctorId } = req.body;
    const profile = await PatientProfile.create({
      userId: req.user.id,
      conditions,
      baseline,
      assignedDoctorId,
    });
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get one patient's profile
router.get('/:patientId', requireAuth, async (req, res) => {
  const profile = await PatientProfile.findOne({ userId: req.params.patientId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
});

// Update profile
router.patch('/:patientId', requireAuth, async (req, res) => {
  const profile = await PatientProfile.findOneAndUpdate(
    { userId: req.params.patientId },
    req.body,
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
});

// Doctor: list all their assigned patients
router.get('/', requireAuth, requireRole('doctor'), async (req, res) => {
  const profiles = await PatientProfile.find({ assignedDoctorId: req.user.id })
    .populate('userId', 'name email');
  res.json(profiles);
});

export default router;