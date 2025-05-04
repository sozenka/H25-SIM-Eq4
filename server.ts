import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
<<<<<<< Updated upstream:server.ts
=======
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
>>>>>>> Stashed changes:backend/server.ts
import { handleSignUp, handleSignIn } from './src/lib/api/auth';

dotenv.config();

const app = express();
<<<<<<< Updated upstream:server.ts
const PORT = parseInt(process.env.PORT || '10000', 10);
=======
const PORT = Number(process.env.PORT) || 5000;
>>>>>>> Stashed changes:backend/server.ts

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || '', {})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const recordingSchema = new mongoose.Schema({
  userId: String,
  title: String,
  audioUrl: String,
  notes: Array,
  createdAt: { type: Date, default: Date.now }
});
<<<<<<< Updated upstream:server.ts
app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
  handleSignIn(req, res).catch(next);
});
=======

const Recording = mongoose.models.Recording || mongoose.model('Recording', recordingSchema);
>>>>>>> Stashed changes:backend/server.ts

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

app.post('/api/auth/signup', asyncHandler(handleSignUp));
app.post('/api/auth/login', asyncHandler(handleSignIn));

app.post('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
  const { title, notes, audioUrl } = req.body;

  if (!audioUrl) return res.status(400).json({ error: 'audioUrl is required' });

  const recording = new Recording({
    userId: decoded.userId,
    title,
    audioUrl,
    notes,
  });

  await recording.save();
  res.status(201).json(recording);
}));

app.get('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
  const recordings = await Recording.find({ userId: decoded.userId });

  res.json(recordings);
}));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

<<<<<<< Updated upstream:server.ts
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
=======
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
>>>>>>> Stashed changes:backend/server.ts
