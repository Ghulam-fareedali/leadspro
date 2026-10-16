import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import customerRoutes from './routes/customerRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to ensure DB is connected for serverless calls
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Continue so health check or fallback still responds
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = Boolean(process.env.MONGODB_URI);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'MongoDB Configured' : 'Local In-Memory Mode',
    mongodbUriSet: Boolean(process.env.MONGODB_URI)
  });
});

// Mount Routes
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start local server if run directly (not serverless)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🚀 OmniFlow CRM Backend running on http://localhost:${PORT}`);
    try {
      await connectDB();
    } catch (e) {
      console.log('💡 Note: Define MONGODB_URI in .env to connect to MongoDB Atlas.');
    }
  });
}

export default app;
