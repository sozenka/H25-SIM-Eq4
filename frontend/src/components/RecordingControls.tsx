import React, { useState } from 'react';
import { useMusicStore } from '../store/musicStore';

interface RecordingControlsProps {
  onPlayPause: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ onPlayPause, onPause, isPlaying }) => {
  const {
    recording,
    startRecording,
    stopRecording,
    playRecording,
    recordings,
    recordingNotes,
    currentRecordingStartTime,
  } = useMusicStore();

  const [recordDuringPlayback, setRecordDuringPlayback] = useState(false);

  const handleRecord = async () => {
    if (recording) {
      const newRecording = await stopRecording();
      if (newRecording) {
        console.log('Recording saved:', newRecording);
      }
    } else {
      startRecording();
    }
  };

  const handleReset = () => {
    if (recording) {
      stopRecording();
    }
    useMusicStore.getState().instrument?.releaseAll();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      if (recordDuringPlayback) {
        startRecording();
      }
      onPlayPause();
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-white">Enregistrement</span>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleRecord}
          className={`px-4 py-2 rounded-lg ${
            recording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-semibold transition-colors`}
        >
          {recording ? 'Arrêter' : 'Démarrer'}
        </button>
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
        >
          {isPlaying ? 'Pause' : 'Démarrer la lecture'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="recordDuringPlayback"
          checked={recordDuringPlayback}
          onChange={(e) => setRecordDuringPlayback(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label htmlFor="recordDuringPlayback" className="text-sm text-white">
          Enregistrer pendant la lecture
        </label>
      </div>

      {recording && (
        <div className="text-red-500 font-semibold animate-pulse">
          Enregistrement en cours...
        </div>
      )}

      {/* Recordings List */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white mb-2">Enregistrements</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-white">{rec.name}</h4>
                  <p className="text-sm text-gray-300">
                    Durée: {rec.duration} • {new Date(rec.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => playRecording(rec)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Écouter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecordingControls; 