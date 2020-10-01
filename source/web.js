import { VM, opcodes } from './vm';

const VMInstance = new VM({ debug: false, safe: true });

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

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const height = 32;
const width = 32;

document.getElementById('load').onclick = async (event) => {
    const executable = await loadExecutable();
    const parsed = await parseExecutable(executable);

    console.log(parsed);

    VMInstance.load(parsed);
    VMInstance.start();
    processDisplay();
}


document.getElementById('reset').onclick = async (event) => {
    VMInstance.reset();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
}

document.getElementById('start').onclick = async (event) => {
    VMInstance.start();
    processDisplay();
}

document.getElementById('stop').onclick = async (event) => {
    VMInstance.stop();
    processDisplay();
}

function processDisplay() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const address = (32 * y) + x;
            const enabled = VMInstance.display[address] === 0 ? false : true;

            ctx.fillStyle = enabled ? '#ffffff' : '#111111';
            ctx.fillRect(x, y, 1, 1);
        }
    }

    if (VMInstance.running) requestAnimationFrame(processDisplay);
}

document.onkeydown = (event) => {
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
}

document.onkeyup = (event) => {
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
}
