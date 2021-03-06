// Instructions opcodes
export const opcodes = {
	NOTHING: 0,
	LOAD: 1,
	SAVE: 2,
	ADD: 3,
	SUBSTRACT: 4,
	EQUAL: 5,
	LESS: 6,
	GREATER: 7,
	AND: 8,
	OR: 9,
	JUMP: 10,
	TRUE: 11,
	FALSE: 12,
	RANDOM: 13,
	INPUT: 14,
	DISPLAY: 15,
};

interface VMConfig {
	safe: boolean;
	debug: boolean;
}

/**
 * # tiQ VM
 * Tiny virtual machine written in TypeScript
 */
export class VM {
	public safe: boolean = true;
	public debug: boolean = false;

	public running: boolean = false;
	public counter: number = 0;
	public accumulator: number = 0;
	public memory: Uint16Array = new Uint16Array(4096);

	public display: Uint8Array = new Uint8Array(1024);
	public input: Uint8Array = new Uint8Array(6);

	private loop?: number;

	constructor(config: Partial<VMConfig> = {}) {
		if (typeof config !== 'object') throw new VMError('Config must be an object');
		if (typeof config.safe === 'boolean') this.safe = config.safe;
		if (typeof config.debug === 'boolean') this.debug = config.debug;
	}

	/**
	 * Start VM loop
	 */
	public start(): void {
		clearInterval(this.loop);
		this.running = true;
		this.loop = setInterval(() => this.step());
		if (this.debug) this.info('VM is started');
	}

	/**
	 * Load executable data to the memory.
	 * @param instructions Data to load.
	 */
	public load(instructions: Uint16Array): void {
		this.memory = new Uint16Array(4096);

		if (this.safe) {
			if (instructions.length > 4096) throw new VMError('Executable is too big and most likely broken');
			if (instructions.length === 0) throw new VMError('Executable is empty and most likely broken');
			if (instructions[0] < 4096) throw new VMError('Executable starts with an empty instruction and will not be executed');
		}

		for (let address = 0; address < instructions.length; address++) {
			const instruction: number = instructions[address];
			this.memory[address] = instruction;
		}
	}

	/**
	 * Reset VM memory
	 */
	public reset() {
		this.counter = 0;
		this.accumulator = 0;
		this.memory = new Uint16Array(4096);
		this.display = new Uint8Array(1024);
		this.input = new Uint8Array(8);

		clearInterval(this.loop);
		if (this.debug) this.info('VM is reseted');
	}

	/**
	 * Stop VM loop
	 */
	public stop() {
		this.running = false;
		clearInterval(this.loop);
		if (this.debug) this.info('VM is stopped');
	}

	/**
	 * Fetch, Decode and Execute one instruction from the memory
	 */
	public step(): void {
		const instruction: number = this.fetch(this.counter);
		const { opcode, argument } = this.decode(instruction);
		this.execute(opcode, argument);
		
		this.counter += 1;
		if (this.counter > 4095) this.counter = 0;
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
	 * @param argument Argument of the instruction
	 */
	private execute(opcode: number, argument: number) {
		switch (opcode) {
			case opcodes.NOTHING:
				this.running = false;
				this.counter = 0;
				this.accumulator = 0;
				if (this.debug) this.log(`NOTHING, ${argument}`);
				break;

			case opcodes.LOAD: {
				this.accumulator = this.memory[argument];
				if (this.debug) this.log(`LOAD, ${argument}`);
				break;
			}

			case opcodes.SAVE: {
				this.memory[argument] = this.accumulator;
				if (this.debug) this.log(`SAVE, ${argument}`);
				break;
			}

			case opcodes.ADD: {
				let value: number = this.accumulator + this.memory[argument];
				if (this.safe && value > 65535) value = 65535;

				this.accumulator = value;
				if (this.debug) this.log(`ADD, ${argument}`);
				break;
			}

			case opcodes.SUBSTRACT: {
				let value: number = this.accumulator - this.memory[argument];
				if (this.safe && value < 0) value = 0;

				this.accumulator = value;
				if (this.debug) this.log(`SUBSTRACT, ${argument}`);
				break;
			}

			case opcodes.EQUAL: {
				this.accumulator = this.accumulator === this.memory[argument] ? 1 : 0;
				if (this.debug) this.log(`EQUAL, ${argument}`);
				break;
			}

			case opcodes.LESS: {
				this.accumulator = this.accumulator < this.memory[argument] ? 1 : 0;
				if (this.debug) this.log(`LESS, ${argument}`);
				break;
			}

			case opcodes.GREATER: {
				this.accumulator = this.accumulator > this.memory[argument] ? 1 : 0;
				if (this.debug) this.log(`GREATER, ${argument}`);
				break;
			}

			case opcodes.AND: {
				const a: 0 | 1 = this.accumulator === 0 ? 0 : 1;
				const b: 0 | 1 = this.memory[argument] === 0 ? 0 : 1;
				this.accumulator = a & b;
				if (this.debug) this.log(`AND, ${argument}`);
				break;
			}

			case opcodes.OR: {
				const a: 0 | 1 = this.accumulator === 0 ? 0 : 1;
				const b: 0 | 1 = this.memory[argument] === 0 ? 0 : 1;
				this.accumulator = a | b;
				if (this.debug) this.log(`OR, ${argument}`);
				break;
			}

			case opcodes.JUMP: {
				this.counter = argument - 1;
				if (this.safe && this.accumulator < 0) this.accumulator = 0;
				if (this.debug) this.log(`JUMP, ${argument}`);
				break;
			}

			case opcodes.TRUE: {
				if (this.accumulator !== 0) this.counter = argument - 1;
				if (this.safe && this.accumulator < 0) this.accumulator = 0;
				if (this.debug) this.log(`TRUE, ${argument}`);
				break;
			}

			case opcodes.FALSE: {
				if (this.accumulator === 0) this.counter = argument - 1;
				if (this.safe && this.accumulator < 0) this.accumulator = 0;
				if (this.debug) this.log(`FALSE, ${argument}`);
				break;
			}

			case opcodes.RANDOM: {
				this.accumulator = Math.floor(Math.random() * (argument + 1));
				if (this.debug) this.log(`RANDOM, ${argument}`);
				break;
			}

			case opcodes.INPUT: {
				const value: number = this.input[argument];
				this.accumulator = value ? 1 : 0;
				if (this.debug) this.log(`INPUT, ${argument}`);
				break;
			}

			case opcodes.DISPLAY: {
				const x: number = Math.floor(argument / 128);
				const slicedX: number = Math.floor(argument % 128);
				const y: number = Math.floor(slicedX / 4);
				const slicedY: number = Math.floor(slicedX % 4);

				const color: number = Math.floor(slicedY / 1);
				const address: number = 32 * y + x;
				this.display[address] = color;
				if (this.debug) this.log(`DISPLAY, ${x}, ${y}, ${color}`);
				break;
			}
		}

		// Stop interval if not running
		if (!this.running) clearInterval(this.loop);
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
