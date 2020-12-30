import { readFileSync, writeFileSync } from 'fs';
import { Compile, CompilationError } from './compiler';
import { Decompile } from './decompiler';

// Colors
const red: string = '\x1b[31m%s\x1b[0m';
const green: string = '\x1b[32m%s\x1b[0m';
const yellow: string = '\x1b[33m%s\x1b[0m';

// Arguments
const args: string[] = process.argv.slice(2);
const type: string = args[0]?.toLowerCase();
const input: string = args[1];
const output: string = args[2];

// Default config
let log: boolean = true;
let safe: boolean = true;
let minify: boolean = true;
let colors: boolean = true;

// Search for flags
for (let i = 0; i < args.length; i++) {
	const argument: string = args[i];
	if (argument === '--no-log') log = false;
	if (argument === '--no-safe') safe = false;
	if (argument === '--no-minify') minify = false;
	if (argument === '--no-colors') colors = false;
}

// If no input
if (typeof input === 'undefined') {
	console.log('Input file is not specified');
	process.exit();
}

// Compilation
if (type === 'compile') {
	try {
		const start = Date.now();
		const code: string = readFileSync(input, { encoding: 'utf-8' });
		const compiled: Uint16Array = Compile(code, { safe, minify });
		const time: number = Date.now() - start;

		if (typeof output === 'string') {
			writeFileSync(output, Buffer.from(compiled.buffer));
		} else {
			console.log(compiled.join(','));
		}

		if (colors) {
			console.info(green, `Compilation successfully finished in ${time}ms`);
		} else {
			console.info(`Compilation successfully finished in ${time}ms`);
		}

	} catch (error) {
		if (error instanceof CompilationError) {
			const info: string = error.line === -1 ? 'global' : `line:${error.line}`;
			const color: string = error.safe ? yellow : red;

			if (colors) {
				console.error(color, `[${info}] ${error.message}`);
			} else {
				console.error(`[${info}] ${error.message}`);
			}

		} else {
			if (colors) {
				console.error(red, error);
			} else {
				console.error(error);
			}
		}
	}
}

// Decompelation
if (type === 'decompile') {
	const content: Buffer = readFileSync(input);
	const executable: Buffer = Buffer.from(content);
	const instructions: Uint16Array = new Uint16Array(executable.buffer, executable.byteOffset, executable.length / 2);
	

	const code = Decompile(instructions);
	console.log(code);
}
