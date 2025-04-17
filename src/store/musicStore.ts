import { create } from 'zustand'
import * as Tone from 'tone'

interface Recording {
  id: string
  userId: string
  name: string
  notes: Array<{ note: string; time: number }>
  duration: string
  createdAt: string
  audioData?: ArrayBuffer
}

interface MusicState {
  instrument: Tone.PolySynth | null
  recording: boolean
  currentScale: string
  currentOctave: number
  recordings: Recording[]
  recordingNotes: Array<{ note: string; time: number }>
  currentRecordingStartTime: number | null
  recordingAudioData: ArrayBuffer | null
  user: { id: string; email: string } | null
  initializeInstrument: () => Promise<void>
  playNote: (note: string) => void
  startRecording: () => void
  stopRecording: () => Promise<Recording | undefined>
  addRecording: (recording: Recording) => void
  setScale: (scale: string) => void
  setOctave: (octave: number) => void
  loadRecordings: () => Promise<void>
  setUser: (user: { id: string; email: string } | null) => void
  playRecording: (recording: Recording) => void
  analyzeAudio: (audioData: ArrayBuffer) => Promise<{
    scale: string
    chords: string[]
    tempo: number
  }>
}

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 1 },
}).toDestination()

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
const destination = audioContext.createMediaStreamDestination()
const mediaRecorder = new MediaRecorder(destination.stream)
let chunks: BlobPart[] = []

mediaRecorder.ondataavailable = (e) => {
  chunks.push(e.data)
}

let resolveRecordingPromise: ((rec: Recording | undefined) => void) | null = null

mediaRecorder.onstop = async () => {
  const blob = new Blob(chunks, { type: 'audio/webm' })
  const arrayBuffer = await blob.arrayBuffer()
  const { recordingNotes, currentRecordingStartTime, recordings, user } = useMusicStore.getState()

  if (!user || !currentRecordingStartTime) {
    resolveRecordingPromise?.(undefined)
    return
  }

  const durationSeconds = ((Date.now() - currentRecordingStartTime) / 1000).toFixed(2)

  const newRecording: Recording = {
    id: crypto.randomUUID(),
    userId: user.id,
    name: `Composition ${recordings.length + 1}`,
    notes: recordingNotes,
    duration: `${durationSeconds}s`,
    createdAt: new Date().toISOString(),
    audioData: arrayBuffer,
  }

  useMusicStore.setState((state) => ({
    recordings: [...state.recordings, newRecording],
    recording: false,
    recordingNotes: [],
    recordingAudioData: arrayBuffer,
    currentRecordingStartTime: null,
  }))

  resolveRecordingPromise?.(newRecording)
  resolveRecordingPromise = null
  chunks = []
}

let localRecordings: Recording[] = []

export const useMusicStore = create<MusicState>((set, get) => ({
  instrument: null,
  recording: false,
  currentScale: 'C',
  currentOctave: 4,
  recordings: [],
  recordingNotes: [],
  currentRecordingStartTime: null,
  recordingAudioData: null,
  user: { id: 'default-user', email: 'test@harmonia.app' }, // default for dev

  initializeInstrument: async () => {
    await Tone.start();
  
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  
    synth.volume.value = -10;
    set({ instrument: synth });
  },
  

  playNote: (note: string) => {
    const { instrument, recording, currentRecordingStartTime } = get()
    if (!instrument) return
    instrument.triggerAttackRelease(note, '8n')

    if (recording && currentRecordingStartTime) {
      const time = (Date.now() - currentRecordingStartTime) / 1000
      set((state) => ({
        recordingNotes: [...state.recordingNotes, { note, time }],
      }))
    }
  },

  startRecording: () => {
    chunks = []
    mediaRecorder.start()
    set({
      recording: true,
      recordingNotes: [],
      currentRecordingStartTime: Date.now(),
    })
  },

  stopRecording: async () => {
    return new Promise<Recording | undefined>((resolve) => {
      if (!get().recording) return resolve(undefined)
      resolveRecordingPromise = resolve
      mediaRecorder.stop()
    })
  },

  addRecording: (recording) => {
    set((state) => ({
      recordings: [...state.recordings, recording],
    }))
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

  loadRecordings: async () => {
    const { user } = get()
    if (!user) return
    const userRecordings = localRecordings.filter((r) => r.userId === user.id)
    set({ recordings: userRecordings })
  },

  setUser: (user) => {
    set({ user })
    if (user) get().loadRecordings()
    else set({ recordings: [] })
  },

  playRecording: (recording) => {
    const { instrument } = get()
    if (!instrument) return
    const startTime = Tone.now()
    recording.notes.forEach(({ note, time }) => {
      instrument.triggerAttackRelease(note, '8n', startTime + time)
    })
  },

  analyzeAudio: async (audioData) => {
    const audioBuffer = await audioContext.decodeAudioData(audioData)
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(analyser)

    const frequencyData = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(frequencyData)

    const dominantFrequencies = frequencyData
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)

    const noteFrequencies: { [key: string]: number } = {
      C: 261.63, 'C#': 277.18, D: 293.66, 'D#': 311.13, E: 329.63,
      F: 349.23, 'F#': 369.99, G: 392.0, 'G#': 415.3, A: 440.0, 'A#': 466.16, B: 493.88,
    }

    const detectedNotes = dominantFrequencies.map((freq) => {
      const hz = (freq.index * audioContext.sampleRate) / analyser.frequencyBinCount
      return Object.entries(noteFrequencies).reduce(
        (closest, [note, noteHz]) =>
          Math.abs(hz - noteHz) < Math.abs(hz - noteFrequencies[closest]) ? note : closest,
        'C'
      )
    })

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
}))
