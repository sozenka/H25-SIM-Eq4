import { create } from 'zustand';
import * as Tone from 'tone';
import Meyda from 'meyda';
import { createClient } from '@supabase/supabase-js';
import { PitchDetector } from 'pitchy';
import { adminSupabase } from '../utils/supabaseAdmin';

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
  audioData?: ArrayBuffer;
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
  playNote: (note: string, time?: number) => void;
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

  playNote: (note: string, time?: number) => {
    const { instrument } = get();
    if (!instrument) return;

    if (time !== undefined) {
      instrument.triggerAttackRelease(note, '8n', time);
    } else {
      instrument.triggerAttackRelease(note, '8n', Tone.now() + 0.01);
    }

    const { recording, currentRecordingStartTime } = get();
    if (recording && currentRecordingStartTime) {
      const noteTime = (Date.now() - currentRecordingStartTime) / 1000;
      set((state) => ({
        recordingNotes: [...state.recordingNotes, { note, time: noteTime }]
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
      if (get().recording) return;

      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('User must be authenticated');

      const user = JSON.parse(userStr);
      set({ user: { id: user.id, email: user.email || '' } });

      await Tone.start();

      const recorder = await setupRecorder();
      recorder.start();

      set({
        recording: true,
        recorder,
        recordingNotes: [],
        currentRecordingStartTime: Date.now()
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },

  stopRecording: async () => {
    const { recorder, recordingNotes, currentRecordingStartTime, user } = get();

    if (!recorder) {
      console.error('No recorder instance found');
      return undefined;
    }

    if (!get().recording) {
      console.warn('Tried to stop recording, but no recording is active.');
      return;
    }

    try {
      console.log('Stopping recording with notes:', recordingNotes);
      const blob = await recorder.stop();
      const audioBuffer = await blob.arrayBuffer();
      console.log('Recording stopped, processing blob...');

      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('No authentication token or user data found');
      }

      const fileName = `${user.id}_${Date.now()}.wav`;
      const filePath = `${user.id}/${fileName}`;

      const adminSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      );

      const { error: uploadError } = await adminSupabase.storage
        .from('recordings')
        .upload(filePath, blob, {
          contentType: 'audio/wav',
          upsert: true
        });

      if (uploadError) {
        console.error('Failed to upload audio to Supabase:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = adminSupabase.storage
        .from('recordings')
        .getPublicUrl(filePath);

      const audioUrl = publicUrlData?.publicUrl;
      if (!audioUrl) {
        console.error('No public URL returned from Supabase');
        throw new Error('Failed to retrieve audio URL');
      }

      const duration = currentRecordingStartTime
        ? ((Date.now() - currentRecordingStartTime) / 1000).toFixed(2)
        : '0';

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Recording ${new Date().toISOString()}`,
          notes: recordingNotes,
          audioUrl,
          audioPath: filePath,
          duration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error details:', errorData);
        throw new Error('Failed to save recording');
      }

      const dataResponse = await response.json();
      console.log('Save successful:', dataResponse);

      set(() => ({
        recording: false,
        recorder: null,
        recordingNotes: []
      }));

      return {
        id: dataResponse.recordingId,
        userId: user.id,
        name: `Recording ${new Date().toISOString()}`,
        notes: recordingNotes,
        duration,
        createdAt: new Date().toISOString(),
        audioUrl,
        audioData: audioBuffer // ✅ Add this line!
      };

      audioData: audioBuffer
    } catch (error) {
      console.error('Error stopping recording:', error);
      set(() => ({
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
      if (!recordingId || typeof recordingId !== 'string') {
        console.error('❌ Invalid recordingId provided to deleteRecording:', recordingId);
        return;
      }

      // Find the recording in local state
      const recording = get().recordings.find(r => r.id === recordingId);
      if (!recording) {
        console.error('❌ Recording not found in local state for ID:', recordingId);
        return;
      }

      // Delete file from Supabase Storage
      if (recording.audioUrl) {
        const parts = recording.audioUrl.split('/recordings/');
        if (parts.length < 2) {
          console.warn('⚠️ Invalid audioUrl format, could not parse Supabase path:', recording.audioUrl);
        } else {
          const path = parts[1];
          const { error: storageError } = await supabase
            .storage
            .from('recordings')
            .remove([path]);

          if (storageError) {
            console.error('❌ Supabase delete error:', storageError);
            throw storageError;
          }
        }
      }

      // Delete metadata from MongoDB via backend
      const token = localStorage.getItem('token');
      if (!token) throw new Error('❌ No auth token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '❌ Failed to delete recording from database');
      }

      // Update Zustand state
      set(state => ({
        recordings: state.recordings.filter(r => r.id !== recordingId)
      }));

      console.log('✅ Recording deleted successfully:', recordingId);
    } catch (error) {
      console.error('❌ Error deleting recording:', error);
      throw error;
    }
  },

  updateRecordingName: async (recordingId: string, newName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/${recordingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to rename recording');
      }

      const updated = await response.json();
      set(state => ({
        recordings: state.recordings.map(r =>
          r.id === recordingId ? { ...r, name: newName } : r
        )
      }));

      console.log('✅ Renamed recording:', updated);
    } catch (err) {
      console.error('❌ Rename failed:', err);
    }
  },

  setScale: (scale) => set({ currentScale: scale }),
  setOctave: (octave) => set({ currentOctave: octave }),

  loadRecordings: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        return;
      }
  
      // Fetch recordings metadata from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to load recordings');
      }
  
      const data = await response.json();
  
      // Fetch audio blobs and convert to ArrayBuffer
      const enriched = await Promise.all(
        data.map(async (recording: any) => {
          try {
            const res = await fetch(recording.audioUrl);
            const blob = await res.blob();
            const arrayBuffer = await blob.arrayBuffer();
            return { ...recording, audioData: arrayBuffer };
          } catch (err) {
            console.error(`⚠️ Failed to fetch audio for recording "${recording.name}":`, err);
            return recording; // fallback without audioData
          }
        })
      );
  
      set({ recordings: enriched });
    } catch (error) {
      console.error('❌ Error loading recordings:', error);
    }
  },  

  playRecording: async (recording) => {
    const { instrument } = get();
    if (!instrument) {
      console.error('Instrument not initialized');
      return;
    }

    try {
      await Tone.start();
      const now = Tone.now();

      // Play each note at its correct time
      recording.notes.forEach(({ note, time }) => {
        instrument.triggerAttackRelease(note, '8n', now + time);
      });

      set({ playing: true });

      // Set a timeout to reset `playing` state
      const duration = Math.max(...recording.notes.map(n => n.time)) + 1;
      setTimeout(() => {
        set({ playing: false });
      }, duration * 1000);

    } catch (error) {
      console.error('Error during note playback:', error);
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
          console.log('Recording stopped successfully:', data);

          // ✅ Add the new recording manually to Zustand
          get().addRecording(data);

          set(() => ({
            recording: false,
            recordingNotes: [],
            currentRecordingStartTime: null
          }));

          // Optional: reload all recordings to ensure backend sync
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

        set(() => ({
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
      await Tone.start();
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();

      Tone.Transport.stop();
      Tone.Transport.cancel();

      notes.forEach(({ note, time }) => {
        Tone.Transport.scheduleOnce(() => {
          get().playNote(note, Tone.now() + time);
        }, time);
      });

      Tone.Transport.start("+0.1");

      if (get().recording) {
        const duration = Math.max(...notes.map(n => n.time)) + 1;
        Tone.Transport.scheduleOnce(async () => {
          const data = await get().stopRecording();
          if (data) {
            set(() => ({
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