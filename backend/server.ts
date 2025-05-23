import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { handleSignUp, handleSignIn } from './src/lib/api/auth';
import { Recording, verifyToken } from './src/lib/mongodb';
import { User } from './src/lib/mongodb';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://h25-sim-eq4.vercel.app' // replace with your actual frontend URL
  ],
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

  const { name, notes, duration, audioPath } = req.body;

  if (!duration || !notes || !audioPath) {
    return res.status(400).json({ error: 'Missing required fields' });
  }  

  const recording = new Recording({
    userId: decoded.id,
    name: name,
    notes,
    duration,
    audioPath,
    createdAt: new Date()
  });  

  await recording.save();

  res.status(201).json({
    message: 'Recording saved successfully',
    recordingId: recording._id.toString()
  });
}));

// ✅ Fetch recordings (send `id` instead of `_id`)
app.get('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const recordings = await Recording.find({ userId: decoded.id });

  const result = recordings.map(r => ({
    ...r.toObject(),
    id: r._id.toString()
  }));

  res.status(200).json(result);
}));

// ✅ Delete a recording using _id
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

// ✅ Update a recording using _id
app.patch('/api/recordings/:id', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  const updated = await Recording.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), userId: decoded.id },
    { name },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ error: 'Recording not found or not authorized' });
  }

  res.status(200).json({ message: 'Recording renamed', recording: updated });
}));

app.patch('/api/user/update', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { field, value } = req.body;

  if (!['email', 'username', 'password'].includes(field)) {
    return res.status(400).json({ error: 'Invalid field' });
  }

  const updateData: any = {};
  updateData[field] = value;

  if (field === 'password') {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(value, 10);
    updateData[field] = hashed;
  }

  const updatedUser = await User.findByIdAndUpdate(decoded.id, updateData, { new: true });
  if (!updatedUser) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({
    message: 'User updated successfully',
    user: {
      id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username
    }
  });
}));

// ✅ Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ✅ Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
