
export function Compile(code: string): Uint16Array {
    let codeLines: string[] = code.split(/\r?\n/);

    // Remove comments
    codeLines = codeLines.map(line => line.split('//')[0]);

    // Trim lines
    codeLines = codeLines.map(line => line.trim());

    // Remove empty lines
    codeLines = codeLines.filter(line => line !== '');

    const start: number = codeLines.indexOf('START');
    const end: number = codeLines.indexOf('END');

    if (start === -1) throw new Error();
    if (end === -1) throw new Error();

    codeLines = codeLines.slice(start + 1, end);

    console.log(codeLines);


    return new Uint16Array(4096);
}

