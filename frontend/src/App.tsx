import React, { useState, useEffect } from 'react'
import { Music, Brain, AudioWaveform as Waveform, Mic, Settings as SettingsIcon, Home as HomeIcon, LogIn } from 'lucide-react'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Composition from './pages/Composition'
import AiSuggestions from './pages/AiSuggestions'
import SoundAnalysis from './pages/SoundAnalysis'
import Recordings from './pages/Recordings'
import Settings from './pages/Settings'
import AuthModal from './components/AuthModal'

type Page = 'home' | 'composition' | 'ai' | 'analysis' | 'recordings' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; username: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setCurrentPage('home')
  }

  const navItems = [
    { id: 'home', label: 'Accueil', icon: HomeIcon },
    { id: 'composition', label: 'Composition', icon: Music, requiresAuth: true },
    { id: 'ai', label: 'Suggestions IA', icon: Brain },
    { id: 'analysis', label: 'Analyse Sonore', icon: Waveform, requiresAuth: true },
    { id: 'recordings', label: 'Enregistrements', icon: Mic, requiresAuth: true },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon, requiresAuth: true },
  ]

  const handleNavigate = (page: string) => {
    const item = navItems.find(i => i.id === page)
    if (item?.requiresAuth && !user) {
      setIsAuthModalOpen(true)
    } else {
      setCurrentPage(page as Page)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onGetStarted={() => setIsAuthModalOpen(true)} />
      case 'composition':
        return user ? <Composition /> : <Home onGetStarted={() => setIsAuthModalOpen(true)} />
      case 'ai':
        return <AiSuggestions />
      case 'analysis':
        return user ? <SoundAnalysis /> : <Home onGetStarted={() => setIsAuthModalOpen(true)} />
      case 'recordings':
        return user ? <Recordings /> : <Home onGetStarted={() => setIsAuthModalOpen(true)} />
      case 'settings':
        return user ? <Settings /> : <Home onGetStarted={() => setIsAuthModalOpen(true)} />
      default:
        return <Home onGetStarted={() => setIsAuthModalOpen(true)} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navigation 
        items={navItems} 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        user={user}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}

export default App