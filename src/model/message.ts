import { decodeNumber, decodeNumberLen } from "./binlog_parser";

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

    static Text(time: number, filter: number, channel: number, sender: string, text: string) {
        return new Message(time, filter, channel,
            new TokenText([TokenItem.FromText(sender)]),
            new TokenText([TokenItem.FromText(text)]));
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

    public ToHtmlString(): string {
        switch (this.type) {
            case TokenType.Text:
                return this.text;
            case TokenType.Token:
                break;
            case TokenType.Unknown:
            default:
                return "[Unknown]";
        }

        switch (this.cmd) {
            case 0x12: // 图标
                const id = decodeNumber(this.param);
                return '<icon type="' + id + '" />';
            case 0x13: // 设置颜色
                return ''; // 忽略
            case 0x27: // 链接到目标
                const targetType = decodeNumber(this.param);
                switch (targetType) {
                    case 0x00: // 玩家
                        return '<a class="link player">';
                    case 0x02: // 物品
                        let itemID = decodeNumber(this.param.slice(1));
                        if (itemID > 1000000) itemID -= 1000000;
                        return '<a class="link item" item-id="' + itemID + '">'
                    case 0x03: // 地图
                        {
                            let offset = 1;
                            const tmID = decodeNumber(this.param.slice(offset));
                            offset += decodeNumberLen(this.param.slice(offset));
                            const xPos = decodeNumber(this.param.slice(offset));
                            offset += decodeNumberLen(this.param.slice(offset));
                            const yPos = decodeNumber(this.param.slice(offset));
                            offset += decodeNumberLen(this.param.slice(offset));

                            return '<a class="link map" map-id="' + (tmID & 0xFFFF) + '" x="' + xPos + '" y="' + yPos + '">'
                        }
                    case 0x05: // 成就
                        {
                            const achievementID = decodeNumber(this.param.slice(1));
                            return '<a class="link achievement" achievement-id="' + achievementID + '">';
                        }
                    case 0x07: // 招募板
                        return '<a class="link party-finder">';
                    case 0x08: // Buff
                        const buffID = decodeNumber(this.param.slice(1));
                        return '<a class="link buff" buff-id="' + buffID + '">';
                    case 0x09: // 队员招募
                        return '<a class="link party-f">';
                    case 0xce: // 结束
                        return '</a>'
                    default:
                        return '<a class="link unknown" detail="' + buf2hex(this.param) + '">'
                }
            case 0x2E: // 定型文
                const group = decodeNumber(this.param) + 1;
                const compID = decodeNumber(this.param.slice(decodeNumberLen(this.param)));
                return '<icon type="auto-trans-left" /><auto-translate group="' + group + '" cid="' + compID + '"></auto-translate><icon type="auto-trans-right" />';
            case 0x48: // 样式1
                const colorMap1 = decodeNumber(this.param);
                if (colorMap1 === 0) return '</span>';
                return '<span class="color1 plate-' + colorMap1 + '">';
            case 0x49: // 样式2
                const colorMap2 = decodeNumber(this.param);
                if (colorMap2 === 0) return '</span>';
                return '<span class="color2 plate-' + colorMap2 + '">';
            default:
                return this.ToString();
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

export function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => ('00' + x.toString(16)).slice(-2))
        .join(' ');
}
