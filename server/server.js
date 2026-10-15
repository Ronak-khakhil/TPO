import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { seedDatabase } from './services/seedService.js';
import { store } from './data/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Campus Placement Communication & Tracking System',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum allowed resume size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message && err.message.includes('Only PDF, DOC, and DOCX')) {
    return res.status(400).json({ message: err.message });
  }

  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Ensure initial seed data exists
try {
  if (store.collection('users').count() === 0) {
    console.log('⚡ Initializing and seeding demo college placement dataset...');
    await seedDatabase(false);
    console.log('✅ Demo dataset loaded successfully!');
  }
} catch (e) {
  console.error('Initial seeding notice:', e.message);
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎓 Placement System Backend Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📡 API Health: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
}

export default app;
