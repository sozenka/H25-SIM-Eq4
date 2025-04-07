import React from 'react'
import {Music, Brain, AudioWaveform as Waveform } from 'lucide-react'

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-6">
          Composez avec l'Intelligence Artificielle
        </h1>
        <p className="text-xl text-purple-200 max-w-3xl mx-auto">
          Découvrez une nouvelle façon de composer de la musique avec notre studio virtuel
          alimenté par l'IA. Parfait pour les débutants comme pour les professionnels.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
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
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
          >
            <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-purple-200">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors">
          Commencer une composition
          
        </button>
      </div>
    </div>
  )
}

export default Home