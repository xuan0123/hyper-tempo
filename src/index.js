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
let bpmText = document.querySelector('.bpm');
bpmText.innerHTML = Tone.Transport.bpm.value;
let timeSign = {
	beats: 0,
	note: 0
};
let subdivision = 20;
let partOf = 0;
let beatsPerLoop = 0;
let counter = 1;
let loop = {};
let beep = new Tone.Player('../public/beep.flac').toMaster();
let boap = new Tone.Player('../public/boap.flac').toMaster();

const metronome = () => {
	//always beep at first point
	if (counter === 1) {
		beep.start();
	} else {
		if (Number.isInteger(beatsPerLoop)) {
			boap.start();
		} else {
			if (partOf < 1) {
				counter % 2 === 1 && boap.start();
			} else {
				counter % partOf === 1 && boap.start();
			}
		}
	}
	console.log(counter);
	if (Number.isInteger(beatsPerLoop)) {
		counter === beatsPerLoop ? (counter = 1) : counter++;
	} else {
		counter === beatsPerLoop * 2 ? (counter = 1) : counter++;
	}
};

const shuffleMetronome = () => {
	if (counter === 1) {
		beep.start();
	} else {
		counter % 3 !== 2 && boap.start();
	}
	counter === beatsPerLoop ? (counter = 1) : counter++;
};

let selectNote = document.querySelector('.select-note');
let selectCount = document.querySelector('.select-count');
let selectSubd = document.querySelector('.select-subdivision');
const setMetronome = () => {
	timeSign.beats = parseInt(selectCount.value);
	timeSign.note = parseInt(selectNote.value);
	selectSubd.value === 'shuffle' ? (subdivision = 12) : (subdivision = parseInt(selectSubd.value));
	partOf = timeSign.note / subdivision;
	beatsPerLoop = timeSign.beats / timeSign.note * subdivision;

	if (selectSubd.value === 'shuffle') {
		loop = new Tone.Loop(shuffleMetronome, subdivision + 'n');
	} else if (Number.isInteger(beatsPerLoop)) {
		loop = new Tone.Loop(metronome, subdivision + 'n');
	} else {
		loop = new Tone.Loop(metronome, subdivision * 2 + 'n');
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

const bpmLimit = {
	min: 10,
	max: 400
};
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

// tap bpm
document.querySelector('.tap-bpm').addEventListener('click', () => {
	let tapTime = 0.5;
	Tone.Transport.seconds !== 0 && (tapTime = Tone.Transport.seconds);
	let newTapBpm = 60 / tapTime;
	if (newTapBpm > bpmLimit.min && newTapBpm < bpmLimit.max) {
		Tone.Transport.bpm.value = newTapBpm;
		bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
	}
	Tone.Transport.stop().start();
});
