import { basename } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Compile, CompilationError } from './compiler';
import { Decompile } from './decompiler';

// Colors
const red: string = '\x1b[31m%s\x1b[0m';
const green: string = '\x1b[32m%s\x1b[0m';
const yellow: string = '\x1b[33m%s\x1b[0m';

// Arguments
const args: string[] = process.argv.slice(2);
const option: string = args[0]?.toLowerCase();
const input: string = args[1];
const output: string = args[2];

// Default config
let log: boolean = true;
let safe: boolean = true;
let colors: boolean = true;
let optimize: boolean = true;

// Search for flags
for (let i = 0; i < args.length; i++) {
	const argument: string = args[i];
	if (argument === '--no-log') log = false;
	if (argument === '--no-safe') safe = false;
	if (argument === '--no-colors') colors = false;
	if (argument === '--no-optimizations') optimize = false;
}

// Help command
if (option === 'help') {
	console.log(`Usage: ${basename(__filename)} [option] [input] [output] [flags]`);
	console.log('\n');

	console.log('Types:');
	console.log('\t', 'compile', '\t\t', 'Compile source file to executable code');
	console.log('\t', 'decompile', '\t\t', 'Decompile executable file to source code');
	console.log('\t', 'help', '\t\t\t', 'Show help information');
	console.log('\n');

	console.log('Flags:')
	console.log('\t', '--no-log', '\t\t', 'Do not display additional information')
	console.log('\t', '--no-safe', '\t\t', 'Compilation in unsafe mode')
	console.log('\t', '--no-colors', '\t\t', 'Print info without colors')
	console.log('\t', '--no-optimizations', '\t', 'Compilation without executable code optimizations')
	console.log('\n');

	process.exit(0);
}

// Compilation
if (option === 'compile') {
	if (typeof input === 'undefined') {
		if (colors) {
			console.error(red, 'Input file is not specified');
		} else {
			console.error('Input file is not specified');
		}
		process.exit(1);
	}

	try {
		const start = Date.now();
		const code: string = readFileSync(input, { encoding: 'utf-8' });
		const compiled: Uint16Array = Compile(code, { safe, optimize });
		const time: number = Date.now() - start;

		if (typeof output === 'string') {
			writeFileSync(output, Buffer.from(compiled.buffer));
		} else {
			console.log(compiled.join(','));
		}

		if (log) {
			if (colors) {
				console.info(green, `Compilation successfully finished in ${time}ms`);
			} else {
				console.info(`Compilation successfully finished in ${time}ms`);
			}
		}

		process.exit(0);

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

		process.exit(1);
	}
}

// Decompilation
if (option === 'decompile') {
	if (typeof input === 'undefined') {
		if (colors) {
			console.error(red, 'Input file is not specified');
		} else {
			console.error('Input file is not specified');
		}
		process.exit(1);
	}

	try {
		const start = Date.now();
		const content: Buffer = readFileSync(input);
		const executable: Buffer = Buffer.from(content);
		const instructions: Uint16Array = new Uint16Array(executable.buffer, executable.byteOffset, executable.length / 2);
		const code: string = Decompile(instructions);
		const time: number = Date.now() - start;
	
		if (typeof output === 'string') {
			writeFileSync(output, code);
		} else {
			console.log(code);
		}
	
		if (log) {
			if (colors) {
				console.info(green, `Decompilation successfully finished in ${time}ms`);
			} else {
				console.info(`Decompilation successfully finished in ${time}ms`);
			}
		}

		process.exit(0);

	} catch (error) {
		if (colors) {
			console.error(red, error);
		} else {
			console.error(error);
		}

		process.exit(1);
	}
}

if (colors) {
	console.error(red, `Incorrect option`);
} else {
	console.error(`Incorrect option`);
}

process.exit(1);