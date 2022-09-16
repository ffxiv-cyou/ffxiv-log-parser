import { Message } from "./message";

export class ActLogParser {
    public static validate(dat: ArrayBuffer): boolean {
        const dw = new DataView(dat, 0);
        const ch1 = dw.getUint8(0);
        const ch2 = dw.getUint8(1);
        return ch1 >= 0x30 && ch1 <= 0x39 && ch2 >= 0x30 && ch2 <= 0x39;
    }

    public static parse(data: ArrayBuffer): Message[] {
        var dec = new TextDecoder("utf-8");
        var text = dec.decode(data);
        var rows = text.split("\n");

        var messages = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            var cols = row.split("|");

            if (parseInt(cols[0]) !== 0) continue;

            var time = cols[1];
            var chanFilter = parseInt(cols[2], 16);
            var channel = chanFilter >> 8;
            var filter = chanFilter & 0xFF;
            var sender = cols[3];
            var message = cols[4];

            messages.push(Message.Text(new Date(time).getTime() / 1000, filter, channel, sender, message));
        }
        return messages;
    }
}