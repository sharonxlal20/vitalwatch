import 'dotenv/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const anomalyQueue = new Queue('anomaly-check', { connection });

export const enqueueAnomalyCheck = async ({ patientId, readingId }) => {
  await anomalyQueue.add('check-vital', { patientId, readingId });
  console.log(`Queued anomaly check → patient ${patientId}, reading ${readingId}`);
};