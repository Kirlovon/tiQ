/**
 * Decompilation config.
 */
interface Config {

    /**
     * Add tabs to the return code _( Default: true )_
     */
    tabs: boolean;

    /**
     * TODO: Not working right now
     * Create labels for JUMP, TRUE & FALSE instructions
     */
    labels: boolean;
}

// Default configuration
const defaultConfig: Config = {
    tabs: true,
    labels: true
}

/**
 * Decompile binary file
 * @param executable Executable instructions
 * @param config Configuration
 */
export function Decompile(executable: Uint16Array, config?: Config): string {
    // Merge configs
    config = { ...defaultConfig, ...config };

    let lines: string[] = [];
    let declarations: string[] = [];

    const { tabs, labels } = config;
    
    for (let i = 0; i < executable.length; i++) {
        const instruction: number = executable[i];
        const opcode: number = Math.floor(instruction / 4096);
        const argument: number = Math.floor(instruction % 4096);

        if (instruction === 0) {
            lines.push('finish');
            continue;
        }

        if (opcode === 0) {
            lines.push(`${argument}`);
            continue;
        }

        if (opcode === 1) {
            lines.push(`load, ${argument}`);
            continue;
        }

        if (opcode === 2) {
            lines.push(`save, ${argument}`);
            continue;
        }

        if (opcode === 3) {
            lines.push(`add, ${argument}`);
            continue;
        }

        if (opcode === 4) {
            lines.push(`substract, ${argument}`);
            continue;
        }

        if (opcode === 5) {
            lines.push(`equal, ${argument}`);
            continue;
        }

        if (opcode === 6) {
            lines.push(`less, ${argument}`);
            continue;
        }

        if (opcode === 7) {
            lines.push(`greater, ${argument}`);
            continue;
        }

        if (opcode === 8) {
            lines.push(`and, ${argument}`);
            continue;
        }

        if (opcode === 9) {
            lines.push(`or, ${argument}`);
            continue;
        }

        if (opcode === 10) {
            lines.push(`jump, ${argument}`);
            continue;
        }

        if (opcode === 11) {
            lines.push(`true, ${argument}`);
            continue;
        }

        if (opcode === 12) {
            lines.push(`false, ${argument}`);
            continue;
        }

        if (opcode === 13) {
            lines.push(`random, ${argument}`);
            continue;
        }
        
        if (opcode === 14) {
            lines.push(`input, ${argument}`);
            continue;
        }

        
        if (opcode === 15) {
            const x: number = Math.floor(argument / 128);
            const slicedX: number = Math.floor(argument % 128);
            const y: number = Math.floor(slicedX / 4);
            const slicedY: number = Math.floor(slicedX % 4);
            const color: number = Math.floor(slicedY / 1);

            lines.push(`display, ${x}, ${y}, ${color}`);
            continue
        }
    }

    // Find declarations
    for (let i = 1; i < lines.length; i++) {
        const currentLine: string = lines[i]
        const nextLine: string | undefined  = lines[i + 1]; 

        // If current number is raw number
        if (/^\d+$/.test(currentLine)) {
            if (nextLine === 'finish' || nextLine === undefined) {
                lines[i] = 'finish'
                declarations.push(`declare, ${i}, ${currentLine}`)
            }
        }
    }

    // Remove "finish" lines
    while(lines[lines.length - 1] === 'finish') {
        lines.pop();
    }

    // Add one "finish" line
    if (lines.length < 4096) {
        lines.push('finish');
    }
        
    // Tabulation
    if (tabs) {
        lines = lines.map(line => ('\t' + line));
        declarations = declarations.map(line => ('\t' + line));
    }

    // Build code
    let code: string = '';
    code += 'begin';
    code += '\n';
    code += declarations.join('\n');
    code += '\n';
    code += lines.join('\n');
    code += '\n';
    code += 'end';
    code += '\n';

    return code;
}