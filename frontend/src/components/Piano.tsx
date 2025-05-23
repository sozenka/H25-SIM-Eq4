import React, { useEffect } from "react";
import { useMusicStore } from "../store/musicStore";

// Interface pour les propriétés du piano
interface PianoProps {
  onKeyPress: (keyIndex: number, isBlackKey: boolean) => void;
}

const Piano: React.FC<PianoProps> = ({ onKeyPress }) => {
  const { initializeInstrument, playNote, currentOctave, currentScale } =
    useMusicStore();

  useEffect(() => {
    initializeInstrument();
  }, [initializeInstrument]);

  // Vérifier si une note est dans la gamme actuelle
  const isNoteInScale = (note: string) => {
    const majorScales: { [key: string]: string[] } = {
      C: ["C", "D", "E", "F", "G", "A", "B"],
      G: ["G", "A", "B", "C", "D", "E", "F#"],
      D: ["D", "E", "F#", "G", "A", "B", "C#"],
    };
    return majorScales[currentScale]?.includes(note.replace("#", "")) ?? true;
  };

  // Gérer le clic sur une touche
  const handleKeyClick = (note: string, index: number, isBlackKey: boolean) => {
    playNote(`${note}${currentOctave}`);
    onKeyPress(index + 1, isBlackKey);
  };

  // Touches blanches du piano
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

  // Touches noires du piano
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
        const isBlackKey = blackKeys.includes(note + "#");

        return (
          <div key={index} className="relative">
            {/* Touches blanches */}
            <button
              onClick={() => handleKeyClick(note, index, false)}
              className="w-40 h-[60px] bg-white border border-gray-300 flex items-center justify-center text-gray-600"
            >
              {note}
            </button>

            {/* Touches noires */}
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
