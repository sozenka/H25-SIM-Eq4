import { create } from 'zustand';
import * as Tone from 'tone';
import Meyda from 'meyda';
import { createClient } from '@supabase/supabase-js';
import { PitchDetector } from 'pitchy';
import { adminSupabase } from '../utils/supabaseAdmin';

// Instance du client Supabase
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Type pour les enregistrements audio
export interface Recording {
  id: string;
  userId: string;
  name: string;
  notes: Array<{ note: string; time: number }>;
  duration: string;
  createdAt: string;
  audioUrl: string;
  audioPath: string;
  audioData?: ArrayBuffer;
}

// État de l'application musicale
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

// Fonction pour obtenir ou créer un AudioContext
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Configuration de l'enregistreur audio
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
    console.error('Erreur lors de la configuration de l\'enregistreur:', error);
    throw error;
  }
};

// Conversion ArrayBuffer en Base64
// Utilisé pour l'envoi de données audio
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const binary = new Uint8Array(buffer);
  const bytes = Array.from(binary).map(byte => String.fromCharCode(byte));
  return btoa(bytes.join(''));
};

// Détection des accords à partir des fréquences
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

  // Normalisation des fréquences dans la plage des fréquences de notes
  for (const [chordName, chordFreqs] of Object.entries(chords)) {
    let matches = 0;
    for (const freq of chordFreqs) {
      const bin = Math.round(freq / binSize);
      if (frequencies[bin] > -60) { // Seuil de détection
        matches++;
      }
    }
    if (matches >= 2) { // Si au moins 2 fréquences correspondent
      detectedChords.push(chordName);
    }
  }

  return detectedChords.length > 0 ? detectedChords : ['Inconnu'];
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

  // Utilisation de Meyda pour l'analyse audio
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

  // Détection des pics
  const peaks: number[] = [];
  for (let i = 1; i < rmsValues.length - 1; i++) {
    if (rmsValues[i] > rmsValues[i - 1] && rmsValues[i] > rmsValues[i + 1]) {
      peaks.push(i);
    }
  }

  // Calcul de la durée moyenne entre les pics
  const avgTimeBetweenPeaks = peaks.length > 1
    ? (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1)
    : 0;

  // Conversion en BPM
  const bpm = avgTimeBetweenPeaks > 0
    ? Math.round(60 / (avgTimeBetweenPeaks * 512 / audioBuffer.sampleRate))
    : 120; // BPM par défaut
    
  // Limite le BPM entre 60 et 200
  return Math.min(Math.max(bpm, 60), 200);
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
      // Obtenir ou créer l'AudioContext d'abord
      const ctx = getAudioContext();

      // Reprendre l'AudioContext s'il est suspendu
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Démarrer Tone.js après que l'AudioContext soit prêt
      await Tone.start();

      // Initialiser le synthétiseur
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 1.5 },
      }).toDestination();

      synth.volume.value = 0;
      set({ instrument: synth });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'instrument:', error);
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
      if (!userStr) throw new Error('L\'utilisateur doit être authentifié');

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
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      throw error;
    }
  },

  stopRecording: async (customName?: string) => {
    const { recorder, recordingNotes, currentRecordingStartTime, user } = get();

    if (!recorder) {
      console.error('Aucune instance d\'enregistreur trouvée');
      return undefined;
    }

    if (!get().recording) {
      console.warn('Tentative d\'arrêt de l\'enregistrement, mais aucun enregistrement n\'est actif.');
      return;
    }

    try {
      console.log('Arrêt de l\'enregistrement avec les notes:', recordingNotes);
      const blob = await recorder.stop();
      const audioBuffer = await blob.arrayBuffer();
      console.log('Enregistrement arrêté, traitement du blob...');

      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('Aucun token d\'authentification ou données utilisateur trouvés');
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
          contentType: blob.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Échec du téléchargement audio vers Supabase:', uploadError);
        throw uploadError;
      }

      const duration = currentRecordingStartTime
        ? ((Date.now() - currentRecordingStartTime) / 1000).toFixed(2)
        : '0';

      const name = customName || `Enregistrement ${new Date().toISOString()}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Composition ${get().recordings.length + 1}`,
          notes: recordingNotes,
          audioPath: filePath,
          duration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Détails de l\'erreur de sauvegarde:', errorData);
        throw new Error('Échec de la sauvegarde de l\'enregistrement');
      }

      const dataResponse = await response.json();
      console.log('Sauvegarde réussie:', dataResponse);

      set(() => ({
        recording: false,
        recorder: null,
        recordingNotes: []
      }));

      return {
        id: dataResponse.recordingId,
        userId: user.id,
        name,
        notes: recordingNotes,
        duration,
        createdAt: new Date().toISOString(),
        audioUrl: '', // sera généré plus tard
        audioPath: filePath,
        audioData: audioBuffer
      };
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
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
        console.error('❌ ID d\'enregistrement invalide fourni à deleteRecording:', recordingId);
        return;
      }

      // Trouver l'enregistrement dans l'état local
      const recording = get().recordings.find(r => r.id === recordingId);
      if (!recording) {
        console.error('❌ Enregistrement non trouvé dans l\'état local pour l\'ID:', recordingId);
        return;
      }

      // Supprimer le fichier de Supabase Storage
      if (recording.audioUrl) {
        const parts = recording.audioUrl.split('/recordings/');
        if (parts.length < 2) {
          console.warn('⚠️ Format d\'URL audio invalide, impossible de parser le chemin Supabase:', recording.audioUrl);
        } else {
          const path = parts[1];
          const { error: storageError } = await supabase
            .storage
            .from('recordings')
            .remove([path]);

          if (storageError) {
            console.error('❌ Erreur de suppression Supabase:', storageError);
            throw storageError;
          }
        }
      }

      // Supprimer les métadonnées de MongoDB via le backend
      const token = localStorage.getItem('token');
      if (!token) throw new Error('❌ Aucun token d\'authentification');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '❌ Échec de la suppression de l\'enregistrement de la base de données');
      }

      // Mettre à jour l'état Zustand
      set(state => ({
        recordings: state.recordings.filter(r => r.id !== recordingId)
      }));

      console.log('✅ Enregistrement supprimé avec succès:', recordingId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'enregistrement:', error);
      throw error;
    }
  },

  updateRecordingName: async (recordingId: string, newName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun token d\'authentification');

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
        throw new Error(error.message || 'Échec du renommage de l\'enregistrement');
      }

      const updated = await response.json();
      set(state => ({
        recordings: state.recordings.map(r =>
          r.id === recordingId ? { ...r, name: newName } : r
        )
      }));

      console.log('✅ Enregistrement renommé:', updated);
    } catch (err) {
      console.error('❌ Échec du renommage:', err);
    }
  },

  setScale: (scale) => set({ currentScale: scale }),
  setOctave: (octave) => set({ currentOctave: octave }),

  loadRecordings: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Échec du chargement des enregistrements');
      const data = await response.json();

      const enriched = await Promise.all(
        data.map(async (recording: any) => {
          try {
            if (!recording.audioPath) {
              console.warn(`⚠️ Ignorer l'enregistrement invalide: ${recording.name} (pas de audioPath)`);
              return null;
            }

            const { data: signed, error } = await supabase
              .storage
              .from('recordings')
              .createSignedUrl(recording.audioPath, 60 * 60); // 1 heure

            if (error || !signed?.signedUrl) {
              console.warn(`❌ Impossible d'obtenir l'URL signée pour ${recording.name}:`, error);
              return null;
            }

            const res = await fetch(signed.signedUrl);
            const blob = await res.blob();
            const arrayBuffer = await blob.arrayBuffer();

            return {
              ...recording,
              id: recording._id || recording.id,
              audioUrl: signed.signedUrl,
              audioData: arrayBuffer
            };
          } catch (err) {
            console.error(`⚠️ Échec de la récupération audio pour "${recording.name}":`, err);
            return null;
          }
        })
      );

      const filtered = enriched.filter(Boolean) as Recording[];
      set({ recordings: filtered });
      console.log(`✅ ${filtered.length} enregistrements valides chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des enregistrements:', error);
    }
  },

  playRecording: async (recording) => {
    const { instrument } = get();
    if (!instrument) {
      console.error('Instrument non initialisé');
      return;
    }

    try {
      await Tone.start();
      const now = Tone.now();

      // Jouer chaque note à son temps correct
      recording.notes.forEach(({ note, time }) => {
        instrument.triggerAttackRelease(note, '8n', now + time);
      });

      set({ playing: true });

      // Définir un délai pour réinitialiser l'état `playing`
      const duration = Math.max(...recording.notes.map(n => n.time)) + 1;
      setTimeout(() => {
        set({ playing: false });
      }, duration * 1000);

    } catch (error) {
      console.error('Erreur lors de la lecture des notes:', error);
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

    // Détection de la hauteur
    const detector = PitchDetector.forFloat32Array(bufferLength);
    const pitch = detector.findPitch(dataArray, ctx.sampleRate);

    // Détection de la gamme basée sur la hauteur
    const scale = pitch ? pitch[0].toFixed(2) : 'Inconnue';

    // Détection des accords
    const chords = detectChords(dataArray, ctx.sampleRate);

    // Détection du tempo
    const tempo = await detectTempo(audioBuffer);

    return {
      scale,
      chords,
      tempo
    };
  },

  handleRecordingToggle: async () => {
    const { recording } = get();
    console.log('Changement d\'état d\'enregistrement:', recording);

    if (recording) {
      try {
        console.log('Tentative d\'arrêt de l\'enregistrement...');
        const data = await get().stopRecording();

        if (data) {
          console.log('Enregistrement arrêté avec succès:', data);

          // ✅ Ajouter le nouvel enregistrement manuellement à Zustand
          get().addRecording(data);

          set(() => ({
            recording: false,
            recordingNotes: [],
            currentRecordingStartTime: null
          }));

          // Optionnel: recharger tous les enregistrements pour assurer la synchronisation avec le backend
          await get().loadRecordings();
        } else {
          console.log('Aucune donnée d\'enregistrement retournée');
        }
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
        throw error;
      }
    } else {
      try {
        console.log('Démarrage d\'un nouvel enregistrement...');
        await get().startRecording();

        set(() => ({
          recording: true,
          recordingNotes: [],
          currentRecordingStartTime: Date.now()
        }));
      } catch (error) {
        console.error('Erreur lors du démarrage de l\'enregistrement:', error);
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
      console.error('Erreur lors de la lecture du piano roll:', error);
      throw error;
    }
  },
  set
}));