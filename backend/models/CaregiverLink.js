import mongoose from 'mongoose';

const caregiverLinkSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relationship: { type: String, default: 'family' },
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
}, { timestamps: true });

caregiverLinkSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

export default mongoose.model('CaregiverLink', caregiverLinkSchema);