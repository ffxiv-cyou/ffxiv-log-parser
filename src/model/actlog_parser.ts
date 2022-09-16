import { Message } from "./message";

export class ActLogParser {
  public static validate(dat: ArrayBuffer): boolean {
    const dw = new DataView(dat, 0);
    const ch1 = dw.getUint8(0);
    const ch2 = dw.getUint8(1);
    return ch1 >= 0x30 && ch1 <= 0x39 && ch2 >= 0x30 && ch2 <= 0x39;
  }

  public static parse(data: ArrayBuffer): Message[] {
    const dec = new TextDecoder("utf-8");
    const text = dec.decode(data);
    const rows = text.split("\n");

    const messages = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cols = row.split("|");

      if (parseInt(cols[0]) !== 0) continue;

      const time = cols[1];
      const chanFilter = parseInt(cols[2], 16);
      const channel = chanFilter >> 8;
      const filter = chanFilter & 0xff;
      const sender = cols[3];
      const message = cols[4];

      messages.push(
        Message.Text(
          new Date(time).getTime() / 1000,
          filter,
          channel,
          sender,
          message
        )
      );
    }
    return messages;
  }
}
