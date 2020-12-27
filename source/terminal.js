// TODO

const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

let up = false;
let left = false;
let right = false;
let down = false;

stdin.on('data', function (key) {
    if (key == '\u001B\u005B\u0041') {
        up = true;
    }
    if (key == '\u001B\u005B\u0043') {
        right = true;
    }
    if (key == '\u001B\u005B\u0042') {
        down = true;
    }
    if (key == '\u001B\u005B\u0044') {
        left = true;
    }

    if (key == '\u0003') { process.exit(); }    // ctrl-c
});


setInterval(() => {
    console.clear();

    let result = '';

    for (let index = 0; index < 32; index++) {
        for (let d = 0; d < 32; d++) {
            result += '██';
        }

        result += '\n';
    }

    console.log(result);
    console.log('\n');
}, 16);