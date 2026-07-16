import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import './worker.js';

import authRoutes from './routes/auth.js';
import vitalsRoutes from './routes/vitals.js';
import alertsRoutes from './routes/alerts.js';
import patientRoutes from './routes/patients.js';
import caregiverLinkRoutes from './routes/caregiverLinks.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/caregiver-links', caregiverLinkRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Catches any error thrown in routes so the server never crashes silently
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));