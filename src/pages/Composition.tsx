import React, { useState, useRef } from "react";
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

  const { startRecording, stopRecording, recording, playNote, currentOctave } =
    useMusicStore();

  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const noteMap: string[] = [
    "C3",
    "C#3",
    "D3",
    "D#3",
    "E3",
    "F3",
    "F#3",
    "G3",
    "G#3",
    "A3",
    "A#3",
    "B3",
    "C4",
    "C#4",
    "D4",
    "D#4",
    "E4",
    "F4",
    "F#4",
    "G4",
    "G#4",
    "A4",
    "A#4",
    "B4",
    "C5",
    "C#5",
    "D5",
    "D#5",
    "E5",
    "F5",
    "F#5",
    "G5",
    "G#5",
    "A5",
    "A#5",
    "B5",
    "C6",
    "C#6",
    "D6",
    "D#6",
    "E6",
    "F6",
    "F#6",
    "G6",
    "G#6",
    "A6",
    "A#6",
    "B6",
  ];

  const changerEtatNote = (row: number, col: number) => {
    const carre = `${row}:${col}`;
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(carre)) {
        newSet.delete(carre);
      } else {
        newSet.add(carre);
      }
      return newSet;
    });
  };

  const handleKeyPress = (keyIndex: number, isBlackKey: boolean) => {
    let trueKeyIndex = 0;
    if (!isBlackKey) {
      trueKeyIndex = nombresKeys[keyIndex - 1];
    } else {
      trueKeyIndex = nombresBlackKeys[keyIndex - 1];
    }
    // setActiveKeys((prev) => [...new Set([...prev, trueKeyIndex])]);
    // setTimeout(() => {
    //   setActiveKeys((prev) => prev.filter((k) => k !== trueKeyIndex));
    // }, 500);
  };

  const [playing, setPlaying] = useState(false);
  const [colonneActuelle, setColonneActuelle] = useState<number | null>(null);
  const intervalle = useRef<NodeJS.Timeout | null>(null);
  const colonneRef = useRef(0);

  const playPianoRoll = () => {
    setPlaying(true);
    colonneRef.current = 0;

    intervalle.current = setInterval(() => {
      const currentCol = colonneRef.current;
      setColonneActuelle(currentCol);

      activeNotes.forEach((carre) => {
        //extraire numeros de ligne et colonne
        const [rowStr, colStr] = carre.split(":");
        const row = parseInt(rowStr);
        const col = parseInt(colStr);

        if (col === currentCol && noteMap[row]) {
          //verifier si la note est dans la colonne actuelle
          playNote(noteMap[row]);
        }
      });

      colonneRef.current++;

      if (colonneRef.current >= 100) {
        clearInterval(intervalle.current!); //pour faire le reset a la fin des 100 colonnes
        setColonneActuelle(null);
        setPlaying(false);
      }
    }, 200); //tempo de la barre
  };

  const jouerNotesColonneAct = (colonne: number) => {
    const notesDansColonne = Array.from(activeNotes) //transforme le set en array pour faciliter les manipulations
      .filter((noteStr) => {
        const [rowStr, colStr] = noteStr.split(":");
        return parseInt(colStr) === colonne;
      })
      .map((noteStr) => {
        const [rowStr, _] = noteStr.split(":");
        const row = parseInt(rowStr);
        const noteEnMidi = 48 + row;
        return noteEnMidi;
      });

    console.log("Note jouee a colonne ", colonne, ": ", notesDansColonne);
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
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "repeat(100, 35px)",
                    gridTemplateRows: "repeat(48, 35px)",
                  }}
                >
                  {Array.from({ length: 48 * 100 }).map((_, index) => {
                    const row = Math.floor(index / 100); //pour verifier la rangee du carre
                    const col = index % 100;
                    const carre = `${row}:${col}`;
                    const isDarkRow = nombresBlackKeys.includes(row + 1);
                    const isActive = activeNotes.has(carre);

                    const isColonneAct = col == colonneActuelle;

                    return (
                      <div
                        key={index}
                        onClick={() => changerEtatNote(row, col)}
                        className={`border border-gray-300 cursor-pointer transition-colors duration-75
                          ${
                            isColonneAct
                              ? "bg-pink-400"
                              : isActive
                              ? "bg-blue-500 hover:bg-blue-600"
                              : isDarkRow
                              ? "bg-purple-700 hover:bg-purple-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          }`}
                      />
                    );
                  })}
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
                onClick={() => {
                  if (playing) {
                    clearInterval(intervalle.current!);
                    setPlaying(false);
                    setColonneActuelle(null);
                  } else {
                    playPianoRoll();
                  }
                }}
                className={`w-full py-2 rounded ${
                  playing
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                } text-white transition-colors`}
              >
                {playing ? "Arrêter la lecture" : "Démarrer la lecture"}
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
