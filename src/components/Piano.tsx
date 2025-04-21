import React, { useEffect, useState } from "react";
import { useMusicStore } from "../store/musicStore";
import RecordingControls from "./RecordingControls";

interface PianoProps {
  onKeyPress: (keyIndex: number, isBlackKey: boolean) => void;
}

const Piano: React.FC<PianoProps> = ({ onKeyPress }) => {
  const { initializeInstrument, playNote, currentOctave, currentScale, recording } =
    useMusicStore();
  const [playOnlyMode, setPlayOnlyMode] = useState(false);

  useEffect(() => {
    initializeInstrument();
  }, [initializeInstrument]);

  const isNoteInScale = (note: string) => {
    const majorScales: { [key: string]: string[] } = {
      C: ["C", "D", "E", "F", "G", "A", "B"],
      G: ["G", "A", "B", "C", "D", "E", "F#"],
      D: ["D", "E", "F#", "G", "A", "B", "C#"],
    };
    return majorScales[currentScale]?.includes(note.replace("#", "")) ?? true;
  };

  const handleKeyClick = (note: string, index: number, isBlackKey: boolean) => {
    if (playOnlyMode && recording) return; // Don't play if in play-only mode and recording
    playNote(`${note}${currentOctave}`);
    onKeyPress(index + 1, isBlackKey);
  };

  const whiteKeys = [
    "C", "D", "E", "F", "G", "A", "B",
    "C", "D", "E", "F", "G", "A", "B",
    "C", "D", "E", "F", "G", "A", "B",
    "C", "D", "E", "F", "G", "A", "B",
  ];

  const blackKeys = [
    "C#", "D#", "F#", "G#", "A#",
    "C#", "D#", "F#", "G#", "A#",
    "C#", "D#", "F#", "G#", "A#",
    "C#", "D#", "F#", "G#", "A#",
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setPlayOnlyMode(!playOnlyMode)}
          className={`px-4 py-2 rounded-lg ${
            playOnlyMode ? "bg-blue-500" : "bg-gray-500"
          } text-white font-semibold transition-colors`}
        >
          {playOnlyMode ? "Play Only Mode" : "Normal Mode"}
        </button>
      </div>
      
      <RecordingControls />
      
      <div className="relative flex flex-col items-center py-4 space-y-0">
        {whiteKeys.map((note, index) => {
          const isBlackKey = blackKeys.includes(note + "#");

          return (
            <div key={index} className="relative">
              {/* White Key */}
              <button
                onClick={() => handleKeyClick(note, index, false)}
                className="w-40 h-[60px] bg-white border border-gray-300 flex items-center justify-center text-gray-600"
              >
                {note}
              </button>

              {/* Black Key (conditionally rendered) */}
              {isBlackKey && (
                <button
                  onClick={() => handleKeyClick(note + "#", index, true)}
                  className="absolute w-20 h-[40px] bg-black text-white"
                  style={{
                    left: "50%",
                    top: "38px",
                    zIndex: 1,
                  }}
                >
                  {note}#
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Piano;