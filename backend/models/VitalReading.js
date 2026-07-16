import mongoose from 'mongoose';

const vitalReadingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['glucose', 'bp', 'heart_rate', 'spo2', 'weight', 'temperature'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, 
  recordedAt: { type: Date, required: true, default: Date.now },
  source: { type: String, enum: ['manual', 'csv_import'], default: 'manual' },
}, { timestamps: true });

vitalReadingSchema.index({ patientId: 1, recordedAt: -1 }); 

export default mongoose.model('VitalReading', vitalReadingSchema);