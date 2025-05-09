import React, { useEffect, useState } from 'react'
import { Play, Trash2, Download, Edit2, Check, X } from 'lucide-react'
import { useMusicStore } from '../store/musicStore'
import { motion, AnimatePresence } from 'framer-motion'
import type { Recording } from '../store/musicStore'
import { downloadRecording } from '../utils/audio'

// Helper function to convert Base64 to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const Recordings = () => {
  const { recordings, playRecording, loadRecordings, deleteRecording, updateRecordingName } = useMusicStore()
  const [editingRecordingId, setEditingRecordingId] = useState<string | null>(null)
  const [newRecordingName, setNewRecordingName] = useState('')

  useEffect(() => {
    loadRecordings()
  }, [loadRecordings])

  const handlePlayRecording = async (recording: Recording) => {
    try {
      await playRecording(recording)
    } catch (error) {
      console.error('Error playing recording:', error)
    }
  }

  const handleDeleteRecording = (recordingId: string) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      deleteRecording(recordingId)
    }
  }

  const handleRenameRecording = (recordingId: string, newName: string) => {
    if (newName.trim()) {
      updateRecordingName(recordingId, newName.trim())
      setEditingRecordingId(null)
      setNewRecordingName('')
    }
  }

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
            recordings.map((recording) => (
              <motion.div
                key={recording.id || recording.name || Math.random().toString(36)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-purple-500/10 hover:bg-purple-500/20 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  {editingRecordingId === recording.id ? (
                    <input
                      type="text"
                      value={newRecordingName}
                      onChange={(e) => setNewRecordingName(e.target.value)}
                      className="bg-white/10 text-white px-2 py-1 rounded w-full"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-purple-200 font-medium">{recording.name}</h3>
                  )}
                  <p className="text-purple-300 text-sm">
                    {new Date(recording.createdAt).toLocaleDateString()} • {recording.duration}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlayRecording(recording)}
                    className="p-2 text-purple-400 hover:text-purple-300"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  {editingRecordingId === recording.id ? (
                    <>
                      <button
                        onClick={() => handleRenameRecording(recording.id, newRecordingName)}
                        className="p-2 text-green-400 hover:text-green-300"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRecordingId(null)
                          setNewRecordingName('')
                        }}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingRecordingId(recording.id)
                          setNewRecordingName(recording.name)
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="p-2 text-purple-400 hover:text-purple-300"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecording(recording.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
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