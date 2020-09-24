interface VMConfig {
	safe: boolean;
	debug: boolean;
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

	constructor(config: Partial<VMConfig> = {}) {
		if (typeof config !== 'object') throw new VMError('Config must be an object')
		if (typeof config.safe === 'boolean') this.safe = config.safe;
		if (typeof config.debug === 'boolean') this.debug = config.debug;
		this.reset();
	}

	/**
	 * Start VM loop
	 */
	public start(): void {
		if (this.debug) this.info('VM is started');
		clearTimeout(this.loop);
		this.running = true;
		this.loop = setTimeout(() => this.step());
	}

	public load(data: Uint16Array): void {
		this.memory = data;
	}

	/**
	 * Reset VM memory
	 */
	public reset() {
		if (this.debug) this.info('VM is reseted');
		this.counter = 0;
		this.accumulator = 0;
		this.memory = new Uint16Array(4096);
	}

	/**
	 * Stop VM loop
	 */
	public stop() {
		if (this.debug) this.info('VM is stopped');
		this.running = false;
		clearTimeout(this.loop);
	}

	/**
	 * Fetch, Decode and Execute one instruction from the memory
	 */
	public step(): void {
		this.counter += 1;
		if (this.counter > 4095) this.counter = 0;

		const instruction: number = this.fetch(this.counter);
		const { opcode, argument } = this.decode(instruction);
		this.execute(opcode, argument);

		if (this.running) this.loop = setTimeout(() => this.step());
	}

	/**
	 * Fetch instruction from address
	 * @param address Address of the instruction
	 */
	private fetch(address: number): number {
		return this.memory[address];
	}

	/**
	 * Decode instruction from memory
	 * @param instruction Instruction to decode
	 */
	private decode(instruction: number): { opcode: number; argument: number } {
		let opcode: number = Math.floor(instruction / 4096);
		let argument: number = Math.floor(instruction % 4096);

		// Clamp & check the numbers
		if (this.safe) {
			if (opcode > 15 || opcode < 0) throw new VMError('Invalid opcode');

			if (argument > 4095) {
				if (this.debug) this.warn(`Argument was clamped from ${argument} to "4095"`);
				argument = 4095;
			} else if (argument < 0) {
				if (this.debug) this.warn(`Argument was clamped from ${argument} to "0"`);
				argument = 0;
			}
		}

		return { opcode, argument };
	}

	/**
	 * Execute decoded VM instruction
	 * @param opcode Opcode of the instruction
	 * @param argument Number or address
	 */
	private execute(opcode: number, argument: number) {
		switch (opcode) {
			case opcodes.NOTHING:
				if (this.debug) this.log(`NOTHING, ${argument}`);
				this.running = false;
				this.counter = 0;
				this.accumulator = 0;
				break;

			case opcodes.LOAD: {
				if (this.debug) this.log(`LOAD, ${argument} (${this.memory[argument]})`);
				this.accumulator = this.memory[argument];
				break;
			}

			case opcodes.SAVE: {
				if (this.debug) this.log(`SAVE, ${argument} (${this.accumulator})`);
				this.memory[argument] = this.accumulator;
				break;
			}

			case opcodes.ADD: {
				let value: number = this.accumulator + this.memory[argument];
				if (this.safe && value > 4095) value = 4095; 
				
				if (this.debug) this.log(`ADD, ${argument} (${this.accumulator})`);
				this.accumulator = value;
				break;
			}

			case opcodes.SUBSTRACT: {
				let value: number = this.accumulator - this.memory[argument];
				if (this.safe && value < 0) value = 0; 
				this.accumulator = value;
				break;
			}

			case opcodes.INCREASE: {
				let value: number = this.accumulator + 1;
				if (this.safe && value > 4095) value = 4095;
				this.accumulator = value;
				break;
			}

			case opcodes.DECREASE: {
				let value: number = this.accumulator - 1;
				if (this.safe && value < 0) value = 0;
				this.accumulator = value;
				break;
			}

			case opcodes.EQUAL: {
				this.accumulator = this.accumulator === this.memory[argument] ? 1 : 0;
				break;
			}

			case opcodes.LESS: {
				this.accumulator = this.accumulator < this.memory[argument] ? 1 : 0;
				break;
			}

			case opcodes.GREATER: {
				this.accumulator = this.accumulator > this.memory[argument] ? 1 : 0;
				break;
			}

			case opcodes.AND: {
				const a: 0 | 1 = this.accumulator === 0 ? 0 : 1;
				const b: 0 | 1 = this.memory[argument] === 0 ? 0 : 1;
				this.accumulator = a & b;
				break;
			}

			case opcodes.OR: {
				const a: 0 | 1 = this.accumulator === 0 ? 0 : 1;
				const b: 0 | 1 = this.memory[argument] === 0 ? 0 : 1;
				this.accumulator = a | b;
				break;
			}

			case opcodes.XOR: {
				const a: 0 | 1 = this.accumulator === 0 ? 0 : 1;
				const b: 0 | 1 = this.memory[argument] === 0 ? 0 : 1;
				this.accumulator = a ^ b;
				break;
			}

			case opcodes.NOT: {
				this.accumulator = this.memory[argument] === 0 ? 1 : 0;
				break;
			}

			case opcodes.JUMP: {
				const value: number = argument - 1;
				if (this.debug) this.log(`JUMP, ${argument} (${this.counter} => ${value})`);
				this.counter = value;
				break;
			}

			case opcodes.CLEAN: {
				if (this.debug) this.log(`CLEAN, ${argument}`);
				this.memory[argument] = 0;
				break;
			}
		}
	}

	/**
	 * Show info message
	 * @param message Info message
	 */
	private info(message: string): void {
		console.info(`tiQ [${Date.now()}]`, message);
	}

	/**
	 * Show log message
	 * @param message Log message
	 */
	private log(message: string): void {
		console.log(`tiQ [${Date.now()}]`, message);
	}

	/**
	 * Show warning message
	 * @param message Warning message
	 */
	private warn(message: string): void {
		console.warn(`tiQ [${Date.now()}]`, message);
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
