import React, { useState, useRef, useEffect } from 'react'
import { Upload, Link, Music, Play, Pause, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioVisualizer from '../components/AudioVisualizer'
import { useMusicStore } from '../store/musicStore'

const SoundAnalysis = () => {
  const { currentScale, recordings, analyzeAudio } = useMusicStore()
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysis, setAnalysis] = useState<{
    scale: string;
    chords: string[];
    tempo: number;
  } | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file)
        setAudioUrl(URL.createObjectURL(file))
        setError('')
        
        // Analyze the uploaded audio
        try {
          const arrayBuffer = await file.arrayBuffer()
          const result = await analyzeAudio(arrayBuffer)
          setAnalysis(result)
        } catch (err) {
          console.error('Error analyzing audio:', err)
          setError('Failed to analyze audio file')
        }
      } else {
        setError('Please upload an audio file (MP3, WAV, etc.)')
      }
    }
  }

  const handleYoutubeUrl = async () => {
    if (!youtubeUrl) {
      setError('Please enter a YouTube URL')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/youtube/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      })

      if (!response.ok) throw new Error('Failed to process YouTube URL')

      const blob = await response.blob()
      setAudioUrl(URL.createObjectURL(blob))
      
      // Analyze the YouTube audio
      const arrayBuffer = await blob.arrayBuffer()
      const result = await analyzeAudio(arrayBuffer)
      setAnalysis(result)
      setError('')
    } catch (err) {
      setError('Failed to process YouTube URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordingSelect = async (recording: any) => {
    if (recording.audioData) {
      setAudioUrl(URL.createObjectURL(new Blob([recording.audioData])))
      const result = await analyzeAudio(recording.audioData)
      setAnalysis(result)
    }
  }

  const clearAudio = () => {
    setAudioUrl('')
    setAudioFile(null)
    setYoutubeUrl('')
    setAnalysis(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-8">Analyse Sonore</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Importer un fichier audio</h3>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-purple-500/40 rounded-lg cursor-pointer hover:border-purple-500/60 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <span className="text-purple-200">Cliquez pour choisir un fichier audio</span>
                </div>
              </label>
            </div>
          </div>

          {/* YouTube URL Section */}
          <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Lien YouTube</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Collez le lien YouTube ici"
                  className="flex-1 bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300/50 focus:border-purple-500/50 focus:ring focus:ring-purple-500/20 transition-all"
                />
                <button
                  onClick={handleYoutubeUrl}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  {isLoading ? 'Chargement...' : 'Analyser'}
                </button>
              </div>
            </div>
          </div>

          {/* Recordings Section */}
          <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Mes Enregistrements</h3>
            <div className="space-y-2">
              {recordings.map((recording) => (
                <button
                  key={recording.id}
                  onClick={() => handleRecordingSelect(recording)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-200">{recording.name}</span>
                  </div>
                  <Play className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Visualization Section */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <button
                onClick={clearAudio}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <AudioVisualizer audioUrl={audioUrl} />
            </motion.div>
          )}

          {/* Analysis Results */}
          <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Analyse Harmonique</h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <h4 className="text-purple-300 font-medium mb-2">Gamme Détectée</h4>
                <p className="text-purple-200">{analysis?.scale || currentScale} Majeur</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <h4 className="text-purple-300 font-medium mb-2">Accords Identifiés</h4>
                <p className="text-purple-200">
                  {analysis?.chords ? analysis.chords.join(' - ') : 'En attente d\'analyse...'}
                </p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <h4 className="text-purple-300 font-medium mb-2">Tempo</h4>
                <p className="text-purple-200">{analysis?.tempo || '---'} BPM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  )
}

export default SoundAnalysis