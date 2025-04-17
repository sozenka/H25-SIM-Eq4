import React from 'react'
import { Music, LogIn, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from '/src/Logo.png'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  requiresAuth?: boolean
}

interface NavigationProps {
  items: NavItem[]
  currentPage: string
  onNavigate: (page: string) => void
  user: { id: string; email: string; username: string } | null
  onLogin: () => void
  onLogout: () => void
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  currentPage,
  onNavigate,
  user,
  onLogin,
  onLogout
}) => {
  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="HarmonIA Logo" className="w-12 h-12 object-contain" />
            <span className="text-xl font-bold text-white">HarmonAI</span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {items.map((item) => {
              const Icon = item.icon
              if (item.requiresAuth && !user) return null
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative
                    ${currentPage === item.id
                      ? 'text-purple-300'
                      : 'text-gray-300 hover:text-purple-300'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {currentPage === item.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-purple-500/20 rounded-md -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-purple-300">{user.username}</span>
                <motion.button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-purple-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation