import React, { useState } from 'react'

const Login = () => {
  const [username, setusername] = useState('')
  const [password, setPassword] = useState('')

  const validEmail = 'Jeremy Chheang'
  const validPassword = '2243711'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username === validEmail && password === validPassword) {
        setCurrentPage('home')  // Navigate to home page if login is successful
        setError('')  // Clear error message
      } else {
        setError('Identifiants incorrects, veuillez réessayer.')  // Set error message if login fails
      }
    
    console.log('Logging in with:', username, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Connexion</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-white mb-1" htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="usename"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nom utilisateur"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white mb-1" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors" onClick={handleLogin} >
            Se connecter
          </button>
        </form>
        <p className="mt-4 text-center text-white text-sm">
          Pas encore de compte ? <span className="underline cursor-pointer hover:text-purple-300">Créer un compte</span>
        </p>
      </div>
    </div>
  )
}

export default Login
