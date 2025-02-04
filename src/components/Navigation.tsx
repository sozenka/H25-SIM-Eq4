import type { LucideIcon } from 'lucide-react'
import { Music } from 'lucide-react'
import React from 'react'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

interface NavigationProps {
  items: NavItem[]
  currentPage: string
  onNavigate: (page: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ items, currentPage, onNavigate }) => {
  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Music className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">HarmonIA</span>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${
                        currentPage === item.id
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation