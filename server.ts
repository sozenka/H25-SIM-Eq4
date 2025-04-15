const express = require('express')
const cors = require('cors')
const { handleSignUp, handleSignIn } = require('./src/lib/api/auth')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/api/auth/signup', handleSignUp)
app.post('/api/auth/login', handleSignIn)

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
