export class Message {
    time: Date;
    filter: number;
    channel: number;
    sender: TokenText;
    text: TokenText;

    constructor(timestamp: number, filter: number, channel: number, sender: TokenText, text: TokenText) {
        this.time = new Date(timestamp * 1000);
        this.filter = filter;
        this.channel = channel;
        this.sender = sender;
        this.text = text;
    }
}

export enum TokenType {
    Text,
    Token,
    Unknown
}

export class TokenItem {
    type: TokenType;
    cmd: number;
    param: ArrayBuffer;
    text: string;

    constructor(type: TokenType, cmd: number, param: ArrayBuffer, text: string) {
        this.type = type;
        this.cmd = cmd;
        this.param = param;
        this.text = text;
    }

    static FromText(text: string): TokenItem {
        return new TokenItem(TokenType.Text, 0, new ArrayBuffer(0), text);
    }

    static FromToken(cmd: number, param: ArrayBuffer): TokenItem {
        return new TokenItem(TokenType.Token, cmd, param, "");
    }

    public ToString(): string {
        switch (this.type) {
            case TokenType.Text:
                return this.text;
            case TokenType.Token:
                return "[" + ('00' + this.cmd.toString(16)).slice(-2) + "|" + buf2hex(this.param) + "]";
            case TokenType.Unknown:
            default:
                return "[Unknown]";
        }
    }
}

export class TokenText {
    items: TokenItem[]

    constructor(items: TokenItem[]) {
        this.items = items;
    }

    public ToString(): string {
        let str = "";
        for (let i = 0; i < this.items.length; i++) {
            str += this.items[i].ToString();
        }
        return str;
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

        let sender = new TokenText([]);
        if (col2 > 9) {
            sender = this.parse_token_text(dat.slice(9, col2));
            // console.log(sender, this.buf2hex(dat.slice(9, col2)));
        }

        const text = this.parse_token_text(dat.slice(col2 + 1));
        return new Message(timestamp, filter, channel, sender, text);
    }

    parse_token_text(dat: ArrayBuffer): TokenText {
        const dw = new DataView(dat, 0);
        const decoder = new TextDecoder("utf-8");

        let items = [];
        let beg = 0;
        for (let i = beg; i < dat.byteLength; i++) {
            const byte = dw.getUint8(i);
            if (byte == 2) {
                // save last
                items.push(TokenItem.FromText(decoder.decode(dat.slice(beg, i))));

                const cmd = dw.getUint8(i + 1);
                const payloadLen = dw.getInt8(i + 2);
                const payload = dat.slice(i + 3, i + 3 + payloadLen - 1); // exclude terminate 3
                items.push(TokenItem.FromToken(cmd, payload));

                i += 3 + payloadLen - 1;
                beg = i + 1;
            }
        }
        if (beg < dat.byteLength) {
            items.push(TokenItem.FromText(decoder.decode(dat.slice(beg))));
        }
        return new TokenText(items);
    }

}

export function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => ('00' + x.toString(16)).slice(-2))
        .join(' ');
}