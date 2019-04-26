const Tone = require('tone');
import beepUrl from '../public/beep.flac';
import boapUrl from '../public/boap.flac';
console.log(beepUrl);
console.log(boapUrl);

Tone.Transport.start(0);
// amount of time events
Tone.context.lookAhead = 0;
// set latency !!! important !!!
Tone.context.latencyHint = 'fastest';

// init value of metronome
Tone.Transport.bpm.value = 100;
const bpmLimit = {
	min: 10,
	max: 400
};
const lightsContainer = document.querySelector('.lights-container');
const bpmText = document.querySelector('.bpm');
bpmText.innerHTML = Tone.Transport.bpm.value;
let timeSign = {
	beats: 0,
	note: 0
};
let subdivision = 0;
let lengthOfBeatPerSubdivNote = 0;
let beatsPerLoop = 0;
let counter = 1;
let loop = {};
let beep = new Tone.Player('../public/beep.flac').toMaster();
let boap = new Tone.Player('../public/boap.flac').toMaster();
let activeLight = {};
let preLight = 0;
let lightCounter = 1;

const lightShine = () => {
	activeLight = document.getElementById(lightCounter);
	preLight = activeLight;
	activeLight.classList.add('light-active');
	lightCounter === timeSign.beats ? (lightCounter = 1) : lightCounter++;
};

const metronome = () => {
	if (preLight !== 0) {
		preLight.classList.remove('light-active');
	}

	if (counter === 1) {
		lightShine();
	} else {
		let subPerNote = subdivision / timeSign.note;
		// if (1 - subPerNote % 1 < 0.0001) {
		// 	subPerNote = Math.round(subPerNote);
		// }
		if (subPerNote !== 1) {
			counter % subPerNote === 1 && lightShine();
		} else {
			lightShine();
		}
	}

	//always beep at first point
	if (counter === 1) {
		beep.start();
	} else {
		if (equalNote) {
			boap.start();
		} else if (!isBPLightInt) {
			counter % 2 === 1 && boap.start();
		} else {
			if (lengthOfBeatPerSubdivNote !== 1) {
				if (lengthOfBeatPerSubdivNote < 1) {
					boap.start();
				} else {
					counter % 2 === 1 && boap.start();
				}
			} else {
				counter % lengthOfBeatPerSubdivNote === 1 && boap.start();
			}
		}
	}
	console.log(counter);
	counter === beatsPerLoop ? (counter = 1) : counter++;
};

const shuffleMetronome = () => {
	if (counter === 1) {
		beep.start();
	} else {
		if (isBPLInt) {
			counter % 3 !== 2 && boap.start();
		} else {
			counter % 6 === 1 && boap.start();
			counter % 6 === 5 && boap.start();
		}
	}
	console.log(counter);
	if (isBPLInt) {
		counter === beatsPerLoop ? (counter = 1) : counter++;
	} else {
		counter === beatsPerLoop ? (counter = 1) : counter++;
	}
};

const setLights = (beats) => {
	let light = '';
	let lights = '';
	for (let i = 0; i < beats; i++) {
		light = `<div class="light" id="${(i + 1).toString()}"></div>`;
		lights += light;
	}
	lightsContainer.innerHTML = lights;
};

let selectNote = document.querySelector('.select-note');
let selectCount = document.querySelector('.select-count');
let selectSubd = document.querySelector('.select-subdivision');
let isBPLInt = true;
let isBPLightInt = false;
let equalNote = false;
let beatsPerLight = 0;
const setMetronome = () => {
	timeSign.beats = parseInt(selectCount.value);
	timeSign.note = parseInt(selectNote.value);
	selectSubd.value === 'shuffle' ? (subdivision = 12) : (subdivision = parseInt(selectSubd.value));
	lengthOfBeatPerSubdivNote = timeSign.note / subdivision;
	beatsPerLoop = timeSign.beats / timeSign.note * subdivision;
	beatsPerLight = beatsPerLoop / timeSign.beats;
	isBPLInt = Number.isInteger(beatsPerLoop);
	isBPLightInt = Number.isInteger(beatsPerLight);
	timeSign.note === subdivision ? (equalNote = true) : (equalNote = false);
	setLights(timeSign.beats);

	if (!isBPLInt || timeSign.note > subdivision || !isBPLightInt) {
		subdivision *= 2;
		beatsPerLoop *= 2;
		//lengthOfBeatPerSubdivNote /= 2;
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
};
setMetronome();

const loopSwitch = async () => {
	Tone.context.state !== 'running' && (await Tone.context.resume());
	if (loop.state === 'stopped') {
		loop.start();
	} else {
		loop.stop();
		counter = 1;
		lightCounter = 1;
	}
};

// Loop switch (start / stop)
document.querySelector('.play').addEventListener('click', async () => {
	loopSwitch();
});

// change selected option when loop is running,
// stop the loop, change the loop, then restart the loop
document.querySelectorAll('select').forEach((elem) => {
	elem.addEventListener('change', () => {
		if (loop.state === 'started') {
			loopSwitch();
			setMetronome();
			loopSwitch();
		} else if (loop.state === 'stopped') {
			setMetronome();
		}
	});
});

// bpm + 1
document.querySelector('.plus-bpm').addEventListener('click', () => {
	if (Math.round(Tone.Transport.bpm.value) < bpmLimit.max) {
		Tone.Transport.bpm.value++;
		bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
	}
});

// bpm - 1
document.querySelector('.minus-bpm').addEventListener('click', () => {
	if (Math.round(Tone.Transport.bpm.value) > bpmLimit.min) {
		Tone.Transport.bpm.value--;
		bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
	}
});

// // tap bpm
// document.querySelector('.tap-bpm').addEventListener('click', () => {
// 	let tapTime = 0.5;
// 	Tone.Transport.seconds !== 0 && (tapTime = Tone.Transport.seconds);
// 	let newTapBpm = 60 / tapTime;
// 	if (newTapBpm > bpmLimit.min && newTapBpm < bpmLimit.max) {
// 		Tone.Transport.bpm.value = newTapBpm;
// 		bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
// 	}
// 	Tone.Transport.stop().start();
// });
