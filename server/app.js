import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health Check Telemetry Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AI QUIZ BATTLE Core Server',
    timestamp: new Date().toISOString()
  });
});

// AI Generation Routes
app.use('/api/ai', aiRoutes);

// Global Centralized Error Handler (Never expose stack traces or env variables)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message || err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
