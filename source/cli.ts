import { readFileSync } from 'fs';
import { Compile } from './compiler';

const compilationStart = Date.now();

const file: string = readFileSync('./examples/example.tiq', { encoding: 'utf-8' });

Compile(file);
const compilationEnd = Date.now();

console.log('Compilation time:', compilationEnd - compilationStart + 'ms');