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

// Configuration CORS pour autoriser les requêtes depuis le frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://h25-sim-eq4.vercel.app' // URL du frontend
  ],
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('✅ Connexion à MongoDB établie'))
  .catch(err => console.error('❌ Erreur de connexion à MongoDB:', err));

// Gestionnaire asynchrone pour les routes
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Routes d'authentification
app.post('/api/auth/signup', asyncHandler(handleSignUp));
app.post('/api/auth/login', asyncHandler(handleSignIn));

// Sauvegarder un enregistrement
app.post('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Non autorisé' });

  const { name, notes, duration, audioPath } = req.body;

  if (!duration || !notes || !audioPath) {
    return res.status(400).json({ error: 'Champs requis manquants' });
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
    message: 'Enregistrement sauvegardé avec succès',
    recordingId: recording._id.toString()
  });
}));

// Récupérer les enregistrements (envoie `id` au lieu de `_id`)
app.get('/api/recordings', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Non autorisé' });

  const recordings = await Recording.find({ userId: decoded.id });

  const result = recordings.map(r => ({
    ...r.toObject(),
    id: r._id.toString()
  }));

  res.status(200).json(result);
}));

// Supprimer un enregistrement en utilisant _id
app.delete('/api/recordings/:id', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Non autorisé' });

  const { id } = req.params;

  const result = await Recording.deleteOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: decoded.id
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Enregistrement non trouvé ou non autorisé' });
  }

  res.status(200).json({ message: 'Enregistrement supprimé de la base de données' });
}));

// Mettre à jour un enregistrement en utilisant _id
app.patch('/api/recordings/:id', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Non autorisé' });

  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nom manquant' });
  }

  const updated = await Recording.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), userId: decoded.id },
    { name },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ error: 'Enregistrement non trouvé ou non autorisé' });
  }

  res.status(200).json({ message: 'Enregistrement renommé', recording: updated });
}));

// Mettre à jour les informations de l'utilisateur
app.patch('/api/user/update', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = token && verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Non autorisé' });

  const { field, value } = req.body;

  if (!['email', 'username', 'password'].includes(field)) {
    return res.status(400).json({ error: 'Champ invalide' });
  }

  const updateData: any = {};
  updateData[field] = value;

  if (field === 'password') {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(value, 10);
    updateData[field] = hashed;
  }

  const updatedUser = await User.findByIdAndUpdate(decoded.id, updateData, { new: true });
  if (!updatedUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  res.status(200).json({
    message: 'Utilisateur mis à jour avec succès',
    user: {
      id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username
    }
  });
}));

// Vérification de l'état du serveur
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Gestionnaire d'erreurs global
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur Interne du Serveur', details: err?.message || err });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur en cours d'exécution sur http://0.0.0.0:${PORT}`);
});
