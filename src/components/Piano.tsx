import React, { useEffect } from "react";
import { useMusicStore } from "../store/musicStore";

interface PianoProps {
  onKeyPress: (keyIndex: number, isBlackKey: boolean) => void;
}

const Piano: React.FC<PianoProps> = ({ onKeyPress }) => {
  const { initializeInstrument, playNote, currentOctave, currentScale } =
    useMusicStore();

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
  );
};

export default Piano;