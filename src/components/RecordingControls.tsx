import React from 'react';
import { useMusicStore } from '../store/musicStore';

const RecordingControls: React.FC = () => {
  const {
    recording,
    startRecording,
    stopRecording,
    playRecording,
    recordings,
    recordingNotes,
    currentRecordingStartTime,
  } = useMusicStore();

  const handleRecord = async () => {
    if (recording) {
      const newRecording = await stopRecording();
      if (newRecording) {
        // The recording will be automatically added to the store
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

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex space-x-4">
        <button
          onClick={handleRecord}
          className={`px-4 py-2 rounded-lg ${
            recording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-semibold transition-colors`}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
      {recording && (
        <div className="text-red-500 font-semibold animate-pulse">
          Recording in progress...
        </div>
      )}
    </div>
  );
};

export default RecordingControls; 