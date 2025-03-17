import React, { useEffect } from "react";
import { useMusicStore } from "../store/musicStore";

const Piano: React.FC = () => {
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

  const handleKeyClick = (note: string) => {
    playNote(`${note}${currentOctave}`);
  };

  const whiteKeys = [
    "C",
    "D",
    "E",
    "F",
    "G",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "A",
    "B",
  ];
  const blackKeys = [
    "C#",
    "D#",
    "F#",
    "G#",
    "A#",
    "C#",
    "D#",
    "F#",
    "G#",
    "A#",
  ];

  return (
    <div className="relative flex flex-col items-center py-4 space-y-0">
      {whiteKeys.map((note, index) => {
        const isBlackKey = blackKeys.includes(note + "#"); // Check if a black key exists for this note
        return (
          <div key={index} className="relative">
            {/* White Key */}
            <button
              onClick={() => handleKeyClick(note)}
              className="w-40 h-20 bg-white border border-gray-300 flex items-center justify-center text-gray-600"
            >
              {note}
            </button>

            {/* Black Key (conditionally rendered) */}
            {isBlackKey && (
              <button
                onClick={() => handleKeyClick(note + "#")}
                className="absolute w-20 h-10 bg-black text-white"
                style={{
                  left: "50%", // Shift black key to the right side of the white key
                  top: "58px", // Move black key slightly up
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
