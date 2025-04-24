import { create } from 'zustand'
import * as Tone from 'tone'

export interface Recording {
  id: string
  userId: string
  name: string
  notes: Array<{ note: string; time: number }>
  duration: string
  createdAt: string
  audioData?: ArrayBuffer | string // Allow both ArrayBuffer and Base64 string
}

interface MusicState {
  instrument: Tone.PolySynth | null
  recording: boolean
  playing: boolean
  currentScale: string
  currentOctave: number
  recordings: Recording[]
  recordingNotes: Array<{ note: string; time: number }>
  currentRecordingStartTime: number | null
  recordingAudioData: ArrayBuffer | null
  user: { id: string; email: string } | null
  pianoRoll: string[][]
  currentColumn: number
  initializeInstrument: () => Promise<void>
  playNote: (note: string) => void
  stopNote: (note: string) => void
  setPlaying: (playing: boolean) => void
  setCurrentColumn: (column: number) => void
  startRecording: () => void
  stopRecording: () => Promise<Recording | undefined>
  addRecording: (recording: Recording) => void
  setScale: (scale: string) => void
  setOctave: (octave: number) => void
  loadRecordings: () => Promise<void>
  setUser: (user: { id: string; email: string } | null) => void
  playRecording: (recording: Recording) => void
  togglePlayback: () => void
  analyzeAudio: (audioData: ArrayBuffer) => Promise<{
    scale: string
    chords: string[]
    tempo: number
  }>
  deleteRecording: (recordingId: string) => void
  updateRecordingName: (recordingId: string, newName: string) => void
}

// Helper functions for Base64 encoding/decoding
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};

// Type guard for ArrayBuffer
const isArrayBuffer = (data: unknown): data is ArrayBuffer => {
  return data instanceof ArrayBuffer;
};

// Type guard for Base64 string
const isBase64String = (data: unknown): data is string => {
  return typeof data === 'string' && /^[A-Za-z0-9+/=]+$/.test(data);
};

// Initialize AudioContext lazily
let audioContext: AudioContext | null = null;
let destination: MediaStreamAudioDestinationNode | null = null;
let mediaRecorder: MediaRecorder | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const getDestination = () => {
  if (!destination) {
    destination = getAudioContext().createMediaStreamDestination();
  }
  return destination;
};

const getMediaRecorder = () => {
  if (!mediaRecorder) {
    // Get supported MIME type
    const supportedTypes = ['audio/wav', 'audio/ogg;codecs=opus', 'audio/webm'];
    const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
    
    mediaRecorder = new MediaRecorder(getDestination().stream, {
      mimeType,
      audioBitsPerSecond: 128000
    });
  }
  return mediaRecorder;
};

let chunks: BlobPart[] = [];

getMediaRecorder().ondataavailable = (e: BlobEvent) => {
  chunks.push(e.data);
};

let resolveRecordingPromise: ((rec: Recording | undefined) => void) | null = null;
let currentPlayback: Tone.Part | null = null;

getMediaRecorder().onstop = async () => {
  try {
    const blob = new Blob(chunks, { type: 'audio/wav' });
    const arrayBuffer = await blob.arrayBuffer();
    const { recordingNotes, currentRecordingStartTime, recordings, user } = useMusicStore.getState();

    if (!user || !currentRecordingStartTime) {
      resolveRecordingPromise?.(undefined);
      return;
    }

    const durationSeconds = ((Date.now() - currentRecordingStartTime) / 1000).toFixed(2);

    // Create a copy of the audio data to avoid detached ArrayBuffer issues
    const audioDataCopy = new Uint8Array(arrayBuffer).slice().buffer;

    const newRecording: Recording = {
      id: crypto.randomUUID(),
      userId: user.id,
      name: `Composition ${recordings.length + 1}`,
      notes: recordingNotes,
      duration: `${durationSeconds}s`,
      createdAt: new Date().toISOString(),
      audioData: bufferToBase64(audioDataCopy), // Store as Base64
    };

    useMusicStore.setState((state) => ({
      recordings: [...state.recordings, newRecording],
      recording: false,
      recordingNotes: [],
      recordingAudioData: audioDataCopy,
      currentRecordingStartTime: null,
    }));

    resolveRecordingPromise?.(newRecording);
    resolveRecordingPromise = null;
    chunks = [];
  } catch (error) {
    console.error('Error processing recording:', error);
    resolveRecordingPromise?.(undefined);
    resolveRecordingPromise = null;
    chunks = [];
  }
};

