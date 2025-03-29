import React, { useState } from "react";
import Piano from "../components/Piano";
import { useMusicStore } from "../store/musicStore";

const Composition = () => {
  const PIANO_HEIGHT = 40; //a changer au besoin
  const nombresKeys = [
    1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25, 27, 29, 30, 32, 34,
    36, 37, 39, 41, 42, 44, 46, 48,
  ];
  const nombreKeys2 = [3, 8, 10, 15, 20, 22, 27, 32, 34, 39, 44, 46];
  const nombresBlackKeys = [
    2, 4, 7, 9, 11, 14, 16, 19, 21, 23, 26, 28, 31, 33, 35, 38, 40, 43, 45, 47,
  ];

  const { startRecording, stopRecording, recording } = useMusicStore();

  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  const handleKeyPress = (keyIndex: number, isBlackKey: boolean) => {
    let trueKeyIndex = 0;
    if (!isBlackKey) {
      trueKeyIndex = nombresKeys[keyIndex - 1];
    } else {
      trueKeyIndex = nombresBlackKeys[keyIndex - 1];
    }
    setActiveKeys((prev) => [...new Set([...prev, trueKeyIndex])]);
    setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== trueKeyIndex));
    }, 500);
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-purple-500/20">
      {" "}
      {/*Vertical stacking*/}
      <h2 className="text-3xl font-bold text-white mb-8">
        Studio de Composition
      </h2>
      <div className="space-x-8 flex">
        {" "}
        {/*Horizontal stacking*/}
        {/* <div className="h-[700px] overflow-y-auto scroll-smooth whitespace-nowrap">
          
        </div> */}
        <div className="grid md:grid-cols-[4fr_1fr] gap-6">
          <div className="h-[700px] w-full overflow-x-auto overflow-y-auto scroll-smooth whitespace-nowrap">
            <div className="flex h-full">
              {/*Piano container*/}
              <div className="flex-shrink-0 min-h-[700px]">
                <Piano onKeyPress={handleKeyPress} />
              </div>

              {/*Layers container*/}
              <div
                className="bg-black/20 p-4 rounded-lg border border-purple-500/20 flex-shrink-0"
                style={{ width: "200%", height: "1700px" }}
              >
                {/*Grid with 48 rows for the keys*/}
                <div className="grid gap-1">
                  {Array.from({ length: 48 }).map((_, index) => (
                    <div
                      key={index}
                      className={`bg-gray-300 p-2 rounded ${
                        nombresBlackKeys.includes(index + 1)
                          ? "bg-gray-500"
                          : "bg-gray-300"
                      } ${
                        nombresKeys.includes(index + 1) &&
                        !nombreKeys2.includes(index + 1)
                          ? "h-[34px]"
                          : "h-[29.5px]"
                      } ${
                        activeKeys.includes(index + 1) ? "bg-yellow-400" : ""
                      }`}
                    >
                      <p>Container {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Instruments
            </h3>
            <div className="space-y-2">
              {["Piano", "Guitare", "Synthétiseur"].map((instrument) => (
                <button
                  key={instrument}
                  className="w-full text-left px-4 py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                >
                  {instrument}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Gammes</h3>
            <div className="space-y-2">
              {["Majeure", "Mineure", "Pentatonique"].map((scale) => (
                <button
                  key={scale}
                  className="w-full text-left px-4 py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                >
                  {scale}
                </button>
              ))}
            </div>
          </div> */}

          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Enregistrement
            </h3>
            <div className="space-y-4">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full py-2 rounded ${
                  recording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                } text-white transition-colors`}
              >
                {recording
                  ? "Arrêter l'enregistrement"
                  : "Démarrer l'enregistrement"}
              </button>
              <button
                className="w-full py-2 rounded bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                disabled={recording}
              >
                Lecture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Composition;
