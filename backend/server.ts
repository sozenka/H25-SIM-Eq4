import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { handleSignUp, handleSignIn } from './src/lib/api/auth';
import { Recording, verifyToken } from './src/lib/mongodb';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Async wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req, res, next) => fn(req, res, next).catch(next);

// ✅ Auth routes
app.post('/api/auth/signup', asyncHandler(handleSignUp));
app.post('/api/auth/login', asyncHandler(handleSignIn));

// ✅ Save recording
app.post('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { title, notes, audioUrl, duration } = req.body;

  if (!audioUrl || !duration || !notes) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const recording = new Recording({
    userId: decoded.id,
    name: title,
    notes,
    duration,
    createdAt: new Date()
  });

  await recording.save();

  res.status(201).json({
    message: 'Recording saved successfully',
    recordingId: recording._id
  });
}));

// ✅ Fetch recordings
app.get('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const recordings = await Recording.find({ userId: decoded.id });
  res.status(200).json(recordings);
}));

// ✅ Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ✅ Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
