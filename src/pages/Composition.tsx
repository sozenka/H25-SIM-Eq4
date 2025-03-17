import React from "react";
import Piano from "../components/Piano";
import { useMusicStore } from "../store/musicStore";

const Composition = () => {
  const { startRecording, stopRecording, recording } = useMusicStore();

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
        <Piano />
        <div className="grid md:grid-cols-[4fr_1fr] gap-6">
          <div className="w-full overflow-x-auto scroll-smooth whitespace-nowrap">
            <div
              className="bg-black/20 p-4 rounded-lg border border-purple-500/20 w-[200%] h-full"
              // style={{ width: "5000px", height: "300px" }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Layers</h3>
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
