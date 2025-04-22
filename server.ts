require('dotenv').config();
const express = require('express')
const cors = require('cors')
const { handleSignUp, handleSignIn } = require('./src/lib/api/auth')

const app = express()
const PORT = process.env.PORT || 10000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.post('/api/auth/signup', handleSignUp)
app.post('/api/auth/login', handleSignIn)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`✅ Server accessible at http://0.0.0.0:${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
