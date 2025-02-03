import React from 'react'

const AiSuggestions = () => {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Suggestions IA</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Préférences Musicales</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 mb-2">Style Musical</label>
              <select className="w-full bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200">
                <option>Jazz</option>
                <option>Classical</option>
                <option>Pop</option>
                <option>Rock</option>
              </select>
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Tempo</label>
              <input
                type="range"
                className="w-full"
                min="60"
                max="200"
                defaultValue="120"
              />
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Émotion</label>
              <select className="w-full bg-black/20 border border-purple-500/20 rounded-lg p-2 text-purple-200">
                <option>Joyeux</option>
                <option>Mélancolique</option>
                <option>Énergique</option>
                <option>Calme</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">Suggestions</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Progression d'accords</h4>
              <p className="text-purple-200">Cm7 - F7 - BbMaj7 - EbMaj7</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Rythme suggéré</h4>
              <p className="text-purple-200">Swing - 120 BPM</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h4 className="text-purple-300 font-medium mb-2">Structure recommandée</h4>
              <p className="text-purple-200">AABA - 32 mesures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiSuggestions