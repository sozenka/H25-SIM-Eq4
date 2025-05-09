import React, { useState, useRef, useEffect } from 'react'
import { Upload, Link, Music, Play, Pause, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioVisualizer from '../components/AudioVisualizer'
import { useMusicStore } from '../store/musicStore'
import type { Recording } from '../store/musicStore'
import { supabase } from '../store/musicStore';
const SoundAnalysis = () => {
  const { currentScale, recordings, analyzeAudio } = useMusicStore()
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [audioBuffer, setAudioBuffer] = useState<ArrayBuffer | null>(null)
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
  
  const handleRecordingSelect = async (recording: Recording) => {
    try {
      let arrayBuffer: ArrayBuffer;
  
      if (recording.audioData) {
        arrayBuffer = recording.audioData;
      } else if (recording.audioUrl) {
        // ✅ FIX: derive file path from audioUrl
        const parts = recording.audioUrl.split('/recordings/');
        if (parts.length < 2) throw new Error('Invalid audio URL format');
  
        const audioPath = parts[1]; // this is what Supabase expects
  
        const { data, error } = await supabase
          .storage
          .from('recordings')
          .createSignedUrl(audioPath, 60); // signed for 60 sec
  
        if (error || !data?.signedUrl) {
          throw new Error('Failed to get signed URL from Supabase');
        }
  
        const response = await fetch(data.signedUrl);
        if (!response.ok) throw new Error(`Bad response (${response.status})`);
  
        const contentType = response.headers.get('Content-Type');
        if (!contentType?.startsWith('audio/')) {
          const preview = await response.clone().text();
          throw new Error(`Invalid content-type: ${contentType}\nPreview: ${preview.slice(0, 100)}`);
        }
  
        const blob = await response.blob();
        arrayBuffer = await blob.arrayBuffer();
      } else {
        throw new Error('No audio data or URL provided');
      }
  
      // ✅ Decode to make sure it works before analyzing
      const audioCtx = new AudioContext();
      await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      setAudioUrl(URL.createObjectURL(blob));
      setAudioBuffer(arrayBuffer);
  
      const result = await analyzeAudio(arrayBuffer);
      setAnalysis(result);
      setError('');
    } catch (err: any) {
      console.error('❌ Error analyzing recording:', err);
      setError(`⚠️ ${err.message || 'Failed to decode or analyze this recording.'}`);
    }
  };
  
  const clearAudio = () => {
    setAudioUrl('')
    setAudioFile(null)
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