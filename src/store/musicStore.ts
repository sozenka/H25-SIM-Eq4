import { create } from 'zustand';
import * as Tone from 'tone';

interface Recording {
  id: string;
  userId: string;
  name: string;
  notes: Array<{ note: string; time: number }>;
  duration: string;
  createdAt: string;
  audioData?: ArrayBuffer;
}

interface MusicState {
  instrument: Tone.PolySynth | null;
  recording: boolean;
  currentScale: string;
  currentOctave: number;
  recordings: Recording[];
  recordingNotes: Array<{ note: string; time: number }>;
  currentRecordingStartTime: number | null;
  recordingAudioData: ArrayBuffer | null;
  user: { id: string; email: string } | null;
  initializeInstrument: () => Promise<void>;
  playNote: (note: string) => void;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  setScale: (scale: string) => void;
  setOctave: (octave: number) => void;
  loadRecordings: () => Promise<void>;
  setUser: (user: { id: string; email: string } | null) => void;
  playRecording: (recording: Recording) => void;
  analyzeAudio: (audioData: ArrayBuffer) => Promise<{
    scale: string;
    chords: string[];
    tempo: number;
  }>;
}

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: 'sine'
  },
  envelope: {
    attack: 0.05,
    decay: 0.2,
    sustain: 0.2,
    release: 1
  }
}).toDestination();

// Audio Context for recording
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const mediaRecorder = new MediaRecorder(audioContext.createMediaStreamDestination().stream);

// Simple in-memory storage
let localRecordings: Recording[] = [];

export const useMusicStore = create<MusicState>((set, get) => ({
  instrument: null,
  recording: false,
  currentScale: 'C',
  currentOctave: 4,
  recordings: [],
  recordingNotes: [],
  currentRecordingStartTime: null,
  recordingAudioData: null,
  user: null,

  initializeInstrument: async () => {
    await Tone.start();
    synth.volume.value = -10;
    set({ instrument: synth });
  },

  playNote: (note: string) => {
    const { instrument, recording, currentRecordingStartTime } = get();
    if (instrument) {
      instrument.triggerAttackRelease(note, '8n');
      if (recording && currentRecordingStartTime) {
        const time = (Date.now() - currentRecordingStartTime) / 1000;
        set(state => ({
          recordingNotes: [...state.recordingNotes, { note, time }]
        }));
      }
    }
  },

  startRecording: () => {
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      set({ recordingAudioData: arrayBuffer });
    };

    mediaRecorder.start();
    set({
      recording: true,
      recordingNotes: [],
      currentRecordingStartTime: Date.now()
    });
  },

  stopRecording: async () => {
    const { recordingNotes, user, recordingAudioData } = get();
    if (!user) return;

    mediaRecorder.stop();
    const duration = ((Date.now() - (get().currentRecordingStartTime || 0)) / 1000).toFixed(2);
    const name = `Recording ${new Date().toLocaleString()}`;

    try {
      const newRecording: Recording = {
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        notes: recordingNotes,
        duration: `${duration} seconds`,
        createdAt: new Date().toISOString(),
        audioData: recordingAudioData || undefined
      };

      localRecordings.push(newRecording);

      // Analyze the audio
      if (recordingAudioData) {
        const analysis = await get().analyzeAudio(recordingAudioData);
        set({ currentScale: analysis.scale });
      }

      set(state => ({
        recording: false,
        currentRecordingStartTime: null,
        recordingAudioData: null,
        recordings: [...state.recordings, newRecording]
      }));
    } catch (error) {
      console.error('Error saving recording:', error);
      set({
        recording: false,
        currentRecordingStartTime: null,
        recordingAudioData: null
      });
    }
  },

  setScale: (scale: string) => {
    set({ currentScale: scale });
    const { instrument } = get();
    if (instrument) {
      instrument.releaseAll();
    }
  },

  setOctave: (octave: number) => {
    if (octave >= 0 && octave <= 8) {
      set({ currentOctave: octave });
    }
  },

  loadRecordings: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const userRecordings = localRecordings.filter(rec => rec.userId === user.id);
      set({ recordings: userRecordings });
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      get().loadRecordings();
    } else {
      set({ recordings: [] });
    }
  },

  playRecording: (recording: Recording) => {
    const { instrument } = get();
    if (!instrument) return;

    const startTime = Tone.now();
    recording.notes.forEach(({ note, time }) => {
      instrument.triggerAttackRelease(note, '8n', startTime + time);
    });
  },

  analyzeAudio: async (audioData: ArrayBuffer): Promise<{ scale: string; chords: string[]; tempo: number }> => {
    // Create audio context and decode audio data
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    
    // Get frequency data
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    // Simple pitch detection
    const dominantFrequencies = frequencyData
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    // Map frequencies to notes (simplified)
    const noteFrequencies: { [key: string]: number } = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    // Detect scale
    const detectedNotes = dominantFrequencies.map(freq => {
      const hz = (freq.index * audioContext.sampleRate) / analyser.frequencyBinCount;
      return Object.entries(noteFrequencies)
        .reduce((closest, [note, noteHz]) => 
          Math.abs(hz - noteHz) < Math.abs(hz - noteFrequencies[closest])
            ? note
            : closest
        , 'C');
    });

    // Detect chords based on detected notes
    const chords = [
      `${detectedNotes[0]}Maj7`,
      `${detectedNotes[1]}m7`,
      `${detectedNotes[2]}7`
    ];

    // Calculate tempo using peak detection
    const peaks = [];
    const threshold = Math.max(...frequencyData) * 0.75;
    for (let i = 1; i < frequencyData.length - 1; i++) {
      if (frequencyData[i] > threshold &&
          frequencyData[i] > frequencyData[i-1] &&
          frequencyData[i] > frequencyData[i+1]) {
        peaks.push(i);
      }
    }
    const tempo = Math.round((peaks.length * 60) / (audioBuffer.duration));

    return {
      scale: detectedNotes[0],
      chords,
      tempo: Math.min(Math.max(tempo, 60), 200) // Clamp between 60-200 BPM
    };
  }
}));