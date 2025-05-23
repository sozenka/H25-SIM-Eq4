import React, { useState, useRef, useEffect } from "react";
import Piano from "../components/Piano";
import { useMusicStore } from "../store/musicStore";
import {
  Play,
  Pause,
  Save,
  Music,
  CircleDot,
  RotateCcw,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Recording } from "../store/musicStore";
import { downloadRecording } from "../utils/audio";

// Fonction pour convertir Base64 en ArrayBuffer
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
  const PIANO_HEIGHT = 40;
  // Les 3 constantes suivantes regroupent les numéros des touches du piano
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
  const [editingRecordingId, setEditingRecordingId] = useState<string | null>(
    null
  );
  const [newRecordingName, setNewRecordingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [bpm, setBpm] = useState(120); // BPM par défaut

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (isInitializing) return;

      try {
        setIsInitializing(true);
        setError(null);

        await initializeInstrument();

        await loadRecordings();

        setIsInitialized(true);

        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
        setError(
          "Échec de l'initialisation du système audio. Veuillez réessayer"
        );
      } finally {
        setIsInitializing(false);
      }
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [initializeInstrument, loadRecordings, isInitializing]);

  // Réinitialiser le piano roll
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

  // Map qui contient toutes les notes du piano
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

  // Code pour déterminer les notes actives
  const changerEtatNote = (row: number, col: number) => {
    const carre = `${row}:${col}`;
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(carre)) {
        newSet.delete(carre);
      } else {
        newSet.add(carre);
        const note = noteMap[row];
        if (note) {
          playNote(note);
        }
      }
      return newSet;
    });
  };

  const handleKeyPress = (keyIndex: number, isBlackKey: boolean) => {
    let trueKeyIndex = 0;
    if (!isBlackKey) {
      trueKeyIndex = nombresKeys[keyIndex - 1];
    } else {
      trueKeyIndex = nombresBlackKeys[keyIndex - 1];
    }
  };

  // Fonction pour faire jouer le piano roll
  const playPianoRoll = () => {
    if (pause) {
      setPause(false);
    } else {
      colonneRef.current = 0;
    }

    setPlaying(true);

    if (recordWhilePlaying && !recording) {
      startRecording();
    }

    intervalle.current = setInterval(() => {
      const currentCol = colonneRef.current;
      setColonneActuelle(currentCol);

      activeNotes.forEach((carre) => {
        const [rowStr, colStr] = carre.split(":");
        const row = parseInt(rowStr);
        const col = parseInt(colStr);

        if (col === currentCol && noteMap[row]) {
          playNote(noteMap[row]);
        }
      });

      colonneRef.current++;

      if (colonneRef.current >= 100) {
        clearInterval(intervalle.current!);
        setColonneActuelle(null);
        setPlaying(false);
        setPause(false);

        if (recordWhilePlaying && recording) {
          stopRecording().then((data) => {
            if (data) {
              addRecording({
                id: data.id,
                userId: data.userId,
                name: `Composition ${recordings.length + 1}`,
                duration: data.duration,
                createdAt: data.createdAt || new Date().toISOString(),
                notes: data.notes,
                audioUrl: data.audioUrl,
              });
            }
          });
        }
      }
    }, (60 / bpm) * 1000);
  };

  // Mettre en pause le piano roll
  const pausePianoRoll = () => {
    if (intervalle.current) {
      clearInterval(intervalle.current);
      intervalle.current = null;
    }
    setPause(true);
    setPlaying(false);
  };

  // Arrêter le piano roll
  const stopPianoRoll = () => {
    if (intervalle.current) {
      clearInterval(intervalle.current);
      intervalle.current = null;
    }
    setColonneActuelle(null);
    setPlaying(false);
    setPause(false);
    colonneRef.current = 0;
  };

  // Gérer l'enregistrement
  const handleRecordingToggle = async () => {
    if (recording) {
      const data = await stopRecording();
      if (data) {
        addRecording({
          id: data.id,
          userId: data.userId,
          name: `Composition ${recordings.length + 1}`,
          duration: data.duration,
          createdAt: data.createdAt || new Date().toISOString(),
          notes: data.notes,
          audioUrl: data.audioUrl,
        });
      }
    } else {
      startRecording();
    }
  };

  // Supprimer un enregistrement
  const handleDeleteRecording = (recordingId: string | undefined) => {
    if (recordingId) {
      deleteRecording(recordingId);
    }
  };

  // Renommer un enregistrement
  const handleRenameRecording = (recordingId: string, newName: string) => {
    updateRecordingName(recordingId, newName);
    setEditingRecordingId(null);
  };

  // Jouer un enregistrement
  const handlePlayRecording = (recording: Recording) => {
    playRecording(recording);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Piano Roll */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Piano Roll</h2>
              <div className="relative">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(100, 1fr)`,
                    gridTemplateRows: `repeat(${noteMap.length}, ${PIANO_HEIGHT}px)`,
                  }}
                >
                  {noteMap.map((_, rowIndex) =>
                    Array.from({ length: 100 }, (_, colIndex) => {
                      const isActive = activeNotes.has(`${rowIndex}:${colIndex}`);
                      const isCurrentCol = colonneActuelle === colIndex;
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => changerEtatNote(rowIndex, colIndex)}
                          className={`border border-white/10 rounded ${
                            isActive
                              ? "bg-purple-500"
                              : isCurrentCol
                              ? "bg-purple-500/20"
                              : "bg-white/5"
                          } hover:bg-purple-500/30 transition-colors cursor-pointer`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Contrôles */}
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={playPianoRoll}
                    disabled={playing}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" />
                    Jouer
                  </button>
                  <button
                    onClick={pausePianoRoll}
                    disabled={!playing}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                  <button
                    onClick={stopPianoRoll}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Arrêter
                  </button>
                  <button
                    onClick={resetPianoRoll}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Réinitialiser
                  </button>
                </div>
              </div>

              {/* Enregistrements */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Enregistrements</h2>
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                    >
                      {editingRecordingId === recording.id ? (
                        <input
                          type="text"
                          value={newRecordingName}
                          onChange={(e) => setNewRecordingName(e.target.value)}
                          className="bg-white/10 px-2 py-1 rounded"
                          autoFocus
                        />
                      ) : (
                        <span className="text-white">{recording.name}</span>
                      )}
                      <div className="flex gap-2">
                        {editingRecordingId === recording.id ? (
                          <>
                            <button
                              onClick={() =>
                                handleRenameRecording(
                                  recording.id,
                                  newRecordingName
                                )
                              }
                              className="text-green-400 hover:text-green-300"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingRecordingId(null)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingRecordingId(recording.id);
                                setNewRecordingName(recording.name);
                              }}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handlePlayRecording(recording)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Play className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecording(recording.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => downloadRecording(recording)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <Download className="w-5 h-5" />
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
    </div>
  );
};

export default Composition;
