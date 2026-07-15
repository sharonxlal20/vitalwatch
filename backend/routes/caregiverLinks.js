import express from 'express';
import CaregiverLink from '../models/CaregiverLink.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Patient invites a caregiver by email
router.post('/', requireAuth, requireRole('patient'), async (req, res) => {
  try {
    const { caregiverEmail, relationship } = req.body;
    const caregiver = await User.findOne({ email: caregiverEmail, role: 'caregiver' });
    if (!caregiver) return res.status(404).json({ message: 'No caregiver found with that email' });

    const link = await CaregiverLink.create({
      patientId: req.user.id,
      caregiverId: caregiver._id,
      relationship,
    });
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Caregiver accepts a pending link
router.patch('/:id/accept', requireAuth, requireRole('caregiver'), async (req, res) => {
  const link = await CaregiverLink.findOneAndUpdate(
    { _id: req.params.id, caregiverId: req.user.id },
    { status: 'active' },
    { new: true }
  );
  if (!link) return res.status(404).json({ message: 'Link not found' });
  res.json(link);
});

// List caregivers linked to a patient
router.get('/patient/:patientId', requireAuth, async (req, res) => {
  const links = await CaregiverLink.find({ patientId: req.params.patientId })
    .populate('caregiverId', 'name email');
  res.json(links);
});

// Caregiver: list patients they're linked to
router.get('/mine', requireAuth, requireRole('caregiver'), async (req, res) => {
  const links = await CaregiverLink.find({ caregiverId: req.user.id, status: 'active' })
    .populate('patientId', 'name email');
  res.json(links);
});

export default router;