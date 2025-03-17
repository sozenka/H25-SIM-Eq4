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
              <label className="block text-purple-200 mb-2"> Thème</label>
              <div className="flex space-x-4">
                <button className="flex-1 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors">
                  Mode Clair
                </button>
                <button className="flex-1 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors">
                  Mode Sombre
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Configuration de l'intelligence artificielle</h3>
          <div className="space-y-4">
            <div>
              <input type="checkbox" checked/>
              <span className="slider round"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings