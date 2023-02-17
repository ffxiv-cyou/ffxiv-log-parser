import { decodeNumber, decodeNumberGroup, decodeNumberLen } from "./binlog_parser";

export class Message {
  time: Date;
  filter: number;
  channel: number;
  sender: TokenText;
  text: TokenText;

  constructor(
    timestamp: number,
    filter: number,
    channel: number,
    sender: TokenText,
    text: TokenText
  ) {
    this.time = new Date(timestamp * 1000);
    this.filter = filter;
    this.channel = channel;
    this.sender = sender;
    this.text = text;
  }

  static Text(
    time: number,
    filter: number,
    channel: number,
    sender: string,
    text: string
  ) {
    return new Message(
      time,
      filter,
      channel,
      new TokenText([TokenItem.FromText(sender)]),
      new TokenText([TokenItem.FromText(text)])
    );
  }

  static SimpleText(filter: number, sender: string, text: string) {
    return this.Text(new Date().getTime() / 1000, filter, 0, sender, text);
  }
}

export enum TokenType {
  Text,
  Icon, // 0x12
  Color, // 0x13,
  Link, // 0x27
  AutoTranslate, // 0x27
  StyleFront, // 0x48
  StyleBack, // 0x49
  UnknownToken,
}

export class TokenItem {
  type: TokenType;
  param: number[];
  text: string;

  constructor(type: TokenType, param: number[], text: string) {
    this.type = type;
    this.param = param;
    this.text = text;
  }

  static FromText(text: string): TokenItem {
    return new TokenItem(TokenType.Text, [], text);
  }

  static FromToken(cmd: number, param: ArrayBuffer): TokenItem {
    switch (cmd) {
      case 0x12: // 图标
        const id = decodeNumber(param);
        return new TokenItem(TokenType.Icon, [id], "");
      case 0x13: // 设置颜色
        const rgba = decodeNumber(param);
        return new TokenItem(TokenType.Color, [rgba], "");
      case 0x27: // 链接到目标
        const targetType = decodeNumber(param);
        const subParam = param.slice(1);
        switch (targetType) {
          case 0x00: // 玩家
            return new TokenItem(TokenType.Link, [targetType], "");
          case 0x02: // 物品
            return new TokenItem(TokenType.Link, [targetType, decodeNumber(subParam)], "");
          case 0x03: // 地图
            return new TokenItem(TokenType.Link, [targetType, ...decodeNumberGroup(subParam, 3)], "");
          case 0x05: // 成就
            return new TokenItem(TokenType.Link, [targetType, decodeNumber(subParam)], "");
          case 0x07: // 招募板
            return new TokenItem(TokenType.Link, [targetType], "");
          case 0x08: // Buff
            return new TokenItem(TokenType.Link, [targetType, decodeNumber(subParam)], "");
          case 0x09: // 队员招募
            return new TokenItem(TokenType.Link, [targetType], "");
          case 0xce: // 结束
            return new TokenItem(TokenType.Link, [targetType], "");
          default:
            return new TokenItem(TokenType.Link, buf2num(param), "");
        }
      case 0x2e: // 定型文
        return new TokenItem(TokenType.AutoTranslate, decodeNumberGroup(param, 2), "");
      case 0x48: // 样式1
        return new TokenItem(TokenType.StyleFront, [decodeNumber(param)], "");
      case 0x49: // 样式2
        return new TokenItem(TokenType.StyleBack, [decodeNumber(param)], "");
      default:
        return new TokenItem(TokenType.UnknownToken, buf2num(param), "");
    }
  }

  public ToString(): string {
    switch (this.type) {
      case TokenType.Text:
        return this.text;
      default:
        return "[" + this.type + "|" + this.param.join(" ") + "]";
    }
  }

  public ToHtmlString(): string {
    switch (this.type) {
      case TokenType.Text:
        return this.text.replace("<", "&lt;").replace(">", "&gt;").replace(/\n/g, "<br>");
      case TokenType.Icon:
        return '<icon class="fonticon fonticon-' + this.param[0] + '"></icon>';
      case TokenType.Color:
        return "</span></span>"; // 忽略
      case TokenType.Link:
        switch (this.param[0]) {
          case 0x00: // 玩家
            return '<a class="link player">';
          case 0x02: // 物品
            let itemID = this.param[1];
            if (itemID > 1000000) itemID -= 1000000;
            return '<a class="link item" item-id="' + itemID + '">';
          case 0x03: // 地图
            return (
              '<a class="link map" map-id="' +
              (this.param[1] & 0xffff) +
              '" x="' +
              this.param[2] +
              '" y="' +
              this.param[3] +
              '">'
            );
          case 0x05: // 成就
            return (
              '<a class="link achievement" achievement-id="' +
              this.param[1] +
              '">'
            );

          case 0x07: // 招募板
            return '<a class="link party-finder">';
          case 0x08: // Buff
            return '<a class="link buff" buff-id="' + this.param[1] + '">';
          case 0x09: // 队员招募
            return '<a class="link party-f">';
          case 0xce: // 结束
            return "</a>";
          default:
            return (
              '<a class="link unknown" detail="' + this.param.join(" ") + '">'
            );
        }
      case TokenType.AutoTranslate:
        return (
          '<icon class="fonticon fonticon-54"></icon><auto-translate group="' +
          (this.param[0] - 1) +
          '" cid="' +
          this.param[1] +
          '"></auto-translate><icon class="fonticon fonticon-55"></icon>'
        );
      case TokenType.StyleFront:
        if (this.param[0] === 0) return "</span>";
        return '<span class="color1 palette-' + this.param[0] + '">';
      case TokenType.StyleBack:
        if (this.param[0] === 0) return "</span>";
        return '<span class="color2 palette-' + this.param[0] + '">';
      case TokenType.UnknownToken:
      default:
        return "[Unknown]";
    }
  }
}

export class TokenText {
  items: TokenItem[];

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

export function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => ("00" + x.toString(16)).slice(-2))
    .join(" ");
}

function buf2num(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
}