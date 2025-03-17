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
    <div className="relative flex flex-col items-center py-4 space-y-1">
      {/* White Keys Container */}
      <div className="flex flex-col items-center space-y-1">
        {whiteKeys.map((note, index) => (
          <div
            key={index}
            className="w-16 h-32 bg-white border-b-2 border-gray-300 flex items-center justify-center text-gray-600"
          >
            {note}
          </div>
        ))}
      </div>

      {/* Black Keys Container */}
      <div className="absolute flex flex-col items-center space-y-1">
        {blackKeys.map((note, index) => {
          const whiteKeyIndex = index; // Mapping black key to white key index
          const positionLeft = `${(whiteKeyIndex + 0.5) * 16}px`; // Align black keys with the middle of white keys

          return (
            <div
              key={index}
              className="w-10 h-20 bg-black text-white absolute"
              style={{
                top: `${(index + 0.5) * 32}px`, // Halfway over the white key
                left: positionLeft, // Align black keys over the white keys
                zIndex: 1,
              }}
            >
              {note}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// const Piano: React.FC = () => {
//   const { initializeInstrument, playNote, currentOctave, currentScale } =
//     useMusicStore();

//   useEffect(() => {
//     initializeInstrument();
//   }, [initializeInstrument]);

//   const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
//   const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

//   const isNoteInScale = (note: string) => {
//     const majorScales: { [key: string]: string[] } = {
//       C: ["C", "D", "E", "F", "G", "A", "B"],
//       G: ["G", "A", "B", "C", "D", "E", "F#"],
//       D: ["D", "E", "F#", "G", "A", "B", "C#"],
//     };
//     return majorScales[currentScale]?.includes(note.replace("#", "")) ?? true;
//   };

//   const handleKeyClick = (note: string) => {
//     playNote(`${note}${currentOctave}`);
//   };

//   return (
//     <div className="relative flex flex-col items-center py-4 space-y-1">
//       {/* White Keys Container */}
//       <div className="flex flex-col items-center space-y-1">
//         {whiteKeys.map((note, index) => (
//           <div
//             key={index}
//             className="w-16 h-32 bg-white border-b-2 border-gray-300 flex items-center justify-center text-gray-600"
//           >
//             {note}
//           </div>
//         ))}
//       </div>

//       {/* Black Keys Container */}
//       <div className="absolute flex flex-col items-center space-y-1">
//         {blackKeys.map((note, index) => {
//           // Calculate the left positioning for black keys so they stay aligned with white keys
//           const offset = index < 2 ? index * 2 + 1 : index * 2 + 2; // Ensures black keys are positioned correctly over white keys
//           return (
//             <div
//               key={index}
//               className="w-10 h-20 bg-black text-white absolute"
//               style={{ top: `${(index + 0.5) * 32}px`, zIndex: 1 }}
//             >
//               {note}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

// return (

//   <div className="relative h-40 bg-white rounded-lg overflow-hidden rotate-90">
//     <div className="absolute inset-0 flex">
//       {/* White keys */}
//       {whiteKeys.map((note) => (
//         <button
//           key={note}
//           onClick={() => handleKeyClick(note)}
//           className={`basis-[5%] h-full border-r border-gray-200 hover:bg-gray-100 transition-colors
//             ${isNoteInScale(note) ? 'bg-white' : 'bg-gray-100'} `}
//         >
//           <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
//             {note}
//           </span>
//         </button>
//       ))}
//     </div>

//     {/* Black keys */}
//     <div className="absolute inset-0 flex rotate-90">
//       {blackKeys.map((note, index) => {
//         const offset = index < 2 ? index * 2 + 1 : index * 2 + 2
//         return (
//           <button
//             key={note}
//             onClick={() => handleKeyClick(note)}
//             style={{ left: `${(offset * 100) / (whiteKeys.length + blackKeys.length)}%` }}
//             className={`absolute w-[12%] h-[60%] hover:bg-gray-700 transition-colors
//               ${isNoteInScale(note) ? 'bg-gray-800' : 'bg-gray-600'}`}
//           >
//             <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
//               {note}
//             </span>
//           </button>
//         )
//       })}
//     </div>
//   </div>
// )
// };

export default Piano;
