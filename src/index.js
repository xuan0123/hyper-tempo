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
Tone.Transport.bpm.value = 120;
let bpmText = document.querySelector('.bpm');
bpmText.innerHTML = Tone.Transport.bpm.value;
let subdivision = 4;
let counter = 1;
let loop = {};

let beep = new Tone.Player('../public/beep.flac').toMaster();
let boap = new Tone.Player('../public/boap.flac').toMaster();

let metronome = () => {
	counter % subdivision === 1 && beep.start();
	counter % subdivision !== 1 && boap.start();
	counter = (counter + 1) % subdivision;
};

loop = new Tone.Loop(metronome, '4n');

let shuffleMetronome = () => {
	if (counter % subdivision == 1) {
		beep.start();
	} else if (counter % (subdivision / 4) !== 2) {
		boap.start();
	}
	counter = (counter + 1) % subdivision;
};

const loopSwitch = async () => {
	Tone.context.state !== 'running' && (await Tone.context.resume());
	counter = 1;
	loop.state === 'stopped' ? loop.start() : loop.stop();
};

const checkSelectedSubdiv = () => {
	let divSelect = document.querySelector('select');
	if (divSelect.value === '4') {
		subdivision = 4;
		loop = new Tone.Loop(metronome, '4n');
	} else if (divSelect.value === '8') {
		subdivision = 8;
		loop = new Tone.Loop(metronome, '8n');
	} else if (divSelect.value === '16') {
		subdivision = 16;
		loop = new Tone.Loop(metronome, '16n');
	} else if (divSelect.value === '12') {
		subdivision = 12;
		loop = new Tone.Loop(metronome, '12n');
	} else if (divSelect.value === 'shuffle') {
		subdivision = 12;
		loop = new Tone.Loop(shuffleMetronome, '16n');
	}
};

// Loop switch (start / stop)
document.querySelector('.play').addEventListener('click', () => {
	loop.state === 'stopped' && checkSelectedSubdiv();
	loopSwitch();
});

// change selected option when loop is running,
// stop the loop, change the loop, then restart the loop
document.querySelector('select').addEventListener('change', () => {
	if (loop.state === 'started') {
		loop.stop();
		checkSelectedSubdiv();
		loopSwitch();
	} else if (loop.state === 'stopped') {
		checkSelectedSubdiv();
	}
});

// bpm + 1
document.querySelector('.plus-bpm').addEventListener('click', () => {
	Tone.Transport.bpm.value++;
	bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
});

// bpm - 1
document.querySelector('.minus-bpm').addEventListener('click', () => {
	Tone.Transport.bpm.value--;
	bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
});

// tap bpm
let tapTime = 0.5;
document.querySelector('.tap-bpm').addEventListener('click', () => {
	Tone.Transport.seconds !== 0 && (tapTime = Tone.Transport.seconds);
	Tone.Transport.bpm.value = 60 / tapTime;
	bpmText.innerHTML = Math.round(Tone.Transport.bpm.value);
	Tone.Transport.stop().start();
});
