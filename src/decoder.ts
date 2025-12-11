import { ObjectStateFormatter } from "./types/objectStateFormatter"

const formatter = new ObjectStateFormatter();

function base64ToArrayBuffer(base64: string) {
    let binaryString = atob(base64);
    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function decode() {
    let viewStateInput: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("viewStateInput");
    let base64data = viewStateInput.value;
    let data = base64ToArrayBuffer(base64data);
    formatter.Deserialize(data.buffer);
}