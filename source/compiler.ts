import { opcodes } from './vm';

// Code line structure
interface Line {
	index: number;
	content: string;
}

// Finish token structure
interface FinishToken {
	line: number;
	type: 'finish';
}

// Point token structure
interface PointToken {
	line: number;
	type: 'point';
	name: string;
}

// Goto token structure
interface GotoToken {
	line: number;
	type: 'goto';
	point: string;
}

// Declare token structure
interface DeclareToken {
	line: number;
	type: 'declare';
	value: number;
	address: number;
}

// Display token structure
interface DisplayToken {
	line: number;
	type: 'display';
	x: number;
	y: number;
	color: number;
}

// All other instructions token
interface InstructionToken {
	line: number;
	type: 'raw' | 'nothing' | 'load' | 'save' | 'add' | 'substract' | 'equal' | 'less' | 'greater' | 'and' | 'or' | 'jump' | 'true' | 'false' | 'random' | 'input';
	value: number;
}

// List of tokens
type Tokens = Array<PointToken | DisplayToken | GotoToken | DeclareToken | FinishToken | InstructionToken>;

// Compilator configuration
interface Config {
	safe: boolean;
	minify: boolean;
}

// Default config
const defaultConfig: Config = {
	safe: true,
	minify: true,
};

/**
 * Compile source code to binary code.
 * @param code Code to compile.
 * @param config Compilation config.
 */
export function Compile(code: string, config: Partial<Config> = {}): Uint16Array {
	const binary: Uint16Array = new Uint16Array(4096);

	// Merge configs
	config = { ...defaultConfig, ...config };
	const { safe, minify } = config;

	const parsed: Line[] = Parse(code);
	const tokenized: Tokens = Tokenize(parsed);

	let tokens: Tokens = tokenized;
	const declarations: DeclareToken[] = [];
	const points: Map<string, { line: number; address: number }> = new Map();

	// Find all declarations
	tokens = tokens.filter(token => {
		if (token.type !== 'declare') return true;
		const { address, value, line } = token;

		// Validate declarations
		if (address > 4095 || address < 0) throw new CompilationError(`Address "${address}" is out of range`, line);
		if (value > 4095 || value < 0) throw new CompilationError(`Value "${value}" is out of range`, line);

		declarations.push(token);

		return false;
	});

	// Find all points
	tokens = tokens.filter((token, index) => {
		if (token.type !== 'point') return true;
		const { name, line } = token;

		// Check if point is already declared
		if (safe && points.has(name)) throw new CompilationError(`Point "${name}" declared multiple times`, line);

		points.set(name, {
			line: line,
			address: index,
		});

		return false;
	});

	// Check instructions
	if (safe) {
		if (tokenized.length >= 4096) {
			throw new CompilationError(`Code contains ${tokenized.length} instructions ( Maximum supported is 4096 )`);
		}
	}

	console.log(tokens)

	// Convery tokens to instructions
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i] as GotoToken | DisplayToken | FinishToken | InstructionToken;

		// Finish instruction
		if (token.type === 'finish') {
			binary[i] = 0;
			continue;
		}

		// Goto instruction
		if (token.type === 'goto') {
			const point = points.get(token.point);
			if (typeof point === 'undefined') throw new CompilationError(`Point "${token.point}" is not found`, token.line);

			binary[i] = 4096 * opcodes.JUMP + point.address;
			continue;
		}

		// Raw instruction
		if (token.type === 'raw') {
			if (token.value > 65535 || token.value < 0) throw new CompilationError(`Instruction "${token.value}" is not valid`, token.line);
			binary[i] = token.value;
			continue;
		}

		// Empty instruction
		if (token.type === 'nothing') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Instruction value "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.NOTHING + token.value;
			continue;
		}

		// Empty instruction
		if (token.type === 'load') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.LOAD + token.value;
			continue;
		}

		// Save instruction
		if (token.type === 'save') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.SAVE + token.value;
			continue;
		}

		// Add instruction
		if (token.type === 'add') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.ADD + token.value;
			continue;
		}

		// Save instruction
		if (token.type === 'substract') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.SUBSTRACT + token.value;
			continue;
		}

		// Equal instruction
		if (token.type === 'equal') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.EQUAL + token.value;
			continue;
		}

		// Less instruction
		if (token.type === 'less') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.LESS + token.value;
			continue;
		}

		// Greater instruction
		if (token.type === 'greater') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.GREATER + token.value;
			continue;
		}

		// And instruction
		if (token.type === 'and') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.AND + token.value;
			continue;
		}

		// Or instruction
		if (token.type === 'or') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.OR + token.value;
			continue;
		}

		// Jump instruction
		if (token.type === 'jump') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.JUMP + token.value;
			continue;
		}

		// True instruction
		if (token.type === 'true') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.TRUE + token.value;
			continue;
		}

		// False instruction
		if (token.type === 'false') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.FALSE + token.value;
			continue;
		}

		// Random instruction
		if (token.type === 'random') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.RANDOM + token.value;
			continue;
		}

		// Input instruction
		if (token.type === 'input') {
			if (token.value > 4095 || token.value < 0) throw new CompilationError(`Address "${token.value}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.INPUT + token.value;
			continue;
		}

		// Display instruction
		if (token.type === 'display') {
			console.log(111);
			const { x, y, color, line } = token;
			if (x > 31 || x < 0) throw new CompilationError(`Value "${x}" is out of range`, line);
			if (y > 31 || y < 0) throw new CompilationError(`Value "${y}" is out of range`, line);
			if (color > 1 || color < 0) throw new CompilationError(`Value "${color}" is out of range`, line);

			binary[i] = 4096 * opcodes.DISPLAY + 128 * x + 4 * y + color;
			continue;
		}
	}

	// Declarations
	for (let i = 0; i < declarations.length; i++) {
		const { address, value, line }: DeclareToken = declarations[i];

		// If address already contains the instruction
		if (safe && binary[address] !== 0) throw new CompilationError(`Address "${address}" already contains the instructions`, line);

		binary[address] = value;
	}

	// Minify executable code
	if (minify) {
		const size: number = binary.length - 1;
		let end: number = size;

		// Impossible to minify
		if (binary[size] !== 0) return binary;
		
		// Detect ending 
		for (let i = size; i >= 0; i--) {
			if (binary[i] === 0) continue;
			end = i + 1;
			break;
		}

		// Remove unused space
		const minified: Uint16Array = binary.filter((instruction, index) => {
			if (index <= end) return true;
			return false
		});

		return minified;
	}

	return binary;
}

/**
 * Tokenization. Convert lines of code to structures.
 * @param lines Lines of code.
 */
function Tokenize(lines: Line[]): Tokens {
	let tokens: Tokens = [];

	// Tokenize code lines
	for (let i = 0; i < lines.length; i++) {
		const { content, index } = lines[i];
		let line: number = index + 1;

		// Get arguments
		const args: string[] = content.split(',').slice(1);

		// Finish
		if (content === 'finish') {
			tokens.push({ line, type: 'finish' });
			continue;
		}

		// Point
		if (/^\w+:$/.test(content)) {
			const name: string = content.slice(0, -1);
			tokens.push({ line, type: 'point', name });
			continue;
		}

		// Goto
		if (/^goto,\w+$/.test(content)) {
			const point: string = args[0];
			tokens.push({ line, type: 'goto', point });
			continue;
		}

		// Declare
		if (/^declare,\d+,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			const value: number = parseInt(args[1]);
			tokens.push({ line, type: 'declare', address, value });
			continue;
		}

		// Raw numbers
		if (/^\d+$/.test(content)) {
			const value: number = parseInt(content);
			tokens.push({ line, type: 'raw', value });
			continue;
		}

		// Nothing
		if (/^nothing,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'nothing', value });
			continue;
		}

		// Load
		if (/^load,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'load', value });
			continue;
		}

		// Save
		if (/^save,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'save', value });
			continue;
		}

		// Add
		if (/^add,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'add', value });
			continue;
		}

		// Substract
		if (/^substract,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'substract', value });
			continue;
		}

		// Equal
		if (/^equal,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'equal', value });
			continue;
		}

		// Less
		if (/^less,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'less', value });
			continue;
		}

		// Greater
		if (/^greater,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'greater', value });
			continue;
		}

		// And
		if (/^and,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'and', value });
			continue;
		}

		// Or
		if (/^or,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'or', value });
			continue;
		}

		// Jump
		if (/^jump,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'jump', value });
			continue;
		}

		// True
		if (/^true,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'true', value });
			continue;
		}

		// False
		if (/^false,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'false', value });
			continue;
		}

		// Random
		if (/^random,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'random', value });
			continue;
		}

		// Input
		if (/^input,\d+$/.test(content)) {
			const value: number = parseInt(args[0]);
			tokens.push({ line, type: 'input', value });
			continue;
		}

		// Display
		if (/^display,\d+,\d+,\d+$/.test(content)) {
			const x: number = parseInt(args[0]);
			const y: number = parseInt(args[1]);
			const color: number = parseInt(args[2]);

			tokens.push({ line, type: 'display', x, y, color });
			continue;
		}

		// If command is not valid
		throw new CompilationError(`Сommand "${content}" is not valid`, line);
	}

	return tokens;
}

/**
 * Parse code and prepare it for tokenization.
 * @param code Code to parse.
 */
function Parse(code: string): Line[] {
	// Lower case
	code = code.toLowerCase();

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

	// Detect begin and end of the code part
	const begin: number = lines.findIndex(({ content }) => content === 'begin');
	const end: number = lines.findIndex(({ content }) => content === 'end');

	// If begin or end not found
	if (begin === -1) throw new CompilationError('Code beginning is not specified');
	if (end === -1) throw new CompilationError('Code ending is not specified');

	// Slice unused file parts
	lines = lines.slice(begin + 1, end);

	return lines;
}

/**
 * Custom compiler error
 */
export class CompilationError extends Error {
	public name: string = 'CompilationError';
	public message: string;
	public cause: any;
	public stack: string | undefined;
	public line: number = -1;

	/**
	 * Error initialization.
	 * @param message Error message.
	 * @param line Line number of the error.
	 * @param cause Cause of the error.
	 */
	constructor(message: string, line?: number, cause?: any) {
		super(message);
		Error.captureStackTrace(this, CompilationError);

		this.message = message;
		if (line) this.line = line;
		if (cause) this.cause = cause;
	}
}
