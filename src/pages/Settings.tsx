import React from 'react'

const Settings = () => {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Paramètres</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Personnalisation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 mb-2">Gamme par défaut</label>
              <select className="w-full bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200">
                <option>C Majeur</option>
                <option>A Mineur</option>
                <option>G Majeur</option>
              </select>
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Thème</label>
              <div className="flex space-x-4">
                <button className="flex-1 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors">
                  Mode Clair
                </button>
                <button className="flex-1 py-2 rounded-lg bg-purple-500 text-white">
                  Mode Sombre
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Configuration IA</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 mb-2">Niveau d'assistance</label>
              <select className="w-full bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200">
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Latence Audio</label>
              <input
                type="range"
                className="w-full"
                min="0"
                max="100"
                defaultValue="50"
              />
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Qualité Audio</label>
              <select className="w-full bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200">
                <option>Haute (48kHz)</option>
                <option>Moyenne (44.1kHz)</option>
                <option>Basse (22kHz)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings