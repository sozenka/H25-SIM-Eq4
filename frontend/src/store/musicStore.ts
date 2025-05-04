import { create } from 'zustand';
import * as Tone from 'tone';
import Meyda from 'meyda';
import { createClient } from '@supabase/supabase-js';
import { PitchDetector } from 'pitchy';

// Create a single instance of the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Recording {
  id: string;
  userId: string;
  name: string;
  notes: Array<{ note: string; time: number }>;
  duration: string;
  createdAt: string;
  audioUrl: string;
}

interface MusicState {
  instrument: Tone.PolySynth | null;
  recording: boolean;
  playing: boolean;
  currentScale: string;
  currentOctave: number;
  recordings: Recording[];
  recordingNotes: Array<{ note: string; time: number }>;
  currentRecordingStartTime: number | null;
  recordingAudioData: ArrayBuffer | null;
  user: { id: string; email: string } | null;
  recorder: Tone.Recorder | null;
  initializeInstrument: () => Promise<void>;
  playNote: (note: string) => void;
  stopNote: (note: string) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Recording | undefined>;
  addRecording: (recording: Recording) => void;
  setScale: (scale: string) => void;
  setOctave: (octave: number) => void;
  loadRecordings: () => Promise<void>;
  playRecording: (recording: Recording) => void;
  analyzeAudio: (audioData: ArrayBuffer) => Promise<{
    scale: string;
    chords: string[];
    tempo: number;
  }>;
  deleteRecording: (recordingId: string) => void;
  updateRecordingName: (recordingId: string, newName: string) => void;
  handleRecordingToggle: () => Promise<void>;
  set: (fn: (state: MusicState) => Partial<MusicState>) => void;
  playPianoRoll: (notes: Array<{ note: string; time: number }>) => Promise<void>;
}

let audioContext: AudioContext | null = null;
let recorder: Tone.Recorder | null = null;
let recordingChunks: BlobPart[] = [];
let analyzerNode: AnalyserNode | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const setupRecorder = async () => {
  try {
    if (recorder) {
      return recorder;
    }
    
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    recorder = new Tone.Recorder();
    Tone.Destination.connect(recorder);
    return recorder;
  } catch (error) {
    console.error('Error setting up recorder:', error);
    throw error;
  }
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const binary = new Uint8Array(buffer);
  const bytes = Array.from(binary).map(byte => String.fromCharCode(byte));
  return btoa(bytes.join(''));
};

const detectChords = (frequencies: Float32Array, sampleRate: number): string[] => {
  const noteFrequencies = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
  };

  const chords: { [key: string]: number[] } = {
    'CMaj': [261.63, 329.63, 392.00],
    'GMaj': [392.00, 493.88, 587.33],
    'DMaj': [293.66, 369.99, 440.00],
    'Am': [440.00, 523.25, 659.25],
    'Em': [329.63, 392.00, 493.88],
    'FMaj': [349.23, 440.00, 523.25]
  };

  const detectedChords: string[] = [];
  const binSize = sampleRate / frequencies.length;

  for (const [chordName, chordFreqs] of Object.entries(chords)) {
    let matches = 0;
    for (const freq of chordFreqs) {
      const bin = Math.round(freq / binSize);
      if (frequencies[bin] > -60) { // Threshold for frequency detection
        matches++;
      }
    }
    if (matches >= 2) { // At least 2 matching frequencies for a chord
      detectedChords.push(chordName);
    }
  }

  return detectedChords.length > 0 ? detectedChords : ['Unknown'];
};

const detectTempo = async (audioBuffer: AudioBuffer): Promise<number> => {
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  
  const analyzer = ctx.createAnalyser();
  analyzer.fftSize = 2048;
  source.connect(analyzer);
  
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyzer.getFloatFrequencyData(dataArray);
  
  // Simple tempo detection based on RMS values
  const rmsValues: number[] = [];
  const sampleLength = Math.floor(audioBuffer.length / 512);
  
  for (let i = 0; i < sampleLength; i++) {
    const start = i * 512;
    const end = Math.min(start + 512, audioBuffer.length);
    let sum = 0;
    
    for (let j = start; j < end; j++) {
      const sample = audioBuffer.getChannelData(0)[j];
      sum += sample * sample;
    }
    
    rmsValues.push(Math.sqrt(sum / (end - start)));
  }
  
  // Find peaks in RMS values to estimate tempo
  const peaks: number[] = [];
  for (let i = 1; i < rmsValues.length - 1; i++) {
    if (rmsValues[i] > rmsValues[i - 1] && rmsValues[i] > rmsValues[i + 1]) {
      peaks.push(i);
    }
  }
  
  // Calculate average time between peaks
  const avgTimeBetweenPeaks = peaks.length > 1 
    ? (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1) 
    : 0;
  
  // Convert to BPM
  const bpm = avgTimeBetweenPeaks > 0 
    ? Math.round(60 / (avgTimeBetweenPeaks * 512 / audioBuffer.sampleRate))
    : 120; // Default fallback
  
  return Math.min(Math.max(bpm, 60), 200); // Clamp between 60-200 BPM
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
  user: null,
  recorder: null,

  initializeInstrument: async () => {
    try {
      // Start Tone.js and ensure audio context is running
      await Tone.start();
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Configure the synth with proper voice management
      const synth = new Tone.PolySynth(Tone.Synth, {
        volume: -10,
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        },
        oscillator: {
          type: "sine"
        }
      }).toDestination();
      
      // Set the maximum number of voices and voice stealing
      synth.maxPolyphony = 32;
      synth.voiceStealing = true;
      
      set({ instrument: synth });
    } catch (error) {
      console.error('Failed to initialize instrument:', error);
      throw error;
    }
  },

  playNote: (note: string) => {
    const { instrument, recording, currentRecordingStartTime } = get();
    if (!instrument) return;

    const now = Tone.now();
    // Use triggerAttackRelease with proper timing
    instrument.triggerAttackRelease(note, '8n', now);
    
    if (recording && currentRecordingStartTime) {
      const time = (Date.now() - currentRecordingStartTime) / 1000;
      set((state) => ({
        recordingNotes: [...state.recordingNotes, { note, time }]
      }));
    }
  },

  stopNote: (note: string) => {
    const { instrument } = get();
    if (!instrument) return;
    instrument.triggerRelease(note);
  },

  startRecording: async () => {
    try {
      if (get().recording) {
        console.log('Recording already in progress');
        return;
      }

      // Check if user is authenticated using local storage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No authenticated user');
        throw new Error('User must be authenticated to record');
      }

      const user = JSON.parse(userStr);
      set({ user: { id: user.id, email: user.email || '' } });

      console.log('Starting recording...');
      await Tone.start();
      
      // Initialize recorder if not already done
      const recorder = new Tone.Recorder();
      Tone.Destination.connect(recorder);
      
      // Start recording
      recorder.start();
      
      set((state) => ({
        recording: true,
        recorder,
        recordingNotes: [],
        currentRecordingStartTime: Date.now()
      }));
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },

  stopRecording: async () => {
    const { recorder, recordingNotes, currentRecordingStartTime } = get();
    if (!recorder) {
      console.error('No recorder instance found');
      return undefined;
    }

    try {
      console.log('Stopping recording with notes:', recordingNotes);
      const blob = await recorder.stop();
      console.log('Recording stopped, processing blob...');

      // Get authentication token
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('Auth state during save:', { token, user });

      if (!token || !user) {
        throw new Error('No authentication token or user data found');
      }

      const userData = JSON.parse(user);
      console.log('User data:', userData);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        console.log('Audio data length:', base64Audio.length);

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              audio: base64Audio,
              notes: recordingNotes,
              userId: userData.id,
              title: `Recording ${new Date().toISOString()}`
            })
          });

          console.log('Save response status:', response.status);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Save error details:', errorData);
            throw new Error('Failed to save recording');
          }

          const data = await response.json();
          console.log('Save successful:', data);
          set((state) => ({
            recording: false,
            recorder: null,
            recordingNotes: []
          }));
          return data;
        } catch (error) {
          console.error('Error saving recording:', error);
          throw error;
        }
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      set((state) => ({
        recording: false,
        recorder: null,
        recordingNotes: []
      }));
      throw error;
    }
  },

  addRecording: (recording: Recording) => {
    set((state) => ({
      recordings: [...state.recordings, recording]
    }));
  },

  deleteRecording: async (recordingId: string) => {
    try {
      // First, get the recording to check if it has an audio file
      const recording = get().recordings.find(r => r.id === recordingId);
      if (!recording) return;

      // If there's an audio file, delete it from storage
      if (recording.audioUrl) {
        const audioPath = recording.audioUrl.split('/').pop();
        if (audioPath) {
          const { error: storageError } = await supabase.storage
            .from('recordings')
            .remove([audioPath]);
          
          if (storageError) throw storageError;
        }
      }

      // Delete the recording record from Supabase
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId);

      if (error) throw error;

      // Update local state
      set(state => ({
        recordings: state.recordings.filter(r => r.id !== recordingId)
      }));
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  },

  updateRecordingName: async (recordingId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .update({ name: newName })
        .eq('id', recordingId);

      if (error) throw error;

      set(state => ({
        recordings: state.recordings.map(r =>
          r.id === recordingId ? { ...r, name: newName } : r
        )
      }));
    } catch (error) {
      console.error('Error updating recording name:', error);
      throw error;
    }
  },

  setScale: (scale) => set({ currentScale: scale }),
  setOctave: (octave) => set({ currentOctave: octave }),
  
  loadRecordings: async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        return;
      }

      // Fetch recordings from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load recordings');
      }

      const data = await response.json();
      set({ recordings: data });
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  },

  playRecording: async (recording: Recording) => {
    const { instrument } = get();
    if (!instrument || !recording.audioUrl) return;
    
    try {
      // Fetch the audio file from the URL
      const response = await fetch(recording.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioContext = getAudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      set({ playing: true });
      source.onended = () => set({ playing: false });
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  },

  analyzeAudio: async (audioData: ArrayBuffer) => {
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(audioData);
    
    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 2048;
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyzer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyzer.getFloatFrequencyData(dataArray);

    // Pitch detection
    const detector = PitchDetector.forFloat32Array(bufferLength);
    const pitch = detector.findPitch(dataArray, ctx.sampleRate);
    
    // Scale detection based on pitch
    const scale = pitch ? pitch[0].toFixed(2) : 'Unknown';
    
    // Chord detection
    const chords = detectChords(dataArray, ctx.sampleRate);
    
    // Tempo detection
    const tempo = await detectTempo(audioBuffer);

    return {
      scale,
      chords,
      tempo
    };
  },

  handleRecordingToggle: async () => {
    const { recording } = get();
    console.log('Toggling recording state:', recording);
    
    if (recording) {
      try {
        console.log('Attempting to stop recording...');
        const data = await get().stopRecording();
        if (data) {
          console.log('Recording stopped successfully');
          set((state) => ({
            recording: false,
            recordingNotes: [],
            currentRecordingStartTime: null
          }));
          // Reload recordings to show the new one
          await get().loadRecordings();
        } else {
          console.log('No recording data returned');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        throw error;
      }
    } else {
      try {
        console.log('Starting new recording...');
        await get().startRecording();
        set((state) => ({
          recording: true,
          recordingNotes: [],
          currentRecordingStartTime: Date.now()
        }));
      } catch (error) {
        console.error('Error starting recording:', error);
        throw error;
      }
    }
  },

  playPianoRoll: async (notes: Array<{ note: string; time: number }>) => {
    try {
      // Ensure Tone.js and audio context are running
      await Tone.start();
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Clear any existing scheduled events
      Tone.Transport.cancel();

      // Play each note at its scheduled time
      notes.forEach(({ note, time }) => {
        Tone.Transport.scheduleOnce(() => {
          get().playNote(note);
        }, time);
      });

      // Start the transport
      Tone.Transport.start();

      // If recording is enabled, stop recording when playback ends
      if (get().recording) {
        const duration = Math.max(...notes.map(n => n.time)) + 1;
        Tone.Transport.scheduleOnce(async () => {
          const data = await get().stopRecording();
          if (data) {
            set((state) => ({
              recording: false,
              recordingNotes: [],
              currentRecordingStartTime: null
            }));
            await get().loadRecordings();
          }
        }, duration);
      }
    } catch (error) {
      console.error('Error playing piano roll:', error);
      throw error;
    }
  },

  set
}));