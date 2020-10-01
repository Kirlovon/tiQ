import { readFileSync } from 'fs';
import { Compile } from './compiler';

const file: string = readFileSync('example.tiq', { encoding: 'utf-8' });

Compile(file);