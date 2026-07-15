import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  message: { type: String, required: true },
  modelConfidence: { type: Number, min: 0, max: 1 },
  triggeringReadingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VitalReading' }],
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);