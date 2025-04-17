import React, { useState } from 'react'
import Piano from '../components/Piano'
import { useMusicStore } from '../store/musicStore'
import { Play, Pause, Save, Music } from 'lucide-react'
import { motion } from 'framer-motion'

const Composition = () => {
  const PIANO_HEIGHT = 40
  const nombresKeys = [1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25, 27, 29, 30, 32, 34, 36, 37, 39, 41, 42, 44, 46, 48]
  const nombresBlackKeys = [2, 4, 7, 9, 11, 14, 16, 19, 21, 23, 26, 28, 31, 33, 35, 38, 40, 43, 45, 47]

  const {
    startRecording,
    stopRecording,
    recording,
    addRecording,
    recordings
  } = useMusicStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [colonneActuelle, setColonneActuelle] = useState<number | null>(null)
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())

  const changerEtatNote = (row: number, col: number) => {
    const carre = `${row}:${col}`
    setActiveNotes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(carre)) {
        newSet.delete(carre)
      } else {
        newSet.add(carre)
      }
      return newSet
    })
  }

  const handleKeyPress = (keyIndex: number, isBlackKey: boolean) => {
    // log key presses if needed
  }

  const playPianoRoll = () => {
    let col = 0
    setIsPlaying(true)
    const interval = setInterval(() => {
      setColonneActuelle(col)
      col++
      if (col >= 100) {
        clearInterval(interval)
        setColonneActuelle(null)
        setIsPlaying(false)
      }
    }, 200)
  }

  const handleRecordingToggle = async () => {
    if (recording) {
      const recordingData = await stopRecording()
      addRecording({
        id: Date.now(),
        name: `Composition ${recordings.length + 1}`,
        duration: recordingData?.duration || '2:00',
        date: new Date().toISOString().split('T')[0],
        ...recordingData
      })
    } else {
      startRecording()
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Studio de Composition</h2>

      <div className="flex items-center justify-end mb-4 gap-4">
        <motion.button
          onClick={handleRecordingToggle}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            recording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-purple-500 hover:bg-purple-600'
          } text-white`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {recording ? (
            <>
              <Save className="w-5 h-5" />
              Sauvegarder
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </motion.button>
      </div>

      <div className="grid md:grid-cols-[4fr_1fr] gap-6">
        <div className="h-[700px] w-full overflow-x-auto overflow-y-auto scroll-smooth whitespace-nowrap">
          <div className="flex h-full">
            <div className="flex-shrink-0 min-h-[700px]">
              <Piano onKeyPress={handleKeyPress} />
            </div>

            <div
              className="bg-black/20 p-4 rounded-lg border border-purple-500/20 flex-shrink-0"
              style={{ width: "200%", height: "1700px" }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(100, 35px)",
                  gridTemplateRows: "repeat(48, 35px)"
                }}
              >
                {Array.from({ length: 48 * 100 }).map((_, index) => {
                  const row = Math.floor(index / 100)
                  const col = index % 100
                  const carre = `${row}:${col}`
                  const isDarkRow = nombresBlackKeys.includes(row + 1)
                  const isActive = activeNotes.has(carre)
                  const isColonneAct = col === colonneActuelle

                  return (
                    <div
                      key={index}
                      onClick={() => changerEtatNote(row, col)}
                      className={`border border-gray-300 cursor-pointer transition-colors duration-75
                        ${
                          isColonneAct
                            ? "bg-pink-400 animate-pulse"
                            : isActive
                            ? "bg-blue-500 hover:bg-blue-600"
                            : isDarkRow
                            ? "bg-purple-700 hover:bg-purple-600"
                            : "bg-purple-500 hover:bg-purple-600"
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
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white transition-colors`}
            >
              {isPlaying ? "Arrêter la lecture" : "Démarrer la lecture"}
            </button>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Mes Enregistrements</h3>
            <div className="space-y-2">
              {recordings.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="bg-purple-500/10 hover:bg-purple-500/20 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-purple-200 font-medium">{rec.name}</p>
                    <p className="text-purple-300 text-sm">{rec.duration}</p>
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
