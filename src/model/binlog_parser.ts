import { TokenText, Message, TokenItem } from "./message";

export class BinLogParser {
  public static validate(dat: ArrayBuffer): boolean {
    const dw = new DataView(dat, 0);
    const bodyLen = dw.getUint32(0, true);
    const fileLen = dw.getUint32(4, true);
    return fileLen > bodyLen && fileLen - bodyLen <= 1000;
  }

  public static parse(dat: ArrayBuffer): Message[] {
    const dw = new DataView(dat, 0);
    const bodyLen = dw.getUint32(0, true);
    const fileLen = dw.getUint32(4, true);
    let offset = 8;
    const trunkCount = fileLen - bodyLen;

    const posArray = [];
    for (let i = 0; i < trunkCount; i++) {
      const endPos = dw.getUint32(offset + i * 4, true);
      posArray.push(endPos);
    }

    const msgArray = [];
    offset += trunkCount * 4;
    let begin = 0;
    for (let i = 0; i < posArray.length; i++) {
      const end = posArray[i];
      const msg = dat.slice(begin + offset, end + offset);
      msgArray.push(msg);
      begin = end;
    }

    const parsedMsg = [];
    for (let i = 0; i < msgArray.length; i++) {
      const msg = msgArray[i];
      const parsed = this.parse_msg(msg);
      if (parsed !== undefined) {
        parsedMsg.push(parsed);
      }
    }
    return parsedMsg;
  }

  public static parse_msg(dat: ArrayBuffer): Message | undefined {
    const dw = new DataView(dat, 0);
    const timestamp = dw.getUint32(0, true);
    const filter = dw.getUint8(4);
    const channel = dw.getUint8(5);
    const col1 = dw.getUint8(8);
    if (col1 != 0x1f) return;
    let col2 = -1;
    for (let i = 9; i < dat.byteLength; i++) {
      const element = dw.getUint8(i);
      if (element == 0x02) {
        const payloadLen = dw.getInt8(i + 2);
        i += 2 + payloadLen;
        continue;
      }
      if (element == 0x1f) {
        col2 = i;
        break;
      }
    }
    if (col2 < 9) return;

    let sender = new TokenText([]);
    if (col2 > 9) {
      sender = this.parse_token_text(dat.slice(9, col2));
    }

    const text = this.parse_token_text(dat.slice(col2 + 1));
    return new Message(timestamp, filter, channel, sender, text);
  }

  static parse_token_text(dat: ArrayBuffer): TokenText {
    const dw = new DataView(dat, 0);
    const decoder = new TextDecoder("utf-8");

    const items = [];
    let beg = 0;
    for (let i = beg; i < dat.byteLength; i++) {
      const byte = dw.getUint8(i);
      if (byte == 2) {
        // save last
        if (i > beg) {
          items.push(TokenItem.FromText(decoder.decode(dat.slice(beg, i))));
        }

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

export function decodeNumber(buffer: ArrayBuffer): number {
  const dw = new DataView(buffer);
  let number = 0;
  const first = dw.getUint8(0);
  if (first <= 0xcf) return first - 1;

  let offset = 1;
  if (first & 0xf0) {
    const bit = (first & 0x0f) + 1;
    for (let i = 3; i >= 0; i--) {
      if (bit & (1 << i)) {
        number += dw.getUint8(offset++) << (i * 8);
      }
    }
    return number;
  }
  return -1;
}

export function decodeNumberGroup(buffer: ArrayBuffer, len: number): number[] {
  const dw = new DataView(buffer);
  let result = [];
  let offset = 0;
  for (let i = 0; i < len; i++) {
    const first = dw.getUint8(offset++);
    if (first <= 0xcf) {
      result.push(first - 1);
      continue;
    }

    if (first & 0xf0) {
      let number = 0;
      const bit = (first & 0x0f) + 1;
      for (let i = 3; i >= 0; i--) {
        if (bit & (1 << i)) {
          number += dw.getUint8(offset++) << (i * 8);
        }
      }
      result.push(number);
    } else {
      result.push(- 1);
    }
  }

  return result;
}

export function decodeNumberLen(buffer: ArrayBuffer): number {
  const dw = new DataView(buffer);
  const first = dw.getUint8(0);
  if (first <= 0xcf) return 1;
  if (first & 0xf0) {
    const bit = (first & 0x0f) + 1;
    let cnt = 0;
    for (let i = 0; i < 4; i++) {
      if (bit & (1 << i)) cnt++;
    }
    return cnt + 1;
  }
  return 1;
}
