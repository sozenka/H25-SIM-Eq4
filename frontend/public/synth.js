
let synth;

let waveform;

// effets
let distortion;
let chorus;
let delay;
let reverb;

// indique si le navigateur est pret a jouer de l'audio
let ready = false;

let gui;

const typesOsc = [
    'sine',
    'square',
    'triangle',
    'sawtooth'
]

function setup() {
    createCanvas(1000, 800);
}

function initialiserSynth() {

    // initialisation des parametres par defaut

    synth = new Tone.Synth({
       
        oscillator: {
            type: 'sine'
        },

        envelope: {
            attack: 0.01, 
            decay: 0.2,
            sustain: 0.5,
            release: 1.5
        }
    });

    distortion = new Tone.Distortion({
        distortion: 0.3, 
        wet: 0        
    });

    chorus = new Tone.Chorus({
        frequency: 1.5,
        delayTime: 2.5,  
        depth: 0.4,      
        spread: 180,     
        wet: 0         
    }).start(); 

    delay = new Tone.FeedbackDelay({
        delayTime: "8n",
        feedback: 0.4,
        wet: 0
    });

    reverb = new Tone.Reverb({
        decay: 2.5,
        preDelay: 0.01,
        wet: 0
    });

    // branchement des effets en serie
    
    synth.connect(distortion);
    distortion.connect(chorus);
    chorus.connect(delay);
    delay.connect(reverb);
    reverb.toDestination();

    waveform = new Tone.Waveform();
    Tone.Master.connect(waveform); // l'onde correspond a la somme de tous les signaux audio sortant du master
    Tone.Master.volume.value = -6;


    // initialisaiton de l'interface utilisateur
    gui = new dat.GUI();
    gui.width = 500;
    gui.height =  500;
    gui.add(synth.oscillator, "type", typesOsc)
    const envelopeFolder = gui.addFolder('Envelope');
    const effectsFolder = gui.addFolder('Effects');
    // le 'wet' indique a quel point l'effet est ressenti. une valeur de 0 desactive l'effet.
    effectsFolder.add(distortion.wet, "value", 0, 1).step(0.01).name('distortion');
    effectsFolder.add(chorus.wet, "value", 0, 1).step(0.01).name('chorus');
    effectsFolder.add(delay.wet, "value", 0, 1).step(0.01).name('delay');
    effectsFolder.add(reverb.wet, "value", 0, 1).step(0.01).name('reverb');
    envelopeFolder.add(synth.envelope, "attack", 0, 5).step(0.01).name('attack');
    envelopeFolder.add(synth.envelope, "decay", 0, 5).step(0.01).name('decay');
    envelopeFolder.add(synth.envelope, "sustain", 0, 1).step(0.01).name('sustain');
    envelopeFolder.add(synth.envelope, "release", 0, 5).step(0.01).name('release');
    envelopeFolder.open();
    effectsFolder.open();

}

function draw() {

    if (!ready) {
        background('black');
        stroke('purple');
        line(0, height/2, width, height/2);
    
    } else {

        background(0, 20);
        stroke('white');
        noFill();

        let buffer = waveform.getValue(0); // partie de l'onde echantillionnee

        // cherche un endroit ou l'onde passe d'une valeur negative a positive pour determiner le debut du graphique
        let debut = 0;
        for (let i = 1; i < buffer.length; i++) {
            if (buffer[i-1] < 0 && buffer[i] >= 0) {
                debut = i;
                break;
            }
        }
        
        // coupe l'onde pour en montrer seulement une partie dans le graphique
        let fin = buffer.length/2 + debut;

        // dessine le graphique
        beginShape();
        for (let i = debut; i < buffer.length; i++) {

            let x = map(i, debut, fin, 0, width);
            let y = map(buffer[i], -1, 1, 0, height);

            vertex(x, y);
        }
        endShape();
    }
}

const playBtn = document.getElementById("play-btn")

playBtn.addEventListener("mousedown", () => {
    // attend un input pour jouer un son dans le navigateur
    if (ready == false) {
        ready = true;
        initialiserSynth();
    }
    synth.triggerAttack(random(220, 440)); // frequence de la note jouee
})

playBtn.addEventListener("mouseup", () => {
    synth.triggerRelease();
})