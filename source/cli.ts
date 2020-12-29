import { readFileSync, writeFileSync } from 'fs';
import { Compile, CompilationError } from './compiler';

// Arguments
const args: string[] = process.argv.slice(2);
const type: string = args[0]?.toLowerCase();
const input: string = args[1];
const output: string = args[2];

// Compilation
if (type === 'compile' || true) {
	try {
		const compilationStart = Date.now();

		const code: string = readFileSync('./examples/example.tiq', { encoding: 'utf-8' });
		const compiled: Uint16Array = Compile(code, { minify: true });
		console.log(compiled);

		const compilationTime: number = Date.now() - compilationStart;
		const linesOfCode: number = code.split(/\r?\n/).length;

		writeFileSync('./test.bin', Buffer.from(compiled.buffer));

		console.info(`${linesOfCode} lines of code successfully compiled in ${compilationTime}ms`);
	} catch (error) {
		if (error instanceof CompilationError) {
			const info: string = error.line === -1 ? 'global' : `line:${error.line}`;
			console.error(`[${info}] ${error.message}`);
		} else {
			console.error(error);
		}
	}

}

// Decompelation
if (type === 'decompile') {
}
