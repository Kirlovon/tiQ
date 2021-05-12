import { opcodes } from './vm';

// TODO: Allow to use labels in any instructions

// Code line structure
interface Line {
	index: number;
	content: string;
}

// Token structure
interface Token {
	line: number;
	type: string;
}

// Finish token structure
interface FinishToken extends Token {
	type: 'finish';
}

// Raw instructions token
interface RawToken extends Token {
	type: 'raw';
	value: number;
}

// Declare token structure
interface DeclareToken extends Token {
	type: 'declare';
	value: number;
	address: number;
}

// Label token structure
interface LabelToken extends Token {
	type: 'label';
	name: string;
}

// Empty instructions token
interface NothingToken extends Token {
	type: 'nothing';
	value: number;
}

// Basic instructions token
interface BasicToken extends Token {
	type: 'load' | 'save' | 'add' | 'substract';
	address: number;
}

// Comparison instructions token
interface ComparisonToken extends Token {
	type: 'equal' | 'less' | 'greater' | 'and' | 'or';
	address: number;
}

// Logical instructions token
interface LogicalToken extends Token {
	type: 'jump' | 'true' | 'false';
	position: string | number;
}

// Random instructions token
interface RandomToken extends Token {
	type: 'random';
	maximum: number;
}

// Input instructions token
interface InputToken extends Token {
	type: 'input';
	key: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

// Display instructions token
interface DisplayToken extends Token {
	type: 'display';
	x: number;
	y: number;
	color: number;
}

// List of tokens
type Tokens = Array<
	| FinishToken
	| LabelToken
	| DeclareToken
	| RawToken
	| NothingToken
	| BasicToken
	| ComparisonToken
	| LogicalToken
	| RandomToken
	| InputToken
	| DisplayToken
>;

/**
 * Compilator configuration
 */
interface Config {
	/**
	 * Perform additional validations that may reveal runtime errors. _( Default: true )_
	 */
	safe: boolean;

	/**
	 * Trim compiled byte code. Reduces the size of the executable file. _( Default: true )_
	 */
	optimize: boolean;
}

// Default config
const defaultConfig: Config = {
	safe: true,
	optimize: true,
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
	const { safe, optimize } = config;

	const parsed: Line[] = Parse(code);
	const tokenized: Tokens = Tokenize(parsed);

	let tokens: Tokens = tokenized;
	const declarations: DeclareToken[] = [];
	const labels: Map<string, { line: number; address: number }> = new Map();

	// Declarations should be declared at the code beginning
	if (safe) {
		let declarations: boolean = true;

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			if (declarations) {
				if (token.type !== 'declare') declarations = false;
			} else {
				if (token.type === 'declare')
					throw new CompilationError(`Declarations must be only at the very beginning of code execution`, token.line, true);
			}
		}
	}

	// Find all declarations
	tokens = tokens.filter(token => {
		if (token.type !== 'declare') return true;
		const { address, value, line } = token;

		// Validate declarations
		if (address > 4095 || address < 0) throw new CompilationError(`Address "${address}" is out of range`, line);
		if (value > 65535 || value < 0) throw new CompilationError(`Value "${value}" is out of range`, line);

		declarations.push(token);
		return false;
	});

	// Find all labels
	tokens = tokens.filter((token, index) => {
		if (token.type !== 'label') return true;
		const { name, line } = token;

		// Check if label is already declared
		if (safe && labels.has(name)) throw new CompilationError(`Label "${name}" declared multiple times`, line, true);

		labels.set(name, {
			line: line,
			address: index - labels.size,
		});
		return false;
	});

	// Check instructions
	if (safe && tokenized.length > 4095) {
		throw new CompilationError(`Code contains ${tokenized.length} instructions ( Maximum supported is 4096 )`, undefined, true);
	}

