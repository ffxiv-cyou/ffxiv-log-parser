import { readFile } from "fs/promises";
import { argv, exit } from "process";

import { Message, BinLogParser, buf2hex, TokenItem } from "../src/model/binlog_parser";

if (argv.length < 3) {
    console.log("Usage: converter <path1>");
    exit(-1);
}

readFiles(argv.slice(2)).then(() => { });

function readFiles(files: string[]): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        const parser = new BinLogParser();
        let msgs: Message[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const buffer = await readFile(file);

            const msg = parser.parse(toArrayBuffer(buffer));
            msgs.push(...msg);
            console.log(file, msg.length);
        }

        const filterSet = new Set<number>();
        const cmdSet = new Set<number>();

        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
            filterSet.add(msg.filter);

            let printK = false;

            for (let j = 0; j < msg.sender.items.length; j++) {
                const it = msg.sender.items[j];
                cmdSet.add(it.cmd);
                printK ||= printIt(it);
            }
            for (let j = 0; j < msg.text.items.length; j++) {
                const it = msg.text.items[j];
                cmdSet.add(it.cmd);
                printK ||= printIt(it);
            }

            if (printK) {
                console.log(msg.sender.ToString(), msg.text.ToString());
            }
        }
        // console.log(toHexArray(Uint8Array.from(filterSet).sort()));
        // console.log(toHexArray(Uint8Array.from(cmdSet).sort()));

        resolve("");
    });
}

function printIt(item: TokenItem): boolean {
    const dw = new DataView(item.param);

    if (item.cmd !== 0x2E) return false;

    // if (item.param.byteLength === 1 && dw.getUint8(0) === 1) {
    //     return false;
    // }
    // const knownList = [0xf201f5, 0xf20226, 0XF20228, 0XF2022a];
    // if (item.param.byteLength === 3) {
    //     let v = (dw.getUint8(0) << 16) + (dw.getUint8(1) << 8) + (dw.getUint8(2) << 0);
    //     if (knownList.includes(v)) return false;
    // }

    console.log(item.cmd, buf2hex(item.param));
    return true;
}

function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

function toHexArray(array) {
    return [...array].map((n) => n.toString(16));
}