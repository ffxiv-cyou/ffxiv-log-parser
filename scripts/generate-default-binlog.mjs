import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const encoder = new TextEncoder();

const token = {
  text: (value) => ({ kind: "text", value }),
  autoTranslate: (...params) => ({ kind: "autoTranslate", params }),
  styleFront: (value) => ({ kind: "styleFront", params: [value] }),
  styleBack: (value) => ({ kind: "styleBack", params: [value] }),
  link: (...params) => ({ kind: "link", params }),
};

const DEFAULT_TIMESTAMP = 0;
const DEFAULT_FILTER = 57;
const DEFAULT_CHANNEL = 0;

const messages = [
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [token.autoTranslate(3, 201)],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [
      token.text("本工具用于解析日志中的聊天框信息，当前支持"),
      token.styleFront(549),
      token.styleBack(550),
      token.text("游戏日志"),
      token.styleBack(0),
      token.styleFront(0),
      token.text("与"),
      token.styleFront(549),
      token.styleBack(550),
      token.text("ACT日志"),
      token.styleBack(0),
      token.styleFront(0),
      token.text("两种文件。"),
    ],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [
      token.styleFront(549),
      token.styleBack(550),
      token.text("游戏日志"),
      token.styleBack(0),
      token.styleFront(0),
      token.text("的优点是不需要使用第三方插件，且显示效果好；缺点是日志是非实时写出的，且每次登录后都会被从头开始覆盖。"),
    ],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [
      token.styleFront(549),
      token.styleBack(550),
      token.text("游戏日志"),
      token.styleBack(0),
      token.styleFront(0),
      token.text("存放于 "),
      token.styleFront(549),
      token.styleBack(550),
      token.link(0xff),
      token.styleFront(500),
      token.styleBack(501),
      token.text(""),
      token.styleBack(0),
      token.styleFront(0),
      token.text("[游戏安装目录]/game/My Games/FINAL FANTASY XIV - A Realm Reborn/FFXIV_xxxxxxxxxxxxxxxx/log"),
      token.link(0xce),
      token.styleBack(0),
      token.styleFront(0),
      token.text("目录下"),
    ],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [
      token.styleFront(549),
      token.styleBack(550),
      token.text("ACT日志"),
      token.styleBack(0),
      token.styleFront(0),
      token.text("的优点是日志持久性好，缺点是无法显示特殊效果。"),
    ],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [
      token.styleFront(549),
      token.styleBack(550),
      token.text("ACT日志"),
      token.styleBack(0),
      token.styleFront(0),
      token.text("存放于\n"),
      token.text("(FFCafe整合版)"),
      token.styleFront(549),
      token.styleBack(550),
      token.link(0xff),
      token.styleFront(500),
      token.styleBack(501),
      token.text(""),
      token.styleBack(0),
      token.styleFront(0),
      token.text("[ACT目录]/AppData/Advanced Combat Tracker/FFXIVLogs"),
      token.link(0xce),
      token.styleBack(0),
      token.styleFront(0),
      token.text("目录下，或\n"),
      token.text("(呆萌整合版)"),
      token.styleFront(549),
      token.styleBack(550),
      token.link(0xff),
      token.styleFront(500),
      token.styleBack(501),
      token.text(""),
      token.styleBack(0),
      token.styleFront(0),
      token.text("[ACT目录]/FFXIVLogs"),
      token.link(0xce),
      token.styleBack(0),
      token.styleFront(0),
      token.text("目录下"),
    ],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [token.text("你也可以同时选择多个日志文件用于解析。")],
  },
  {
    timestamp: DEFAULT_TIMESTAMP,
    filter: DEFAULT_FILTER,
    channel: DEFAULT_CHANNEL,
    sender: [],
    text: [token.text("解析操作运行在本地，你的日志信息不会被上传。")],
  },
];

function encodeNumber(value) {
  if (value < 0) throw new Error("Negative numbers are not supported");
  if (value <= 0xce) return [value + 1];
  if (value <= 0xff) return [0xf0, value];
  if (value <= 0xffff) return [0xf2, (value >> 8) & 0xff, value & 0xff];
  if (value <= 0xffffff)
    return [
      0xf6,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff,
    ];
  return [
    0xfe,
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

function encodeNumberGroup(values) {
  return values.flatMap((value) => encodeNumber(value));
}

function encodeCommand(cmd, payload) {
  return [0x02, cmd, payload.length + 1, ...payload, 0x03];
}

function encodeToken(tokenItem) {
  switch (tokenItem.kind) {
    case "text":
      return Array.from(encoder.encode(tokenItem.value));
    case "autoTranslate":
      return encodeCommand(0x2e, encodeNumberGroup(tokenItem.params));
    case "styleFront":
      return encodeCommand(0x48, encodeNumber(tokenItem.params[0]));
    case "styleBack":
      return encodeCommand(0x49, encodeNumber(tokenItem.params[0]));
    case "link":
      return encodeCommand(0x27, encodeNumberGroup(tokenItem.params));
    default:
      throw new Error(`Unsupported token kind: ${tokenItem.kind}`);
  }
}

function encodeTokenText(tokenText) {
  return tokenText.flatMap((item) => encodeToken(item));
}

function encodeMessage(message) {
  const senderBytes = encodeTokenText(message.sender);
  const textBytes = encodeTokenText(message.text);
  const bytes = [];
  const timestamp = message.timestamp >>> 0;
  bytes.push(timestamp & 0xff);
  bytes.push((timestamp >> 8) & 0xff);
  bytes.push((timestamp >> 16) & 0xff);
  bytes.push((timestamp >> 24) & 0xff);
  bytes.push(message.filter & 0xff);
  bytes.push(message.channel & 0xff);
  bytes.push(0x00);
  bytes.push(0x00);
  bytes.push(0x1f);
  bytes.push(...senderBytes);
  bytes.push(0x1f);
  bytes.push(...textBytes);
  return Uint8Array.from(bytes);
}

function buildBinLog(messageList) {
  const encodedMessages = messageList.map((msg) => encodeMessage(msg));
  const bodyLength = encodedMessages.reduce((sum, buf) => sum + buf.length, 0);
  const messageCount = encodedMessages.length;
  const fileLength = bodyLength + messageCount;
  const headerSize = 8 + messageCount * 4;
  const buffer = new Uint8Array(headerSize + bodyLength);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, bodyLength, true);
  view.setUint32(4, fileLength, true);

  let offset = 8;
  let acc = 0;
  for (let i = 0; i < messageCount; i++) {
    acc += encodedMessages[i].length;
    view.setUint32(offset, acc, true);
    offset += 4;
  }

  let bodyOffset = headerSize;
  for (const chunk of encodedMessages) {
    buffer.set(chunk, bodyOffset);
    bodyOffset += chunk.length;
  }

  return buffer;
}

const binlog = buildBinLog(messages);
const base64 = Buffer.from(binlog).toString("base64");

const outputDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(outputDir, "../src/assets/default_messages.binlog.b64");
writeFileSync(outputPath, base64 + "\n");
console.log(`Wrote ${binlog.length} bytes to ${outputPath}`);