	// Convery tokens to instructions
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];

		// Finish instruction
		if (token.type === 'finish') {
			binary[i] = 0;
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
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.LOAD + token.address;
			continue;
		}

		// Save instruction
		if (token.type === 'save') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.SAVE + token.address;
			continue;
		}

		// Add instruction
		if (token.type === 'add') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.ADD + token.address;
			continue;
		}

		// Save instruction
		if (token.type === 'substract') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.SUBSTRACT + token.address;
			continue;
		}

		// Equal instruction
		if (token.type === 'equal') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.EQUAL + token.address;
			continue;
		}

		// Less instruction
		if (token.type === 'less') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.LESS + token.address;
			continue;
		}

		// Greater instruction
		if (token.type === 'greater') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.GREATER + token.address;
			continue;
		}

		// And instruction
		if (token.type === 'and') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.AND + token.address;
			continue;
		}

		// Or instruction
		if (token.type === 'or') {
			if (token.address > 4095 || token.address < 0) throw new CompilationError(`Address "${token.address}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.OR + token.address;
			continue;
		}

		// Jump instruction
		if (token.type === 'jump') {
			let address: number;

			if (typeof token.position === 'string') {
				const label = labels.get(token.position);
				if (typeof label === 'undefined') throw new CompilationError(`Label "${token.position}" is not found`, token.line);
				address = label.address;
			} else {
				if (token.position > 4095 || token.position < 0)
					throw new CompilationError(`Address "${token.position}" is out of range`, token.line);
				address = token.position;
			}

			binary[i] = 4096 * opcodes.JUMP + address;
			continue;
		}

		// True instruction
		if (token.type === 'true') {
			let address: number;

			if (typeof token.position === 'string') {
				const label = labels.get(token.position);
				if (typeof label === 'undefined') throw new CompilationError(`Label "${token.position}" is not found`, token.line);
				address = label.address;
			} else {
				if (token.position > 4095 || token.position < 0)
					throw new CompilationError(`Address "${token.position}" is out of range`, token.line);
				address = token.position;
			}

			binary[i] = 4096 * opcodes.TRUE + address;
			continue;
		}

		// False instruction
		if (token.type === 'false') {
			let address: number;

			if (typeof token.position === 'string') {
				const label = labels.get(token.position);
				if (typeof label === 'undefined') throw new CompilationError(`Label "${token.position}" is not found`, token.line);
				address = label.address;
			} else {
				if (token.position > 4095 || token.position < 0)
					throw new CompilationError(`Address "${token.position}" is out of range`, token.line);
				address = token.position;
			}

			binary[i] = 4096 * opcodes.FALSE + address;
			continue;
		}

		// Random instruction
		if (token.type === 'random') {
			if (token.maximum > 4095 || token.maximum < 0) throw new CompilationError(`Value "${token.maximum}" is out of range`, token.line);
			binary[i] = 4096 * opcodes.RANDOM + token.maximum;
			continue;
		}

		// Input instruction
		if (token.type === 'input') {
			if (token.key > 7 || token.key < 0) throw new CompilationError(`Key "${token.key}" is not exists`, token.line);
			binary[i] = 4096 * opcodes.INPUT + token.key;
			continue;
		}

		// Display instruction
		if (token.type === 'display') {
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

		// If address contains instruction
		if (safe && binary[address] !== 0) {
			throw new CompilationError(`Address "${address}" already contains the instruction`, line, true);
		}

		binary[address] = value;
	}

	// If its empty
	if (tokens.length === 0) return new Uint16Array(0);

	// Oprimize executable code size
	if (optimize) {
		const size: number = binary.length - 1;
		let end: number = size;

		// Impossible to optimize
		if (binary[size] !== 0) return binary;

		// Detect code ending
		for (let i = size; i >= 0; i--) {
			if (binary[i] === 0) continue;
			end = i + 1;
			break;
		}

		// Remove unused space
		const optimized: Uint16Array = binary.filter((instruction, index) => {
			if (index <= end) return true;
			return false;
		});

		return optimized;
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

		// Label
		if (/^:\w+$/.test(content)) {
			const name: string = content;
			tokens.push({ line, type: 'label', name });
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
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'load', address });
			continue;
		}

		// Save
		if (/^save,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'save', address });
			continue;
		}

		// Add
		if (/^add,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'add', address });
			continue;
		}

		// Substract
		if (/^substract,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'substract', address });
			continue;
		}

		// Equal
		if (/^equal,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'equal', address });
			continue;
		}

		// Less
		if (/^less,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'less', address });
			continue;
		}

		// Greater
		if (/^greater,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'greater', address });
			continue;
		}

		// And
		if (/^and,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'and', address });
			continue;
		}

		// Or
		if (/^or,\d+$/.test(content)) {
			const address: number = parseInt(args[0]);
			tokens.push({ line, type: 'or', address });
			continue;
		}

		// Jump
		if (/^jump,(:\w+|\d+)$/.test(content)) {
			const isNumber: boolean = /^\d+$/.test(args[0]);
			const position: number | string = isNumber ? parseInt(args[0]) : args[0];
			tokens.push({ line, type: 'jump', position });
			continue;
		}

		// True
		if (/^true,(:\w+|\d+)$/.test(content)) {
			const isNumber: boolean = /^\d+$/.test(args[0]);
			const position: number | string = isNumber ? parseInt(args[0]) : args[0];
			tokens.push({ line, type: 'true', position });
			continue;
		}

		// False
		if (/^false,(:\w+|\d+)$/.test(content)) {
			const isNumber: boolean = /^\d+$/.test(args[0]);
			const position: number | string = isNumber ? parseInt(args[0]) : args[0];
			tokens.push({ line, type: 'false', position });
			continue;
		}

		// Random
		if (/^random,\d+$/.test(content)) {
			const maximum: number = parseInt(args[0]);
			tokens.push({ line, type: 'random', maximum });
			continue;
		}

		// Input
		if (/^input,\d+$/.test(content)) {
			const key = parseInt(args[0]) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
			tokens.push({ line, type: 'input', key });
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
	public stack: string | undefined;
	public line: number = -1;
	public safe: boolean = false;

	/**
	 * Error initialization.
	 * @param message Error message.
	 * @param line Line number of the error.
	 * @param safe True if error made because of the safe mode.
	 */
	constructor(message: string, line?: number, safe?: boolean) {
		super(message);
		Error.captureStackTrace(this, CompilationError);

		this.message = message;
		if (line) this.line = line;
		if (safe) this.safe = true;
	}
}
