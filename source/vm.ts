interface VMConfig {
	safe: boolean;
	debug: boolean;
	memory: ArrayBuffer;
}

// Opcodes for VM instructions
export const opcodes = {
	NOTHING: 0,
	LOAD: 1,
	SAVE: 2,
	ADD: 3,
	SUBSTRACT: 4,
	INCREASE: 5,
	DECREASE: 6,
	EQUAL: 7,
	LESS: 8,
	GREATER: 9,
	AND: 10,
	OR: 11,
	XOR: 12,
	NOT: 13,
	JUMP: 14,
	CLEAN: 15,
};

/**
 * # tiQ VM
 * Tiny virtual machine written in TypeScript
 */
export default class VM {
	public safe: boolean = true;
	public debug: boolean = false;

	public running: boolean = false;
	public counter: number = 0;
	public accumulator: number = 0;
	public memory: Uint16Array = new Uint16Array(4096);

	private loop: number;

	constructor(config?: Partial<VMConfig>) {
		this.reset();
	}

	public load(data: Uint16Array): void {
		this.memory = data;
	}

	public reset() {
		this.counter = 0;
		this.accumulator = 0;
		this.memory = new Uint16Array(4096);
	}

	public start(): void {
		this.running = true;
		this.step();
	}

	public stop() {
		this.running = false;
		clearTimeout(this.loop);
	}

	public step(): void {
		this.counter += 1;
		if (this.counter >= 4096) this.counter = 0;

		const instruction = this.fetch();
		const { opcode, argument } = this.decode(instruction);

		if (this.debug) {
			console.log(`Executing instruction "${instruction}"`, `Opcode: "${opcode}"`, `Argument: "${argument}"`);
		}

		this.execute(opcode, argument);

		if (this.running) this.loop = setTimeout(() => this.step());
	}

	private fetch(): number {
		const current = this.counter;
		return this.memory[current];
	}

	private decode(instruction: number): { opcode: number; argument: number } {
		const opcode: number = Math.floor(instruction / 4096);
		const argument: number = Math.floor(instruction % 4096);
		return { opcode, argument };
	}

	private execute(opcode: number, argument: number) {
		// Clamp argument
		if (this.safe) {
			if (argument > 4095) argument = 4095;
			if (argument < 0) argument = 0;
		}

		if (opcode === opcodes.NOTHING) {
			this.running = false;
			this.counter = 0;
			this.accumulator = 0;
			return;
		}

		if (opcode === opcodes.LOAD) {
			this.accumulator = this.memory[argument];
			return;
		}

		if (opcode === opcodes.SAVE) {
			this.memory[argument] = this.accumulator;
			return;
		}

		if (opcode === opcodes.ADD) {
			this.accumulator += this.memory[argument];
			return;
		}

		if (opcode === opcodes.SUBSTRACT) {
			this.accumulator -= this.memory[argument];
			return;
		}

		if (opcode === opcodes.INCREASE) {
			this.memory[argument] += 1;
			return;
		}

		if (opcode === opcodes.DECREASE) {
			this.memory[argument] -= 1;
			return;
		}

		if (opcode === opcodes.EQUAL) {
			this.accumulator = this.accumulator === this.memory[argument] ? 1 : 0;
			return;
		}

		if (opcode === opcodes.LESS) {
			this.accumulator = this.accumulator < this.memory[argument] ? 1 : 0;
			return;
		}

		if (opcode === opcodes.GREATER) {
			this.accumulator = this.accumulator > this.memory[argument] ? 1 : 0;
			return;
		}

		if (opcode === opcodes.AND) {
			const a = this.accumulator >= 1 ? 1 : 0;
			const b = this.memory[argument] >= 1 ? 1 : 0;
			this.accumulator = a & b;
			return;
		}

		if (opcode === opcodes.OR) {
			const a = this.accumulator >= 1 ? 1 : 0;
			const b = this.memory[argument] >= 1 ? 1 : 0;
			this.accumulator = a | b;
			return;
		}

		if (opcode === opcodes.XOR) {
			const a = this.accumulator >= 1 ? 1 : 0;
			const b = this.memory[argument] >= 1 ? 1 : 0;
			this.accumulator = a ^ b;
			return;
		}

		if (opcode === opcodes.NOT) {
			this.accumulator = this.memory[argument] >= 1 ? 0 : 1;
			return;
		}

		if (opcode === opcodes.JUMP) {
			this.counter = argument - 1;
			return;
		}

		if (opcode === opcodes.CLEAN) {
			this.memory[argument] = 0;
			return;
		}

		if (this.safe) throw new VMError(`Invalid opcode "${opcode}"`);
	}
}

/** Custom VM error */
export class VMError extends Error {
	public name: string = 'VMError';
	public message: string;
	public cause: any;
	public stack: string | undefined;

	/**
	 * Error initialization.
	 * @param message Error message.
	 * @param cause Cause of the error.
	 */
	constructor(message: string, cause?: any) {
		super(message);
		Error.captureStackTrace(this, VMError);

		this.message = message;
		if (cause) this.cause = cause;
		if (typeof cause === 'string' || typeof cause === 'number') this.message = `${message}: ${cause}`;
	}
}

