import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { handleSignUp, handleSignIn } from './src/lib/api/auth';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

app.use(cors());
app.use(express.json());

app.post('/api/auth/signup', (req: Request, res: Response, next: NextFunction) => {
  handleSignUp(req, res).catch(next);
});
app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
  handleSignIn(req, res).catch(next);
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

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
