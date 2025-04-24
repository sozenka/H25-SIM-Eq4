import React, { useState, useEffect } from 'react'
import { X, Loader2, Mail, Lock, UserPlus, LogIn, Music, User, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const API_URL = import.meta.env.VITE_API_URL

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }

        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to sign up')

        setSuccess('Account created successfully! Please sign in.')
        setTimeout(() => {
          setIsSignUp(false)
          setSuccess(null)
        }, 2000)
      } else {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to sign in')

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onClose()
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gradient-to-br from-background via-background/95 to-background/90 border border-primary/20 rounded-2xl p-8 w-full max-w-md relative overflow-hidden"
        >
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 animate-gradient" />
          
          {/* Content */}
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-block p-4 rounded-full bg-primary/10 mb-4 relative"
              >
                <Music className="w-10 h-10 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {isSignUp ? 'Join MusicAI Studio' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400">
                {isSignUp
                  ? 'Create an account to start composing'
                  : 'Sign in to continue your musical journey'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all"
                    placeholder="Email address"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/20 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all"
                      placeholder="Username"
                      required
                    />
                  </div>
                )}

                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all"
                    placeholder="Password"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/20 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                >
                  <p className="text-green-400 text-sm">{success}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 relative overflow-hidden',
                  loading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isSignUp ? (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                }}
                className="w-full text-primary-light hover:text-primary text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSignUp ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Already have an account? Sign in
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Don't have an account? Sign up
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal