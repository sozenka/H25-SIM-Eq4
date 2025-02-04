import React, { useEffect } from 'react'
import { useMusicStore } from '../store/musicStore'

const Piano: React.FC = () => {
  const { initializeInstrument, playNote, currentOctave, currentScale } = useMusicStore()

  useEffect(() => {
    initializeInstrument()
  }, [initializeInstrument])

  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#']

  const isNoteInScale = (note: string) => {
    const majorScales: { [key: string]: string[] } = {
      'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    }
    return majorScales[currentScale]?.includes(note.replace('#', '')) ?? true
  }

  const handleKeyClick = (note: string) => {
    playNote(`${note}${currentOctave}`)
  }

  return (
    <div className="relative h-48 bg-white rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex">
        {/* White keys */}
        {whiteKeys.map((note) => (
          <button
            key={note}
            onClick={() => handleKeyClick(note)}
            className={`flex-1 h-full border-r border-gray-200 hover:bg-gray-100 transition-colors
              ${isNoteInScale(note) ? 'bg-white' : 'bg-gray-100'}`}
          >
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
              {note}
            </span>
          </button>
        ))}
      </div>

      {/* Black keys */}
      <div className="absolute inset-0 flex">
        {blackKeys.map((note, index) => {
          const offset = index < 2 ? index * 2 + 1 : index * 2 + 2
          return (
            <button
              key={note}
              onClick={() => handleKeyClick(note)}
              style={{ left: `${(offset * 100) / 7}%` }}
              className={`absolute w-[12%] h-[60%] hover:bg-gray-700 transition-colors
                ${isNoteInScale(note) ? 'bg-gray-800' : 'bg-gray-600'}`}
            >
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
                {note}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Piano