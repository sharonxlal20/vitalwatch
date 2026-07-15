import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  conditions: [{ type: String, enum: ['diabetes', 'hypertension', 'heart_disease', 'other'] }],
  baseline: {
    glucose: { min: Number, max: Number },
    systolicBP: { min: Number, max: Number },
    diastolicBP: { min: Number, max: Number },
    heartRate: { min: Number, max: Number },
    spo2: { min: Number, max: Number },
  },
  assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('PatientProfile', patientProfileSchema);