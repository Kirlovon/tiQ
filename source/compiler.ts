import { opcodes } from './vm';

interface Config {
	log: boolean;
	safe: boolean;
	minify: boolean;
}

interface Line {
	index: number;
	content: string;
}

interface Token {
	line: number;
	type: string;
}

interface FinishToken extends Token {
	type: 'FINISH';
}

interface RawToken extends Token {
	type: 'RAW';
	value: number;
}

interface PointToken extends Token {
	type: 'POINT';
	name: string;
}

interface GotoToken extends Token {
	type: 'GOTO';
	point: string;
}

interface DeclareToken extends Token {
	type: 'DECLARE';
	address: number;
	value: number;
}

interface InstructionToken extends Token {
	type: keyof typeof opcodes;
	arguments: number[];
}

type Tokens = Array<PointToken | GotoToken | InstructionToken | DeclareToken | RawToken | FinishToken>;

const defaultConfig: Config = {
	log: true,
	safe: true,
	minify: true
}

/**
 * Compile source code to binary code.
 * @param code Code to compile.
 * @param config Compilation config.
 */
export function Compile(code: string, config: Partial<Config> = {}): Uint16Array {
	// Merge configs
	config = { ...defaultConfig, ...config };
	const { log, safe, minify } = config;
	
	const parsed: Line[] = Parse(code);
	const tokenized: Tokens = Tokenize(parsed);

	console.log(tokenized);

	let tokens: Tokens = tokenized;
	const points: [PointToken, number][] = [];
	const declarations: DeclareToken[] = [];

	// Find all declarations
	tokens = tokens.filter(token => {
		if (token.type !== 'DECLARE') return true;
		declarations.push(token);
		return false;
	});

	// Find all points
	tokens = tokens.filter((token, index) => {
		if (token.type !== 'POINT') return true;
		points.push([token, index]);
		return false;
	});

	// Check instructions
	if (safe) {
		if (tokenized.length >= 4096) {
			throw Error(
				`[global] Code contains ${tokenized.length} instructions ( Maximum supported is 4096 )`
			);
		}

		// Check if point names repeating
		const names: Set<string> = new Set();
		points.forEach(point => {
			const { name, line } = point[0];
			if (names.has(name)) throw new Error(`[line:${line}] Point "${name}" declared multiple times`);
			names.add(name);
		});
	}

	// Create binary array
	const size: number = minify ? tokens.length : 4096;
	const binary: Uint16Array = new Uint16Array(size);

	// Convery tokens to instructions
	for (let i = 0; i < tokens.length; i++) {
		const token: Token = tokens[i];
		
		if (token.type === 'GOTO') {
			// const instruction: number = (4096 * opcodes.JUMP);
			binary[i] = instruction;
			continue;
		}

		if (token.type === 'FINISH') {
			const instruction: number = 0;
			binary[i] = instruction;
			continue;
		}
		
	}

	console.log(points);
	console.log(declarations);

	console.log(tokens);
	console.log(binary);

	return binary;
}

