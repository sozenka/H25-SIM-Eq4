import React from 'react'
import { Play, Trash2, Download } from 'lucide-react'
import { useMusicStore } from '../store/musicStore'
import { motion, AnimatePresence } from 'framer-motion'

const Recordings = () => {
  const { recordings, playRecording } = useMusicStore()

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Mes Enregistrements</h2>

      <AnimatePresence>
        <div className="space-y-4">
          {recordings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 p-6 rounded-lg border border-purple-500/20 text-center"
            >
              <p className="text-purple-300">Aucun enregistrement pour le moment</p>
              <p className="text-purple-200 text-sm mt-2">
                Allez dans le Studio de Composition pour créer votre premier enregistrement
              </p>
            </motion.div>
          ) : (
            recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 p-4 rounded-lg border border-purple-500/20 flex items-center justify-between group hover:border-purple-500/40 transition-all"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{recording.name}</h3>
                  <p className="text-purple-300 text-sm">
                    {new Date(recording.createdAt).toLocaleDateString()} • {recording.duration}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => playRecording(recording)}
                    className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  )
}

export default Recordings