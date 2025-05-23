import React from 'react'
import { Music, LogIn, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Interface pour les éléments de navigation
interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  requiresAuth?: boolean
}

// Interface pour les propriétés du composant Navigation
interface NavigationProps {
  items: NavItem[]
  currentPage: string
  onNavigate: (page: string) => void
  user: { id: string; email: string; username: string } | null
  onLogin: () => void
  onLogout: () => void
  isMobileMenuOpen: boolean
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  currentPage,
  onNavigate,
  user,
  onLogin,
  onLogout,
  isMobileMenuOpen
}) => {
  return (
    <>
      {/* Navigation sur ordinateur */}
      <nav className="hidden md:block bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">HarmonIA</span>
            </div>

            <div className="flex items-center space-x-4">
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

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-purple-300">{user.username}</span>
                  <motion.button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-purple-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={onLogin}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-[57px] bg-black/95 backdrop-blur-lg border-b border-white/10 z-50"
          >
            <div className="px-4 py-2">
              {items.map((item) => {
                const Icon = item.icon
                if (item.requiresAuth && !user) return null
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors
                      ${currentPage === item.id
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-gray-300 hover:bg-purple-500/10'
                      }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                )
              })}

              {user ? (
                <div className="border-t border-white/10 mt-2 pt-2">
                  <div className="px-4 py-2 text-purple-300">{user.username}</div>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-purple-500/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={onLogin}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Connexion</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navigation