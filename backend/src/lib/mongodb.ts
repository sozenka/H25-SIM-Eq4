import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = 'mongodb+srv://sozenka:xfDqdhFOvdTvOSf0@cluster0.pqkukyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
interface IUser extends mongoose.Document {
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  generateAuthToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Recording Schema
const recordingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  notes: [{ note: String, time: Number }],
  audioPath: { type: String, required: true },
  duration: String,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// User methods
userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ id: this.id }, JWT_SECRET, { expiresIn: '7d' });
};

userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

// Models
export const User = mongoose.model('User', userSchema);
export const Recording = mongoose.model('Recording', recordingSchema);

// Auth functions
export const signUp = async (email: string, username: string, password: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const user = await User.create({ email, username, password });
  const token = user.generateAuthToken();
  
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    },
    token
  };
};

export const signIn = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Courriel ou mot de passe incorrect');
  }
  
  const token = user.generateAuthToken();
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    },
    token
  };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch (error) {
    return null;
  }
}