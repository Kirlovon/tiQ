import { readFileSync, writeFileSync } from 'fs';

let memory = new Uint16Array(1302);

memory[0] = generateInstruction(14, 0);
memory[1] = generateInstruction(11, 1000);
memory[2] = setPixel(15, 15, 0);

memory[3] = generateInstruction(14, 1);
memory[4] = generateInstruction(11, 1100);
memory[5] = setPixel(15, 16, 0);

memory[6] = generateInstruction(14, 2);
memory[7] = generateInstruction(11, 1200);
memory[8] = setPixel(14, 16, 0);

memory[9] = generateInstruction(14, 3);
memory[10] = generateInstruction(11, 1300);
memory[11] = setPixel(16, 16, 0);

memory[12] = generateInstruction(10, 0);


memory[1000] = setPixel(15, 15, 1);
memory[1001] = generateInstruction(10, 3);

memory[1100] = setPixel(15, 16, 1);
memory[1101] = generateInstruction(10, 6);

memory[1200] = setPixel(14, 16, 1);
memory[1201] = generateInstruction(10, 9);

memory[1300] = setPixel(16, 16, 1);
memory[1301] = generateInstruction(10, 0);


function generateInstruction(opcode: number, argument: number) {
    return (opcode * 4096) + argument;
}

function setPixel(x: number, y: number, color: number) {
    const xFormated: number = x * 128;
    const yFormated: number = y * 4;
    return 61440 + xFormated + yFormated + color;
}

console.log(setPixel(0, 0, 0))
writeFileSync('./control2.bin', Buffer.from(memory.buffer));

