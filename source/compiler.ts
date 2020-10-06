import { opcodes } from './vm';

interface Config {
	debug: boolean;
	import: (key: string) => string;
}

interface Line {
	index: number;
	content: string;
}

interface Token {
	line: number;
    type: string;
}

interface IncludeToken extends Token {
    type: 'INCLUDE';
    path: string;
}

interface PointToken extends Token {
	type: 'POINT';
	name: string;
}

interface GotoToken extends Token {
    type: 'GOTO';
    point: string;
}

interface InstructionToken extends Token {
    type: keyof typeof opcodes;
    arguments: number[];
}

type Tokens = IncludeToken | PointToken | GotoToken | InstructionToken;

export function Compile(code: string, config: Partial<Config> = {}): Uint16Array {
	const x = Parse(code);
	console.log(x);

	return new Uint16Array(4096);
}

function Parse(code: string, config: Partial<Config> = {}) {
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

	// Tokenize code lines
	let tokens: Tokens[] = lines.map(({ content, index }) => {	
		let line: number = index + 1;

		if (content.endsWith(':')) {
			const name: string = content.slice(0, -1).trim();
			return { line, type: 'POINT', name };
		}	

		if (content.startsWith('INCLUDE')) {
			const path: string = content.split('"')[1].trim();
			return { line, type: 'INCLUDE', path };
		}	

		if (content.startsWith('GOTO')) {
			const point: string = content.split('"')[1].trim();
			return { line, type: 'GOTO', point };
		}

		const argument: string = content.split(',')[1].trim();
		const parsed: number = parseInt(argument);

		if (isNaN(parsed)) throw new Error();
		if (parsed > 4095 || parsed < 0) throw new Error();
		
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

		// if (content.startsWith('INPUT')) {
		// 	return { line, type: 'INPUT', arguments: [] };
		// }

		// if (content.startsWith('DISPLAY')) {
		// 	return { line, type: 'DISPLAY', arguments: [] };
		// }

		throw new Error();
    });

	return tokens;
}
