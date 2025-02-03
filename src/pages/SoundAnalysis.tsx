import React from 'react'
import AudioVisualizer from '../components/AudioVisualizer'
import { useMusicStore } from '../store/musicStore'

const SoundAnalysis = () => {
  const { currentScale } = useMusicStore()

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Analyse Sonore</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Visualisation des Fréquences</h3>
            <AudioVisualizer />
          </div>

          <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Spectre Sonore</h3>
            <AudioVisualizer />
          </div>
        </div>

        <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">Analyse Harmonique</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Gamme Détectée</h4>
              <p className="text-purple-200">{currentScale} Majeur</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Accords Identifiés</h4>
              <p className="text-purple-200">CMaj7 - Am7 - Dm7 - G7</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Tempo</h4>
              <p className="text-purple-200">120 BPM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoundAnalysis