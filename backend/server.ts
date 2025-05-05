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
) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

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
    recordingId: recording.id
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

app.delete('/api/recordings/:id', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  const result = await Recording.deleteOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: decoded.id
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Recording not found or not authorized' });
  }

  res.status(200).json({ message: 'Recording deleted from DB' });
}));


app.patch('/api/recordings/:id', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { name, audioUrl } = req.body;

  if (!name || !audioUrl) {
    return res.status(400).json({ error: 'Missing name or audioUrl' });
  }

  const updated = await Recording.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      userId: decoded.id
    },
    { name, audioUrl },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ error: 'Recording not found or not authorized' });
  }

  res.status(200).json({ message: 'Recording updated', recording: updated });
}));

