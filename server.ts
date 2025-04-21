require('dotenv').config();
const express = require('express')
const cors = require('cors')
const { handleSignUp, handleSignIn } = require('./src/lib/api/auth')

const app = express()
const PORT = process.env.PORT || 5000

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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
