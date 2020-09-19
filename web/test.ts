document.getElementById('load').onclick = async () => {
    const file = await requestFile();
    const parsed = await parseBinaryFile(file);
    console.log(parsed);
}

function parseBinaryFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = (event) => {
            const content = event.target.result;
            const parsed = new Uint16Array(content)
            resolve(parsed);
        }

        reader.onerror = (event) => {
            reject(event);
        }
    });
}

function requestFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.tiq';

        input.onchange = (event) => {
            const file = event.target.files[0];
            resolve(file);
        }

        input.onerror = (event) => {
            reject(event);
        }

        input.click();
    });
}