function Tokenize(lines: Line[]): Tokens {
	let tokens: Tokens = [];

	// Tokenize code lines
	tokens = lines.map(({ content, index }) => {
		let line: number = index + 1;

		if (content === 'FINISH') {
			return { line, type: 'FINISH' };
		}

		if (content.endsWith(':')) {
			const name: string = content.slice(0, -1).trim();
			return { line, type: 'POINT', name };
		}

		if (content.startsWith('GOTO')) {
			const point: string = content.split('"')[1].trim();
			return { line, type: 'GOTO', point };
		}

		if (content.startsWith('DECLARE')) {
			const args: string[] = content.trim().split(',');
			const address: number = parseInt(args[1]);
			const value: number = parseInt(args[2]);

			return { line, type: 'DECLARE', address, value };
		}

		if (isNumeric(content)) {
			return { line, type: 'RAW', value: parseInt(content) };
		}

		const argument: string = content.split(',')[1].trim();
		const parsed: number = parseInt(argument);

		if (isNaN(parsed)) throw new Error('1');
		if (parsed > 4095 || parsed < 0) throw new Error('2');

		if (content.startsWith('NOTHING')) {
			return { line, type: 'NOTHING', arguments: [parsed] };
		}

		if (content.startsWith('DISPLAY')) {
			return { line, type: 'DISPLAY', arguments: [parsed] };
		}

		if (content.startsWith('LOAD')) {
			return { line, type: 'LOAD', arguments: [parsed] };
		}

		if (content.startsWith('SAVE')) {
			return { line, type: 'SAVE', arguments: [parsed] };
		}

		if (content.startsWith('ADD')) {
			return { line, type: 'ADD', arguments: [parsed] };
		}

		if (content.startsWith('SUBSTRACT')) {
			return { line, type: 'SUBSTRACT', arguments: [parsed] };
		}

		if (content.startsWith('EQUAL')) {
			return { line, type: 'EQUAL', arguments: [parsed] };
		}

		if (content.startsWith('LESS')) {
			return { line, type: 'LESS', arguments: [parsed] };
		}

		if (content.startsWith('LESS')) {
			return { line, type: 'LESS', arguments: [parsed] };
		}

		if (content.startsWith('GREATER')) {
			return { line, type: 'GREATER', arguments: [parsed] };
		}

		if (content.startsWith('AND')) {
			return { line, type: 'AND', arguments: [parsed] };
		}

		if (content.startsWith('OR')) {
			return { line, type: 'OR', arguments: [parsed] };
		}

		if (content.startsWith('JUMP')) {
			return { line, type: 'JUMP', arguments: [parsed] };
		}

		if (content.startsWith('TRUE')) {
			return { line, type: 'TRUE', arguments: [parsed] };
		}

		if (content.startsWith('FALSE')) {
			return { line, type: 'FALSE', arguments: [parsed] };
		}

		if (content.startsWith('RANDOM')) {
			return { line, type: 'RANDOM', arguments: [] };
		}

		if (content.startsWith('INPUT')) {
			return { line, type: 'INPUT', arguments: [parsed] };
		}

		console.log(content);
		throw new Error();
	});

	return tokens;
}


/**
 *
 * @param code Code to parse
 */
function Parse(code: string): Line[] {
	// Split code by lines
	let splits: string[] = code.split(/\r?\n/);

	// Remove comments
	splits = splits.map(content => content.split('//')[0]);

	// Convert lines to the objects
	let lines: Line[] = splits.map((content, index) => ({ index, content }));

	// Remove spaces
	lines = lines.map(({ content, index }) => {
		const formated: string = content.replace(/\s+/g, '');
		return { index, content: formated };
	});

	// Remove empty lines
	lines = lines.filter(({ content }) => content !== '');

	// Uppercase content
	lines = lines.map(({ content, index }) => {
		// If line contain string argument
		if (content.includes('"')) {
			const splited: string[] = content.split('"');
			splited[0] = splited[0].toUpperCase();
			const formated: string = splited.join('"');
			return { index, content: formated };
		}

		const formated: string = content.toUpperCase();
		return { index, content: formated };
	});

	// Detect start and end of the code part
	const start: number = lines.findIndex(({ content }) => content === 'START');
	const end: number = lines.findIndex(({ content }) => content === 'END');

	// If start or end not found
	if (start === -1) throw new Error();
	if (end === -1) throw new Error();

	// Slice unused file parts
	lines = lines.slice(start + 1, end);

	return lines;
}

/**
 * Check if string is numeric
 * @param value String that contains number
 */
function isNumeric(value: string): boolean {
	return /^\d+$/.test(value);
}


/** Custom compiler error */
export class CompilerError extends Error {
	public name: string = 'CompilerError';
	public message: string;
	public cause: any;
	public stack: string | undefined;

	public line: number = 0;
	public global: boolean = false

	/**
	 * Error initialization.
	 * @param message Error message.
	 * @param cause Cause of the error.
	 */
	constructor(message: string, cause?: any) {
		super(message);
		Error.captureStackTrace(this, CompilerError);

		this.message = message;
		if (cause) this.cause = cause;
		if (typeof cause === 'string' || typeof cause === 'number') this.message = `${message}: ${cause}`;
	}
}