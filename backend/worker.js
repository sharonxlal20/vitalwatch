import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import 'dotenv/config';
import mongoose from 'mongoose';
import VitalReading from './models/VitalReading.js';
import Alert from './models/Alert.js';

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

mongoose.connect(process.env.MONGO_URI);

const ML_SERVICE_URL = 'http://127.0.0.1:8000/predict';

const worker = new Worker('anomaly-check', async (job) => {
  const { patientId, readingId } = job.data;
  console.log(`Processing anomaly check for patient ${patientId}, reading ${readingId}`);

  // Get this patient's last 10 readings of the same type as the new one
  const newReading = await VitalReading.findById(readingId);
  if (!newReading) return;

  const recentReadings = await VitalReading.find({
    patientId,
    type: newReading.type,
  })
    .sort({ recordedAt: -1 })
    .limit(10);

  // Not enough history yet — skip prediction until we have 10 readings
  if (recentReadings.length < 10) {
    console.log(`Not enough history yet (${recentReadings.length}/10), skipping`);
    return;
  }

  const values = recentReadings.reverse().map(r => r.value);

  let data;
  try {
    const response = await axios.post(ML_SERVICE_URL, { type: newReading.type, values });
    data = response.data;
  } catch (err) {
    console.error(`ML service unreachable, skipping prediction for reading ${readingId}:`, err.message);
    return;
  }

  if (data.is_anomaly) {
    await Alert.create({
      patientId,
      severity: data.severity,
      message: `Unusual ${newReading.type} pattern detected`,
      modelConfidence: Math.min(data.reconstruction_error / 2, 1),
      triggeringReadingIds: [readingId],
    });
    console.log(`Alert created for patient ${patientId} — severity: ${data.severity}`);
  } else {
    console.log(`No anomaly detected (error: ${data.reconstruction_error})`);
  }
}, { connection });

worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err.message));

console.log('Worker listening for anomaly-check jobs...');