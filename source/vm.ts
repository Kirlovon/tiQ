interface VMConfig {
	safe: boolean;
	debug: boolean;
	memory: ArrayBuffer;
}

const memoryAmount = 4096;
const registersAmount = 16;

// Opcodes for VM instructions
export const opcodes = {
	NOTHING: 0,
	LOAD: 1,
	STORE: 2,
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

	public counter: number = 0;

	/**
	 * Memory ( 0 - 2047 ) 2048
	 * Input ( 2048 - 2039 ) 8
	 * Video ( 2040 - 3063 ) 1024
	 * Unused Memory ( 3064 - 2047 )
	 */
	public memory: Uint16Array = new Uint16Array(memoryAmount);

	/**
	 * Arithmetic Logic Unit ( 0 ) 1
	 * Counter Unit ( 1 ) 1
	 * Status Unit ( 2 ) 1
	 */
	public registers: Uint8Array = new Uint8Array(registersAmount)

	/**
	 * Instructions Memory ( 0 - 2047 ) 2048
	 * Storage Memory ( 2048 - 2559 ) 512
	 *
	 * Arithmetic-Logic Unit ( 2560 ) 1
	 * Logic Unit ( 2561 ) 1
	 * Counter Unit ( 2562 ) 1
	 * State Unit ( 2563 ) 1
	 *
	 * Unused memory ( 2564 - 3061 )
	 *
	 * Input ( 3062 - 3070 ) 8
	 * Video ( 3071 - 4095 ) 1024
	 *
	 * TOTAL: 4096 ( 8kb )
	 */

	constructor(config?: Partial<VMConfig>) {
		this.reset();
	}

	public load(buffer: ArrayBuffer): void {
		this.memory = new Uint16Array(memoryAmount);
	}

	public reset() {
		this.memory = new Uint16Array(memoryAmount);
	}

	public start() {
		this.memory[2563] = 1;
		setTimeout(() => this.execute());
	}

	public stop() {
		this.memory[2563] = 0;
	}

	public set(adress: number, value: number): void {
		if (this.safe) {
			if (value < 0) value = 0;
			if (value >= this.size) value = this.size;

			for (let i = 0; i < this.size; i++) {
				const opcode = i;
				
			}
		}

		this.memory[adress] = value;
	}

	public get(adress: number): number {
		return this.memory[adress];
	}

	public execute(): void {
		const {
			NOTHING,
			LOAD,
			STORE,
			ADD,
			SUBSTRACT,
			INCREASE,
			DECREASE,
			EQUAL,
			LESS,
			GREATER,
			AND,
			OR,
			XOR,
			NOT,
			JUMP,
			CLEAN,
		} = opcodes;

		const counter = this.memory[2562];
		const instruction = this.memory[counter];

		const opcode: number = Math.floor(instruction / this.size);
		const value: number = Math.floor(instruction % this.size);

		if (this.debug) {

		}
		
		switch (opcode) {
			case NOTHING:

				break;

			case LOAD:
				break;
			case STORE:
				break;
			case ADD:
				break;

			case SUBSTRACT:
				break;

			case INCREASE:
				break;

			case DECREASE:
				break;

			case EQUAL:
				break;

			case LESS:
				break;

			case GREATER:
				break;

			case AND:
				break;

			case OR:
				break;

			case XOR:
				break;

			case NOT:
				break;

			case JUMP:
				break;

			case CLEAN:
				break;

			default:
				throw new VMError(`Invalid opcode "${opcode}"`);
		}

		this.memory[2562] += 1;
		if (this.memory[2562] >= this.size) this.memory[2562] = 0;
		if (this.memory[2563]) setTimeout(() => this.execute());
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
