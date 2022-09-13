export class Message {
    time: Date;
    filter: number;
    channel: number;
    sender: string;
    text: string;

    constructor(timestamp: number, filter: number, channel: number, sender: string, text: string) {
        this.time = new Date(timestamp * 1000);
        this.filter = filter;
        this.channel = channel;
        this.sender = sender;
        this.text = text;
    }
}

export class BinLogParser {
    public parse(dat: ArrayBuffer): Message[] {
        const dw = new DataView(dat, 0);
        const bodyLen = dw.getUint32(0, true);
        const fileLen = dw.getUint32(4, true);
        let offset = 8;
        const trunkCount = fileLen - bodyLen;

        let posArray = [];
        for (let i = 0; i < trunkCount; i++) {
            const endPos = dw.getUint32(offset + i * 4, true);
            posArray.push(endPos);
        }

        let msgArray = [];
        offset += (trunkCount * 4);
        let begin = 0;
        for (let i = 0; i < posArray.length; i++) {
            const end = posArray[i];
            const msg = dat.slice(begin + offset, end + offset);
            msgArray.push(msg);
            begin = end;
        }

        let parsedMsg = [];
        for (let i = 0; i < msgArray.length; i++) {
            const msg = msgArray[i];
            const parsed = this.parse_msg(msg);
            if (parsed !== undefined) {
                parsedMsg.push(parsed);
            }
        }
        return parsedMsg;
    }

    public parse_msg(dat: ArrayBuffer): Message | undefined {
        const dw = new DataView(dat, 0);
        const timestamp = dw.getUint32(0, true);
        const filter = dw.getUint8(4);
        const channel = dw.getUint8(5);
        const col1 = dw.getUint8(8);
        if (col1 != 0x1F) return;
        let col2 = -1;
        for (let i = 9; i < dat.byteLength; i++) {
            const element = dw.getUint8(i);
            if (element == 0x02) {
                const payloadLen = dw.getInt8(i + 2);
                i += 2 + payloadLen;
                continue;
            }
            if (element == 0x1F) {
                col2 = i;
                break;
            }
        }
        if (col2 < 9) return;

        let sender = "";
        if (col2 > 9) {
            sender = this.parse_token_text(dat.slice(9, col2));
            // console.log(sender, this.buf2hex(dat.slice(9, col2)));
        }

        const text = this.parse_token_text(dat.slice(col2 + 1));
        return new Message(timestamp, filter, channel, sender, text);
    }

    parse_token_text(dat: ArrayBuffer): string {
        const dw = new DataView(dat, 0);
        const decoder = new TextDecoder("utf-8");

        let text = "";
        let beg = 0;

        for (let i = beg; i < dat.byteLength; i++) {
            const byte = dw.getUint8(i);
            if (byte == 2) {
                // save last
                text += decoder.decode(dat.slice(beg, i));

                const cmd = dw.getUint8(i + 1);
                const payloadLen = dw.getInt8(i + 2);
                const payload = dat.slice(i + 3, i + 3 + payloadLen - 1); // exclude terminate 3

                text += this.parse_token(cmd, payload);

                i += 3 + payloadLen - 1;
                beg = i + 1;
            }
        }
        text += decoder.decode(dat.slice(beg));
        return text;
    }

    parse_token(cmd: number, payload: ArrayBuffer): string {

        return "[" + ('00' + cmd.toString(16)).slice(-2) + "|" + this.buf2hex(payload) + "]";
    }

    buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
        return [...new Uint8Array(buffer)]
            .map(x => ('00' + x.toString(16)).slice(-2))
            .join(' ');
    }
}