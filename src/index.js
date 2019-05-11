const Tone = require('tone');
import './main.css';
import beepUrl from '../public/beep.flac';
import boapUrl from '../public/boap.flac';
import pauseButtonImg from '../public/pause-button-img.png';
import playButtonImg from '../public/play-button-img.png';

Tone.Transport.start(0);
// amount of time events
Tone.context.lookAhead = 0;
// set latency !!! important !!!
Tone.context.latencyHint = 'fastest';

// init value of metronome
Tone.Transport.bpm.value = 100;
const bpmLimit = {
	min : 10,
	max : 400
};
const lightsContainer = document.querySelector('.lights-container');
const bpmText = document.querySelector('.bpm');
bpmText.innerHTML = Tone.Transport.bpm.value;
let timeSign = {
	beats : 0,
	note  : 0
};
let subdivision = 0;
let notePerSubdiv = 0;
let beatsPerLoop = 0;
let counter = 1;
let loop = null;
let beep = new Tone.Player(beepUrl).toMaster();
let boap = new Tone.Player(boapUrl).toMaster();
let activeLight = null;
let preLight = null;
let lightCounter = 1;
let selectSubd = document.querySelector('.select-subdivision');
let isBPLInt = false;
let isBPLightInt = false;
let isNoteEqualToSubdiv = false;
let beatsPerLight = 0;
let subdivPerNote = 0;

function lightActivate() {
	activeLight = document.getElementById(lightCounter);
	preLight = activeLight;
	activeLight.classList.add('light-active');
	lightCounter === timeSign.beats ? (lightCounter = 1) : lightCounter++;
}

function metronome() {
	//lights section
	//remove previous light
	if (preLight !== null) {
		preLight.classList.remove('light-active');
	}

	if (subdivPerNote === 1) {
		lightActivate();
	} else {
		counter % subdivPerNote === 1 && lightActivate();
	}

	// beep section
	// always beep at first point
	if (counter === 1) {
		beep.start();
	} else {
		if (isNoteEqualToSubdiv) {
			boap.start();
		} else if (!isBPLightInt) {
			counter % 2 === 1 && boap.start();
		} else {
			if (notePerSubdiv !== 1) {
				if (notePerSubdiv < 1) {
					boap.start();
				} else {
					counter % 2 === 1 && boap.start();
				}
			} else {
				counter % notePerSubdiv === 1 && boap.start();
			}
		}
	}

	counter === beatsPerLoop ? (counter = 1) : counter++;
}

function shuffleMetronome() {
	if (preLight !== null) {
		preLight.classList.remove('light-active');
	}

	if (counter === 1) {
		lightActivate();
	} else {
		let subdivPerNote = subdivision / timeSign.note;
		if (subdivPerNote !== 1) {
			counter % subdivPerNote === 1 && lightActivate();
		} else {
			lightActivate();
		}
	}

	if (counter === 1) {
		beep.start();
	} else {
		if (!isBPLInt || !isBPLightInt) {
			counter % 6 === 1 && boap.start();
			counter % 6 === 5 && boap.start();
		} else {
			counter % 3 !== 2 && boap.start();
		}
	}

	counter === beatsPerLoop ? (counter = 1) : counter++;
}

function setLights() {
	let light = '';
	let lights = '';
	for (let i = 0; i < timeSign.beats; i++) {
		light = `<div class="light" id="${(i + 1).toString()}"></div>`;
		lights += light;
	}
	lightsContainer.innerHTML = lights;
}

function setMetronomeParam() {
	timeSign.beats = parseInt(document.querySelector('.select-count').value);
	timeSign.note = parseInt(document.querySelector('.select-note').value);
	selectSubd.value === 'shuffle'
		? (subdivision = 12)
		: (subdivision = parseInt(selectSubd.value));
	notePerSubdiv = timeSign.note / subdivision;
	beatsPerLoop = timeSign.beats / timeSign.note * subdivision;
	beatsPerLight = beatsPerLoop / timeSign.beats;
	subdivPerNote = subdivision / timeSign.note;
	isBPLInt = Number.isInteger(beatsPerLoop);
	isBPLightInt = Number.isInteger(beatsPerLight);
	timeSign.note === subdivision
		? (isNoteEqualToSubdiv = true)
		: (isNoteEqualToSubdiv = false);
	setLights();

	if (!isBPLInt || timeSign.note > subdivision || !isBPLightInt) {
		subdivision *= 2;
		beatsPerLoop *= 2;
		subdivPerNote *= 2;
		if (selectSubd.value === 'shuffle') {
			loop = new Tone.Loop(shuffleMetronome, subdivision + 'n');
		} else {
			loop = new Tone.Loop(metronome, subdivision + 'n');
		}
	} else {
		if (selectSubd.value === 'shuffle') {
			loop = new Tone.Loop(shuffleMetronome, subdivision + 'n');
		} else {
			loop = new Tone.Loop(metronome, subdivision + 'n');
		}
	}
}
setMetronomeParam();

async function loopToggle() {
	Tone.context.state !== 'running' && (await Tone.context.resume());
	if (loop.state === 'stopped') {
		loop.start();
		toggleButton.setAttribute('src', pauseButtonImg);
	} else {
		loop.stop();
		toggleButton.setAttribute('src', playButtonImg);
		if (preLight !== null) {
			preLight.classList.remove('light-active');
		}
		counter = 1;
		lightCounter = 1;
	}
}

const toggleButton = document.querySelector('.loop-toggle');
toggleButton.addEventListener('click', () => {
	loopToggle();
});

// change selected option when loop is running,
// stop the loop, change the loop, then restart the loop
document.querySelectorAll('select').forEach((el) => {
	el.addEventListener('change', () => {
		if (loop.state === 'started') {
			loopToggle();
			setMetronomeParam();
			loopToggle();
		} else if (loop.state === 'stopped') {
			setMetronomeParam();
		}
	});
});

const bpmSlider = document.querySelector('.slider');
bpmSlider.oninput = () => {
	Tone.Transport.bpm.value = bpmSlider.value;
	bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
};

// bpm + 1
document.querySelector('.plus-bpm').addEventListener('click', () => {
	if (Math.round(Tone.Transport.bpm.value) < bpmLimit.max) {
		Tone.Transport.bpm.value++;
		bpmSlider.value = Math.round(Tone.Transport.bpm.value);
		bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
	}
});

// bpm - 1
document.querySelector('.minus-bpm').addEventListener('click', () => {
	if (Math.round(Tone.Transport.bpm.value) > bpmLimit.min) {
		Tone.Transport.bpm.value--;
		bpmSlider.value = Math.round(Tone.Transport.bpm.value);
		bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
	}
});
