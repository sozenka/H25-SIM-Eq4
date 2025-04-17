import React, { useState } from 'react'
import Piano from '../components/Piano'
import { useMusicStore } from '../store/musicStore'
import { Play, Pause, Save, Music, CircleDot } from 'lucide-react'
import { motion } from 'framer-motion'

const Composition = () => {
  const {
    startRecording,
    stopRecording,
    playRecording,
    recording,
    recordings,
    addRecording,
  } = useMusicStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [colonneActuelle, setColonneActuelle] = useState<number | null>(null)
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [recordWhilePlaying, setRecordWhilePlaying] = useState(false)

  const changerEtatNote = (row: number, col: number) => {
    const carre = `${row}:${col}`
    setActiveNotes(prev => {
      const newSet = new Set(prev)
      newSet.has(carre) ? newSet.delete(carre) : newSet.add(carre)
      return newSet
    })
  }

  const handleKeyPress = () => {}

  const playPianoRoll = () => {
    let col = 0
    setIsPlaying(true)

    if (recordWhilePlaying && !recording) startRecording()

    const interval = setInterval(() => {
      setColonneActuelle(col)
      col++

      if (col >= 100) {
        clearInterval(interval)
        setColonneActuelle(null)
        setIsPlaying(false)

        if (recordWhilePlaying && recording) {
          stopRecording().then(data => {
            if (data) {
              addRecording({
                id: Date.now().toString(),
                userId: data.userId,
                name: `Composition ${recordings.length + 1}`,
                duration: data.duration,
                createdAt: data.createdAt,
                notes: data.notes,
                audioData: data.audioData,
              })
            }
          })
        }
      }
    }, 200)
  }

  const handleRecordingToggle = async () => {
    if (recording) {
      const data = await stopRecording();
      if (data) addRecording(data);
    } else {
      startRecording();
    }
  };
  

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Studio de Composition</h2>

      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={handleRecordingToggle}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            recording ? 'bg-red-600' : 'bg-purple-600'
          } text-white`}
        >
          {recording ? (
            <>
              <Save className="w-5 h-5" /> Sauvegarder
            </>
          ) : (
            <>
              <Music className="w-5 h-5" /> Enregistrer
            </>
          )}
        </motion.button>

        <label className="text-purple-300 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={recordWhilePlaying}
            onChange={() => setRecordWhilePlaying(!recordWhilePlaying)}
          />
          Enregistrer pendant la lecture
        </label>
      </div>

      <div className="grid md:grid-cols-[4fr_1fr] gap-6">
        <div className="h-[700px] w-full overflow-x-auto overflow-y-auto scroll-smooth whitespace-nowrap">
          <div className="flex h-full">
            <div className="flex-shrink-0 min-h-[700px]">
              <Piano onKeyPress={handleKeyPress} />
            </div>

            <div
              className="bg-black/20 p-4 rounded-lg border border-purple-500/20 flex-shrink-0"
              style={{ width: '200%', height: '1700px' }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: 'repeat(100, 35px)',
                  gridTemplateRows: 'repeat(48, 35px)',
                }}
              >
                {Array.from({ length: 48 * 100 }).map((_, index) => {
                  const row = Math.floor(index / 100)
                  const col = index % 100
                  const carre = `${row}:${col}`
                  const isActive = activeNotes.has(carre)
                  const isColonneAct = col === colonneActuelle
                  return (
                    <div
                      key={index}
                      onClick={() => changerEtatNote(row, col)}
                      className={`border border-gray-300 cursor-pointer ${
                        isColonneAct
                          ? 'bg-pink-400 animate-pulse'
                          : isActive
                          ? 'bg-blue-500'
                          : 'bg-purple-700'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Lecture</h3>
            <button
              onClick={isPlaying ? () => setIsPlaying(false) : playPianoRoll}
              className={`w-full py-2 rounded ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isPlaying ? 'Arrêter la lecture' : 'Démarrer la lecture'}
            </button>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Mes Enregistrements</h3>
            <div className="space-y-2">
              {recordings.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="bg-purple-500/10 hover:bg-purple-500/20 p-3 rounded-lg flex justify-between items-center cursor-pointer"
                  onClick={() => useMusicStore.getState().playRecording(rec)}
                >
                  <div>
                    <p className="text-purple-200 font-medium">{rec.name}</p>
                    <p className="text-purple-300 text-sm">
                      {new Date(rec.createdAt).toLocaleDateString()} • {rec.duration}
                    </p>
                  </div>
                  <Play className="text-purple-400 w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Composition
