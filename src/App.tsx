import React, { useState } from 'react'
import { Music, Brain, AudioWaveform as Waveform, Settings as SettingsIcon, Home as HomeIcon } from 'lucide-react'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Composition from './pages/Composition'
import AiSuggestions from './pages/AiSuggestions'
import SoundAnalysis from './pages/SoundAnalysis'
import Settings from './pages/Settings'

type Page = 'home' | 'composition' | 'ai' | 'analysis' | 'recordings' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const navItems = [
    { id: 'home', label: 'Accueil', icon: HomeIcon },
    { id: 'composition', label: 'Composition', icon: Music },
    { id: 'ai', label: 'Suggestions IA', icon: Brain },
    { id: 'analysis', label: 'Analyse Sonore', icon: Waveform },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
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
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navigation items={navItems} currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  )
}

export default App