import { readFileSync, writeFileSync } from 'fs';

const file = process.argv[2];

const registers = 8192;
const buffer = new ArrayBuffer(registers * 2);
let memory = new Uint16Array(buffer);

memory[0] = 10;
memory[1] = 15;
memory[2] = 65000;

memory = memory.map((value) => {
    if (value !== 0) return value;
})

writeFileSync('./builded.tiqb', Buffer.from(memory.buffer));