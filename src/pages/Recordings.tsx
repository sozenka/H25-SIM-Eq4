import React from 'react'
import { Play, Trash2, Download } from 'lucide-react'

const Recordings = () => {
  const recordings = [
    { id: 1, name: 'Composition Jazz #1', date: '2024-03-10', duration: '2:45' },
    { id: 2, name: 'Mélodie Piano', date: '2024-03-09', duration: '1:30' },
    { id: 3, name: 'Progression d\'accords', date: '2024-03-08', duration: '3:15' },
  ]

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Mes Enregistrements</h2>

      <div className="space-y-4">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="bg-black/20 p-4 rounded-lg border border-purple-500/20 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{recording.name}</h3>
              <p className="text-purple-300 text-sm">
                {recording.date} • {recording.duration}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Recordings