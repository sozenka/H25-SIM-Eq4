import React from "react";
import Piano from "../components/Piano";
import { useMusicStore } from "../store/musicStore";

const Composition = () => {
  // const { startRecording, stopRecording, recording } = useMusicStore()

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
    <div className="flex flex-col items-center space-y-2 py-4">
      {/* White Keys Container */}
      <div className="flex flex-col items-center space-y-2">
        {whiteKeys.map((note, index) => (
          <div
            key={index}
            className="w-16 h-24 bg-white border-b-2 border-gray-300 flex items-center justify-center text-gray-600"
          >
            {note}
          </div>
        ))}
      </div>

      {/* Black Keys Container */}
      <div className="absolute flex flex-col items-center space-y-2">
        {blackKeys.map((note, index) => {
          const offset = index < 2 ? index * 2 + 1 : index * 2 + 2; // Ensure black keys are positioned correctly
          return (
            <div
              key={index}
              className="w-10 h-16 bg-black text-white absolute"
              style={{ top: `${offset * 10}px` }} // Adjusting positioning for black keys
            >
              {note}
            </div>
          );
        })}
      </div>
    </div>
  );

  // return (
  //   <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
  //     <h2 className="text-3xl font-bold text-white mb-8">Studio de Composition</h2>
  //     <div className="space-y-8">
  //       <Piano />

  //       <div className="grid md:grid-cols-3 gap-6">
  //         <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
  //           <h3 className="text-xl font-semibold text-white mb-4">Instruments</h3>
  //           <div className="space-y-2">
  //             {['Piano', 'Guitare', 'Synthétiseur'].map((instrument) => (
  //               <button
  //                 key={instrument}
  //                 className="w-full text-left px-4 py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
  //               >
  //                 {instrument}
  //               </button>
  //             ))}
  //           </div>
  //         </div>

  //         <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
  //           <h3 className="text-xl font-semibold text-white mb-4">Gammes</h3>
  //           <div className="space-y-2">
  //             {['Majeure', 'Mineure', 'Pentatonique'].map((scale) => (
  //               <button
  //                 key={scale}
  //                 className="w-full text-left px-4 py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
  //               >
  //                 {scale}
  //               </button>
  //             ))}
  //           </div>
  //         </div>

  //         <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
  //           <h3 className="text-xl font-semibold text-white mb-4">Enregistrement</h3>
  //           <div className="space-y-4">
  //             <button
  //               onClick={recording ? stopRecording : startRecording}
  //               className={`w-full py-2 rounded ${
  //                 recording
  //                   ? 'bg-red-600 hover:bg-red-700'
  //                   : 'bg-red-500 hover:bg-red-600'
  //               } text-white transition-colors`}
  //             >
  //               {recording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
  //             </button>
  //             <button
  //               className="w-full py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
  //               disabled={recording}
  //             >
  //               Lecture
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
};

export default Composition;
