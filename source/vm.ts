/**
 * # tiQ
 * Tiny virtual machine written in TypeScript
 */
class tiQ {
	public registers = 8192;
	public buffer = new ArrayBuffer(this.registers * 2);
	public memory = new Uint16Array(this.buffer);

	/**
	 * Registers (0 - 6143)
	 *
	 * Unused memory (6142 - 7155)
	 *
	 * State (7156)
	 * Accumulator (7157)
	 * Counter (7158)
	 * Input (7159 - 7166)
	 * Video (7167 - 8191)
	 */

     constructor() {
         this.reset();
     }

	public start() {
		this.memory[7156] = 1;
		setTimeout(() => this.tick());
	}

	public stop() {
		this.memory[7156] = 0;
	}

	public reset() {
		this.buffer = new ArrayBuffer(this.registers * 2);
		this.memory = new Uint16Array(this.buffer);
	}

	public set(instruction: number, value: number) {
		return (instruction * this.registers) + value;
	}

	public tick(): void {
		const counter = this.memory[7158];
		const instruction = this.memory[counter];

		const type = Math.floor(instruction / this.registers);
		const value = Math.floor(instruction % this.registers);

        console.log('Counter: ', counter);
        console.log('Accumulator: ', this.memory[7157]);
        console.log('Instruction: ', instruction);

        console.log('instrsuction-type: ' + type + ', value: ' + value);
        console.log('');

		switch (type) {
			case 0:
                console.log('stopped');
                console.log(this.memory);
				this.memory[7156] = 0;
				break;

			case 1:
				this.memory[7157] = this.memory[value];
				break;

			case 2:
				this.memory[value] = this.memory[7157];
				break;

			case 3:
				this.memory[7157] = value;
				break;

			case 4:
				this.memory[7157] += this.memory[value];
				break;

			case 5:
				this.memory[7157] -= this.memory[value];
				break;

			case 6:
				if (this.memory[7157] === 0) this.memory[7158] = value - 1;
				break;

			case 7:
				this.memory[7158] = value - 1;
				break;

			default:
				throw new Error('Invalid instruction number: ' + type);
		}

		this.memory[7158] += 1;
		if (this.memory[7158] >= 8192) this.memory[7158] = 0;
		if (this.memory[7156]) setTimeout(() => this.tick());
	}
}

export default tiQ;

const vm = new tiQ();

vm.memory[0] = 24676;
vm.memory[1] = 16387;
vm.memory[2] = 57344;

vm.start();

