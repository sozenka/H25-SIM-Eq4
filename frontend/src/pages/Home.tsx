import React from 'react'
import { Music, Brain, KeyboardMusic, AudioWaveform as Waveform, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Navigation from './components/Navigation'
import { User } from '@supabase/supabase-js'

interface HomeProps {
  user: User | null
  onGetStarted: () => void
  setCurrentPage: (page: string) => void
}

// Pour avoir accès à la page de composition, il faut être connecté
const Home: React.FC<HomeProps> = ({ user, onGetStarted, setCurrentPage }) => {
  const handleStartComposition = () => {
    if (user) { // Si l'utilisateur est connecté, on le redirige vers la page de composition
      setCurrentPage('composition');
    } else {
      onGetStarted(); // Affiche l'authentification de connexion
    }
  };
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-white mb-6">
          Composez avec l'Intelligence Artificielle
        </h1>
        <p className="text-xl text-purple-200 max-w-3xl mx-auto">
          Découvrez une nouvelle façon de composer de la musique avec notre studio virtuel
          alimenté par l'IA. Parfait pour les débutants comme pour les professionnels.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-4 gap-8 mb-16"
      >
        {[
          {
            icon: Music,
            title: 'Studio Virtuel',
            description:
              'Un clavier virtuel interactif avec des suggestions visuelles pour vous guider dans votre composition.',
          },
          {
            icon: Brain,
            title: 'IA Musicale',
            description:
              'Obtenez des suggestions personnalisées basées sur vos préférences musicales et votre style.',
          },
          {
            icon: Waveform,
            title: 'Analyse Sonore',
            description:
              'Visualisez et analysez vos compositions en temps réel avec des outils professionnels.',
          },
          {
            icon: KeyboardMusic,
            title: 'Synthétiseur',
            description:
              "Une initiation à la synthèse sonore de base avec visualisation de l'onde audio."
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
          >
            <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-purple-200">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <motion.button
          onClick={handleStartComposition} // Authentification de connexion
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto gap-2 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Commencer une composition</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        <motion.button
          onClick={() => window.open('/synth.html', '_blank')} // Ouvre le synthétiseur dans un nouvel onglet
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto gap-2 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Essayer le synthétiseur</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Home