# ffxiv-log-parser

FFXIV 日志解析工具

用于从 FFXIV 的日志中解析出聊天记录或其他信息。

当前支持以下两种日志：

- 游戏日志
- ACT 日志

## 游戏日志

存放于 `My Games/FINAL FANTASY XIV - A Realm Reborn/FFXIV_CHRxxxxxxxxxxxxxxxx/log` 目录下，是游戏自动生成的日志。

优点：
- 不需要使用第三方插件
- 完整的特殊格式支持，包括
  - 定型文支持
  - 物品独立高亮颜色
  - 等等

缺点：
- 此日志是非实时写出的，通常要超过1000行后才会写出
- 每次登录游戏后，此日志都会被从头开始覆盖。

日志格式请参见 format.md

## ACT 日志

存放于 ACT 目录下的 `FFXIVLogs` 文件夹，是 FFXIV ACT 插件生成的日志。

优点：
- 数据持久存储，不会被覆盖

缺点：
- 日志为纯文本，没有特殊格式的支持
