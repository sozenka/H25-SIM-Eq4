import React, { useState, useRef, useEffect } from "react";
import Piano from "../components/Piano";
import { useMusicStore, supabase } from "../store/musicStore";
import { Play, Pause, Save, Music, CircleDot, RotateCcw, Trash2, Edit2, Check, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Recording } from '../store/musicStore';
import * as Tone from 'tone';
import { Session } from '@supabase/supabase-js';

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

const Composition = () => {
  const PIANO_HEIGHT = 40; //a changer au besoin
  const nombresKeys = [
    1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25, 27, 29, 30, 32, 34,
    36, 37, 39, 41, 42, 44, 46, 48,
  ];
  const nombreKeys2 = [3, 8, 10, 15, 20, 22, 27, 32, 34, 39, 44, 46];
  const nombresBlackKeys = [
    2, 4, 7, 9, 11, 14, 16, 19, 21, 23, 26, 28, 31, 33, 35, 38, 40, 43, 45, 47,
  ];

  const {
    startRecording,
    stopRecording,
    recording,
    playNote,
    currentOctave,
    playRecording,
    recordings,
    addRecording,
    initializeInstrument,
    loadRecordings,
    deleteRecording,
    updateRecordingName,
    handleRecordingToggle: toggleRecording,
    recordingNotes,
    currentRecordingStartTime,
    set,
  } = useMusicStore();

  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [pause, setPause] = useState(false);
  const [recordWhilePlaying, setRecordWhilePlaying] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [colonneActuelle, setColonneActuelle] = useState<number | null>(null);
  const intervalle = useRef<NodeJS.Timeout | null>(null);
  const colonneRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecordingId, setEditingRecordingId] = useState<string | null>(null);
  const [newRecordingName, setNewRecordingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('Auth Debug:', { token, user });
      setIsAuthenticated(!!token && !!user);
    };

    checkAuth();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      console.log('Storage changed, checking auth...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Initialize AudioContext and load recordings on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (isInitializing || isInitialized) return;
      
      try {
        setIsInitializing(true);
        setError(null);
        
        // Initialize Tone.js and AudioContext
        await Tone.start();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        await initializeInstrument();
        
        // Load recordings after initialization if authenticated
        if (isAuthenticated) {
          try {
            await loadRecordings();
          } catch (error) {
            console.error('Error loading recordings:', error);
            // Don't block initialization if recordings fail to load
          }
        }
        
        // Set initialized flag
        setIsInitialized(true);
        
        // Remove event listeners after initialization
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      } catch (error) {
        console.error('Error during initialization:', error);
        setError('Failed to initialize audio system. Please try again.');
        setIsInitialized(false);
      } finally {
        setIsInitializing(false);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [initializeInstrument, loadRecordings, isInitializing, isInitialized, isAuthenticated]);

  const resetPianoRoll = () => {
    setActiveNotes(new Set());
    setColonneActuelle(null);
    setPlaying(false);
    setPause(false);
    if (intervalle.current) {
      clearInterval(intervalle.current);
      intervalle.current = null;
    }
    colonneRef.current = 0;
  };

  const noteMap: string[] = [
    "C3",
    "C#3",
    "D3",
    "D#3",
    "E3",
    "F3",
    "F#3",
    "G3",
    "G#3",
    "A3",
    "A#3",
    "B3",
    "C4",
    "C#4",
    "D4",
    "D#4",
    "E4",
    "F4",
    "F#4",
    "G4",
    "G#4",
    "A4",
    "A#4",
    "B4",
    "C5",
    "C#5",
    "D5",
    "D#5",
    "E5",
    "F5",
    "F#5",
    "G5",
    "G#5",
    "A5",
    "A#5",
    "B5",
    "C6",
    "C#6",
    "D6",
    "D#6",
    "E6",
    "F6",
    "F#6",
    "G6",
    "G#6",
    "A6",
    "A#6",
    "B6",
  ];

  const changerEtatNote = (row: number, col: number) => {
    const carre = `${row}:${col}`;
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(carre)) {
        newSet.delete(carre);
      } else {
        newSet.add(carre);
      }
      return newSet;
    });
  };

  // Add useEffect to handle note playing
  useEffect(() => {
    const playActiveNotes = () => {
      activeNotes.forEach(carre => {
        const [rowStr] = carre.split(":");
        const row = parseInt(rowStr);
        const note = noteMap[row];
        if (note) {
          playNote(note);
        }
      });
    };

    playActiveNotes();
  }, [activeNotes]);

  const handleKeyPress = (keyIndex: number, isBlackKey: boolean) => {
    let trueKeyIndex = 0;
    if (!isBlackKey) {
      trueKeyIndex = nombresKeys[keyIndex - 1];
    } else {
      trueKeyIndex = nombresBlackKeys[keyIndex - 1];
    }
  };

  const handleRecordingToggle = async () => {
    try {
      if (recording) {
        console.log('Attempting to save recording...');
        setIsSaving(true);
        setError(null);
        
        const data = await stopRecording();
        if (data) {
          console.log('Recording saved successfully:', data);
          await loadRecordings();
        } else {
          console.log('No recording data returned');
          setError('Failed to save recording. Please make sure you are logged in.');
        }
      } else {
        if (!isAuthenticated) {
          setError('Please log in to record your composition.');
          return;
        }
        console.log('Starting new recording...');
        try {
          await startRecording();
          set((state) => ({
            recording: true,
            recordingNotes: [],
            currentRecordingStartTime: Date.now()
          }));
        } catch (error) {
          console.error('Error starting recording:', error);
          setError('Failed to start recording. Please make sure you are logged in.');
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      setError('Failed to toggle recording. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const playPianoRoll = async () => {
    if (!isInitialized) {
      setError('Please interact with the page first to initialize the audio system.');
      return;
    }

    if (pause) {
      setPause(false);
    } else {
      colonneRef.current = 0;
    }

    try {
      // Ensure Tone.js is running
      await Tone.start();
      
      setPlaying(true);

      // Convert active notes to the format expected by playPianoRoll
      const notes = Array.from(activeNotes).map(carre => {
        const [rowStr, colStr] = carre.split(":");
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
        return {
          note: noteMap[row],
          time: col * 0.2 // Convert column to time (200ms per column)
        };
      });

      // If recording is enabled, start recording
      if (recordWhilePlaying) {
        if (!isAuthenticated) {
          setError('Please log in to record your composition.');
          setPlaying(false);
          return;
        }
        try {
          await startRecording();
          set((state) => ({
            recording: true,
            recordingNotes: [],
            currentRecordingStartTime: Date.now()
          }));
        } catch (error) {
          console.error('Error starting recording:', error);
          setError('Failed to start recording. Please make sure you are logged in.');
          setPlaying(false);
          return;
        }
      }

      // Clear any existing scheduled events
      Tone.Transport.cancel();
      
      // Schedule all notes at once
      const now = Tone.now();
      notes.forEach(({ note, time }) => {
        Tone.Transport.scheduleOnce(() => {
          playNote(note);
        }, now + time);
      });

      // Start the transport
      Tone.Transport.start();

      // If recording is enabled, stop recording when playback ends
      if (recordWhilePlaying) {
        const duration = Math.max(...notes.map(n => n.time)) + 1;
        Tone.Transport.scheduleOnce(async () => {
          try {
            const data = await stopRecording();
            if (data) {
              set((state) => ({
                recording: false,
                recordingNotes: [],
                currentRecordingStartTime: null
              }));
              await loadRecordings();
            }
          } catch (error) {
            console.error('Error stopping recording:', error);
            setError('Failed to save recording. Please try again.');
          }
        }, now + duration);
      }
    } catch (error) {
      console.error('Error starting playback:', error);
      setError('Failed to start playback. Please try again.');
      setPlaying(false);
    }
  };

  const pausePianoRoll = () => {
    if (intervalle.current) {
      clearInterval(intervalle.current);
      setPause(true);
      setPlaying(false);
    }
  };

  const stopPianoRoll = () => {
    if (intervalle.current) {
      clearInterval(intervalle.current);
      setColonneActuelle(null);
      setPlaying(false);
      setPause(false);
      
      if (recordWhilePlaying && recording) {
        stopRecording().then(data => {
          if (data) {
            const newRecording = {
              id: data.id,
              userId: data.userId,
              name: `Composition ${recordings.length + 1}`,
              duration: data.duration,
              createdAt: data.createdAt,
              notes: data.notes,
              audioUrl: data.audioUrl,
            };
            addRecording(newRecording);
          }
        }).catch(error => {
          console.error('Error stopping recording:', error);
          setError('Failed to save recording. Please try again.');
        });
      }
    }
  };

  const handleDeleteRecording = (recordingId: string) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      deleteRecording(recordingId);
    }
  };

  const handleRenameRecording = (recordingId: string, newName: string) => {
    if (newName.trim()) {
      updateRecordingName(recordingId, newName.trim());
      setEditingRecordingId(null);
      setNewRecordingName('');
    }
  };

  const handleDownloadRecording = async (recording: Recording) => {
    if (!recording.audioUrl) {
      alert('No audio data available for this recording');
      return;
    }

    try {
      // Fetch the audio file
      const response = await fetch(recording.audioUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.name}.wav`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error downloading recording:', error);
      alert('Failed to download recording. Please try again.');
    }
  };

  const handlePlayRecording = (recording: Recording) => {
    if (playing) {
      setPlaying(false);
      return;
    }

    playRecording(recording);
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      {!isInitialized && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              {isInitializing ? 'Initializing audio system...' : 'Click anywhere to start'}
            </h2>
            <p className="text-white/80">
              {isInitializing 
                ? 'Please wait while we set up the audio system...'
                : 'The audio system needs your permission to start'}
            </p>
            {error && (
              <p className="text-red-400 mt-2">{error}</p>
            )}
          </div>
        </div>
      )}
      {" "}
      {/*Vertical stacking*/}
      <h2 className="text-3xl font-bold text-white mb-8">
        Studio de Composition
      </h2>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <motion.button
            onClick={handleRecordingToggle}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              recording ? 'bg-red-600' : 'bg-purple-600'
            } text-white relative overflow-hidden`}
            disabled={!isInitialized || isSaving}
          >
            {isSaving && (
              <motion.div
                className="absolute inset-0 bg-black/20"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            )}
            {recording ? (
              <>
                <Save className="w-5 h-5" /> {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder'}
              </>
            ) : (
              <>
                <Music className="w-5 h-5" /> Enregistrer
              </>
            )}
          </motion.button>

          <motion.button
            onClick={resetPianoRoll}
            className="px-6 py-2 rounded-lg flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            disabled={!isInitialized || isSaving}
          >
            <RotateCcw className="w-5 h-5" /> Réinitialiser
          </motion.button>
        </div>

        <label className="text-purple-300 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={recordWhilePlaying}
            onChange={() => setRecordWhilePlaying(!recordWhilePlaying)}
            disabled={!isInitialized || isSaving}
          />
          Enregistrer pendant la lecture
        </label>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div className="space-x-8 flex">
        {" "}
        {/*Horizontal stacking*/}
        {/* <div className="h-[700px] overflow-y-auto scroll-smooth whitespace-nowrap">
          
        </div> */}
        <div className="grid md:grid-cols-[4fr_1fr] gap-6">
          <div className="h-[700px] w-full overflow-x-auto overflow-y-auto scroll-smooth whitespace-nowrap">
            <div className="flex h-full">
              {/*Piano container*/}
              <div className="flex-shrink-0 min-h-[700px]">
                <Piano onKeyPress={handleKeyPress} />
              </div>

              {/*Layers container*/}
              <div
                className="bg-black/20 p-4 rounded-lg border border-purple-500/20 flex-shrink-0"
                style={{ width: "200%", height: "1700px" }}
              >
                {/*Grid with 48 rows for the keys*/}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "repeat(100, 35px)",
                    gridTemplateRows: "repeat(48, 35px)",
                  }}
                >
                  {Array.from({ length: 48 * 100 }).map((_, index) => {
                    const row = Math.floor(index / 100); //pour verifier la rangee du carre
                    const col = index % 100;
                    const carre = `${row}:${col}`;
                    const isDarkRow = nombresBlackKeys.includes(row + 1);
                    const isActive = activeNotes.has(carre);

                    const isColonneAct = col == colonneActuelle;

                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => changerEtatNote(row, col)}
                        className={`border border-gray-300 cursor-pointer transition-colors duration-75
                          ${
                            isColonneAct
                              ? "bg-pink-400"
                              : isActive
                              ? "bg-blue-500 hover:bg-blue-600"
                              : isDarkRow
                              ? "bg-purple-700 hover:bg-purple-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Instruments
            </h3>
            <div className="space-y-2">
              {["Piano", "Guitare", "Synthétiseur"].map((instrument) => (
                <button
                  key={instrument}
                  className="w-full text-left px-4 py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                >
                  {instrument}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Gammes</h3>
            <div className="space-y-2">
              {["Majeure", "Mineure", "Pentatonique"].map((scale) => (
                <button
                  key={scale}
                  className="w-full text-left px-4 py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                >
                  {scale}
                </button>
              ))}
            </div>
          </div> */}

          <div className="space-y-6">
            <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                Lecture
              </h3>
              <div className="space-y-2">
                <button
                  onClick={playing ? stopPianoRoll : playPianoRoll}
                  className={`w-full py-2 rounded ${
                    playing
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {playing ? "Arrêter la lecture" : "Démarrer la lecture"}
                </button>
                {playing && (
                  <button
                    onClick={pausePianoRoll}
                    className="w-full py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Pause
                  </button>
                )}
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                Mes Enregistrements
              </h3>
              <div className="space-y-2">
                {recordings.slice(0, 5).map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-purple-500/10 hover:bg-purple-500/20 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex-1">
                      {editingRecordingId === rec.id ? (
                        <input
                          type="text"
                          value={newRecordingName}
                          onChange={(e) => setNewRecordingName(e.target.value)}
                          className="bg-white/10 text-white px-2 py-1 rounded w-full"
                          autoFocus
                        />
                      ) : (
                        <p className="text-purple-200 font-medium">{rec.name}</p>
                      )}
                      <p className="text-purple-300 text-sm">
                        {new Date(rec.createdAt).toLocaleDateString()} • {rec.duration}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePlayRecording(rec)}
                        className="p-2 text-purple-400 hover:text-purple-300"
                      >
                        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      {editingRecordingId === rec.id ? (
                        <>
                          <button
                            onClick={() => handleRenameRecording(rec.id, newRecordingName)}
                            className="p-2 text-green-400 hover:text-green-300"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRecordingId(null);
                              setNewRecordingName('');
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
                              setEditingRecordingId(rec.id);
                              setNewRecordingName(rec.name);
                            }}
                            className="p-2 text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadRecording(rec)}
                            className="p-2 text-purple-400 hover:text-purple-300"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecording(rec.id)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Composition;