import { VM } from './vm';

const VMInstance = new VM({ debug: true, safe: true });
const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

/**
 * Load binary executable file
 */
function loadExecutable() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = (event) => {
            resolve(event.target.files[0]);
        }

        input.click();
    });
}

/**
 * Parse binary file
 * @param file Loaded file to parse
 */
function parseExecutable(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = event => {
            const converted = new Uint16Array(event.target.result);
            resolve(converted);
        }
    });
}

function processDisplay() {
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const address = (32 * y) + x;
            const enabled = VMInstance.display[address] === 0 ? false : true;

            ctx.fillStyle = enabled ? '#ffffff' : '#111111';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    if (VMInstance.running) requestAnimationFrame(processDisplay);
}

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            VMInstance.input[0] = 1;
            break;
        case 'ArrowDown':
            VMInstance.input[1] = 1;
            break;
        case 'ArrowLeft':
            VMInstance.input[2] = 1;
            break;
        case 'ArrowRight':
            VMInstance.input[3] = 1;
            break;
        case 'KeyZ':
            VMInstance.input[4] = 1;
            break;
        case 'KeyX':
            VMInstance.input[5] = 1;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            VMInstance.input[0] = 0;
            break;
        case 'ArrowDown':
            VMInstance.input[1] = 0;
            break;
        case 'ArrowLeft':
            VMInstance.input[2] = 0;
            break;
        case 'ArrowRight':
            VMInstance.input[3] = 0
            break;
        case 'KeyZ':
            VMInstance.input[4] = 0;
            break;
        case 'KeyX':
            VMInstance.input[5] = 0;
            break;
    }
});

document.getElementById('load').addEventListener('click', async (event) => {
    const executable = await loadExecutable();
    const parsed = await parseExecutable(executable);

    VMInstance.load(parsed);
    VMInstance.start();
    processDisplay();
});

document.getElementById('reset').addEventListener('click', () => {
    VMInstance.stop();
    VMInstance.reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('start').addEventListener('click', () => {
    VMInstance.start();
    processDisplay();
});

document.getElementById('stop').addEventListener('click', () => {
    VMInstance.stop();
    processDisplay();
});

document.getElementById('step').addEventListener('click', () => {
    VMInstance.step();
    processDisplay();
});
