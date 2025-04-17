import { create } from 'zustand'
import * as Tone from 'tone'

interface MusicState {
  instrument: Tone.PolySynth | null
  recording: boolean
  currentScale: string
  currentOctave: number
  recordings: Array<{
    id: number
    name: string
    date: string
    duration: string
    notes: Array<{ note: string; time: number }>
  }>
  initializeInstrument: () => Promise<void>
  playNote: (note: string) => void
  startRecording: () => void
  stopRecording: () => void
  setScale: (scale: string) => void
  setOctave: (octave: number) => void
  addRecording: (recording: { name: string; notes: Array<{ note: string; time: number }> }) => void
}

const synth = new Tone.PolySynth().toDestination()

export const useMusicStore = create<MusicState>((set, get) => ({
  instrument: null,
  recording: false,
  currentScale: 'C',
  currentOctave: 4,
  recordings: [],

  initializeInstrument: async () => {
    await Tone.start()
    set({ instrument: synth })
  },

  playNote: (note: string) => {
    const { instrument, recording } = get()
    if (instrument) {
      instrument.triggerAttackRelease(note, '8n')
      if (recording) {
        // Add note to current recording
        const time = Tone.now()
        // Implementation for recording notes would go here
      }
    }
  },

  startRecording: () => {
    set({ recording: true })
  },

  stopRecording: () => {
    set({ recording: false })
  },

  setScale: (scale: string) => {
    set({ currentScale: scale })
  },

  setOctave: (octave: number) => {
    set({ currentOctave: octave })
  },

  addRecording: (recording) => {
    const { recordings } = get()
    const newRecording = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      duration: '0:30', // This would be calculated based on actual recording length
      ...recording,
    }
    set({ recordings: [...recordings, newRecording] })
  },
}))