// Store recordings in localStorage
const STORAGE_KEY = 'harmonia_recordings';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading from storage:', error);
    return {};
  }
};

const saveToStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const useMusicStore = create<MusicState>((set, get) => ({
  instrument: null,
  recording: false,
  playing: false,
  currentScale: 'C',
  currentOctave: 4,
  recordings: [],
  recordingNotes: [],
  currentRecordingStartTime: null,
  recordingAudioData: null,
  user: { id: 'default-user', email: 'test@harmonia.app' },
  pianoRoll: Array(48).fill(null).map(() => Array(100).fill('')),
  currentColumn: 0,

  initializeInstrument: async () => {
    try {
      // Get or create AudioContext first
      const ctx = getAudioContext();
      
      // Resume AudioContext if it's suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Start Tone.js after AudioContext is ready
      await Tone.start();
      
      // Initialize synth
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 1 },
      }).toDestination();
      
      synth.volume.value = -10;
      set({ instrument: synth });
    } catch (error) {
      console.error('Error initializing instrument:', error);
      throw error;
    }
  },

  playNote: (note: string) => {
    const { instrument, recording, currentRecordingStartTime } = get();
    if (!instrument) return;

    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      instrument.triggerAttackRelease(note, '8n');
      
      if (recording && currentRecordingStartTime) {
        const time = (Date.now() - currentRecordingStartTime) / 1000;
        set((state) => ({
          recordingNotes: [...state.recordingNotes, { note, time }],
        }));
      }
    }, 0);
  },

  startRecording: () => {
    const { recording, playing } = get()
    if (recording) return

    chunks = []
    getMediaRecorder().start()
    set({
      recording: true,
      recordingNotes: [],
      currentRecordingStartTime: Date.now(),
    })
  },

  stopRecording: async () => {
    return new Promise<Recording | undefined>((resolve) => {
      const { recording } = get()
      if (!recording) return resolve(undefined)
      resolveRecordingPromise = resolve
      getMediaRecorder().stop()
    })
  },

  loadRecordings: async () => {
    const { user } = get();
    if (!user) return;
    
    const storedData = loadFromStorage();
    // Only load recordings for the current user
    const userRecordings = storedData[user.id] || [];
    
    // Convert Base64 audio data back to ArrayBuffer
    const recordings = userRecordings
      .filter((recording: Recording) => recording.userId === user.id)
      .map((recording: Recording) => ({
        ...recording,
        audioData: recording.audioData && isBase64String(recording.audioData)
          ? base64ToBuffer(recording.audioData)
          : recording.audioData,
      }));
    
    set({ recordings });
  },

  addRecording: (recording: Recording) => {
    set((state) => {
      const { user } = state;
      if (!user) return state;

      const storedData = loadFromStorage();
      const userRecordings = storedData[user.id] || [];
      
      // Ensure the recording belongs to the current user
      if (recording.userId !== user.id) return state;
      
      // Convert audio data to Base64 before saving
      const recordingToSave = {
        ...recording,
        audioData: recording.audioData && isArrayBuffer(recording.audioData)
          ? bufferToBase64(recording.audioData)
          : recording.audioData,
      };
      
      // Check if recording with same ID already exists
      const existingIndex = userRecordings.findIndex((r: Recording) => r.id === recording.id);
      if (existingIndex !== -1) {
        // Update existing recording
        userRecordings[existingIndex] = recordingToSave;
      } else {
        // Add new recording
        userRecordings.push(recordingToSave);
      }

      // Save to storage
      storedData[user.id] = userRecordings;
      saveToStorage(storedData);

      return { recordings: userRecordings };
    });
  },

  deleteRecording: (recordingId: string) => {
    set((state) => {
      const { user } = state;
      if (!user) return state;

      const storedData = loadFromStorage();
      const userRecordings = storedData[user.id] || [];
      
      // Remove recording
      const updatedRecordings = userRecordings.filter((r: Recording) => r.id !== recordingId);
      
      // Save to storage
      storedData[user.id] = updatedRecordings;
      saveToStorage(storedData);

      return { recordings: updatedRecordings };
    });
  },

  updateRecordingName: (recordingId: string, newName: string) => {
    set((state) => {
      const { user } = state;
      if (!user) return state;

      const storedData = loadFromStorage();
      const userRecordings = storedData[user.id] || [];
      
      // Update recording name
      const updatedRecordings = userRecordings.map((r: Recording) => 
        r.id === recordingId ? { ...r, name: newName } : r
      );
      
      // Save to storage
      storedData[user.id] = updatedRecordings;
      saveToStorage(storedData);

      return { recordings: updatedRecordings };
    });
  },

  setScale: (scale) => {
    set({ currentScale: scale })
    const { instrument } = get()
    if (instrument) instrument.releaseAll()
  },

  setOctave: (octave) => {
    if (octave >= 0 && octave <= 8) {
      set({ currentOctave: octave })
    }
  },

  setUser: (user) => {
    set({ user })
    if (user) get().loadRecordings()
    else set({ recordings: [] })
  },

  playRecording: (recording: Recording) => {
    const { instrument, user } = get();
    if (!instrument || !user) {
      console.error('Instrument not initialized or user not logged in');
      return;
    }

    // Ensure the recording belongs to the current user
    if (recording.userId !== user.id) {
      console.error('Recording does not belong to current user');
      return;
    }

    // Stop any existing playback
    if (currentPlayback) {
      currentPlayback.stop();
      currentPlayback = null;
    }

    // Play the notes
    const startTime = Tone.now();
    recording.notes.forEach(({ note, time }) => {
      instrument.triggerAttackRelease(note, '8n', startTime + time);
    });

    set({ playing: true });

    // Set a timeout to stop playback after the last note
    const lastNoteTime = Math.max(...recording.notes.map(({ time }) => time));
    setTimeout(() => {
      set({ playing: false });
    }, lastNoteTime * 1000);
  },

  togglePlayback: () => {
    const { playing, instrument } = get()
    if (!instrument) return

    if (playing) {
      if (currentPlayback) {
        currentPlayback.stop()
        currentPlayback = null
      }
      instrument.releaseAll()
      set({ playing: false })
    } else {
      set({ playing: true })
    }
  },

  analyzeAudio: async (audioData: ArrayBuffer) => {
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(audioData);
    const analyser = ctx.createAnalyser();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);

    const frequencyData = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(frequencyData)

    const dominantFrequencies = Array.from(frequencyData)
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)

    const noteFrequencies: { [key: string]: number } = {
      C: 261.63, 'C#': 277.18, D: 293.66, 'D#': 311.13, E: 329.63,
      F: 349.23, 'F#': 369.99, G: 392.0, 'G#': 415.3, A: 440.0, 'A#': 466.16, B: 493.88,
    }

    const detectedNotes = dominantFrequencies.map((freq) => {
      const hz = (freq.index * ctx.sampleRate) / analyser.frequencyBinCount;
      return Object.entries(noteFrequencies).reduce(
        (closest: string, [note, noteHz]) =>
          Math.abs(hz - noteHz) < Math.abs(hz - noteFrequencies[closest]) ? note : closest,
        'C'
      );
    });

    const chords = [
      `${detectedNotes[0]}Maj7`,
      `${detectedNotes[1]}m7`,
      `${detectedNotes[2]}7`,
    ]

    const peaks = []
    const threshold = Math.max(...frequencyData) * 0.75
    for (let i = 1; i < frequencyData.length - 1; i++) {
      if (
        frequencyData[i] > threshold &&
        frequencyData[i] > frequencyData[i - 1] &&
        frequencyData[i] > frequencyData[i + 1]
      ) {
        peaks.push(i)
      }
    }

    const tempo = Math.round((peaks.length * 60) / audioBuffer.duration)

    return {
      scale: detectedNotes[0],
      chords,
      tempo: Math.min(Math.max(tempo, 60), 200),
    }
  },

  setPlaying: (playing: boolean) => set({ playing }),
  setCurrentColumn: (column: number) => set({ currentColumn: column }),
  stopNote: (note: string) => {
    const { instrument } = get()
    if (!instrument) return
    instrument.triggerRelease(note)
  },
}))
