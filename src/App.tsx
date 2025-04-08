import React, { useState } from 'react'
import { Music, Brain, AudioWaveform as Waveform, Settings as SettingsIcon, Home as HomeIcon } from 'lucide-react'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Composition from './pages/Composition'
import AiSuggestions from './pages/AiSuggestions'
import SoundAnalysis from './pages/SoundAnalysis'
import Settings from './pages/Settings'
import Login from './pages/Login'

type Page = 'home' | 'composition' | 'ai' | 'analysis' | 'recordings' | 'settings' | 'login'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const navItems = [
    { id: 'home', label: 'Accueil', icon: HomeIcon },
    { id: 'composition', label: 'Composition', icon: Music },
    { id: 'ai', label: 'Suggestions IA', icon: Brain },
    { id: 'analysis', label: 'Analyse Sonore', icon: Waveform },
    { id: 'settings', label: "Votre compte", icon: SettingsIcon },

  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'composition':
        return <Composition />
      case 'ai':
        return <AiSuggestions />
      case 'analysis':
        return <SoundAnalysis />
      case 'settings':
        return <Settings />
      case 'login':
        return <Login/>
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {currentPage !== 'login' && (
        <Navigation items={navItems} currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  )
}

export default App