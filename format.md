
The chat log is a memory dump of the internal text table when it rolls off. It takes 1000 lines to roll off and only when this roll off occurs is the log dumped to the file. So, the log is not "live" and if you log off you lose everything in memory (they are not written out). So defeats the purpose of building an app around the logs.

Either way, I wrote an audio trigger app during beta (chatmon 2), that I currently only distro between my fc. Here is what I discovered about the chat line, which I will share here.

delimited by 3 colons: STAMPCHANNEL:SENDER:TEXT

sender can be empty

- TIMESTAMP = first 8 hex characters (4 bytes)
- Filter = 9th byte
- Channel = 10th byte

```
51C4A21C0839::Player joins the party.
51C4A242000C: tell TO Player
51C4A6B5000D: tell from Player
51C4A23B000B: [02 27 05 01 01 01 01 03] Player [02 27 05 CF 01 01 01 03] :anyone got visual on goblin muggers and coords ?

51C686B7103E:: [02 27 05 01 01 01 01 03] Player [02 27 05 CF 01 01 01 03] successfully converts the [02 13 06 FE FF F3 F3 F3 03]decorated bone staff [02 13 02 EC 03] into an [02 13 06 FE FF F3 F3 F3 03] ice materia I [02 13 02 EC 03].
```

filter = where it was sourced from (other, party, system, etc), and channel is the type

// 参考 LogFilter.csv
Known channels: 
- 03 - motd / server announcements
- 0A - say
- 0B - shout
- 0C - outgoing tell
- 0D - incoming tell
- 0E - party
- 0F - 团队频道
- 10 - linkshell
- 18 - Free company
- 1B - 新人频道
- 1C - 自定义情感表情
- 1D - Emote
- 1E - Yell
- 29 - Incoming Damage
- 2A - Incoming Miss / No effect / Resist
- 2B - Player/Enemy finished using/casting ability 
- 2C - Player uses food (or item?) 
- 2D - -> Player recovers HP. 
- 2E - Player loses/gains <buff> 
- 2F - Player/Enemy suffers from <effect> 
- 30 - 状态效果消失（玩家本身的）
- 31 - 状态效果消失（Boss给的）
- 38 - Echo 
- 39 - Notification 
  EX: 
  - item equipped 
  - instance has ended 
  - area is no longer sealed 
  - You have entered a sanctuary. 
  - // you sell an item 
  - // party leader registered for duty 
  - // item put in armory 
  - // loot list updated 
  - // joined party 
  - // quest accepted 
- 3A - You/other defeats/is defeated 
- 3B - 采集相关消息
  - 无法继续感知传说的矿脉……
  - 在东南感知到了70级的传说的矿脉
  - 采集地点的特殊效果发动，得到了影响采集次数/耐久的效果！
  - 矿脉的作业次数恢复了1次
- 3C - Error 
  - EX: cannot change gear, cannot send tell in when in duty 
- 3D - NPC Chat 
- 3E - You/Other obtains/converts an item 
- 40 - You/other gain exp/level 
- 41 - You/Other rolls on an item 
- 42 - 制作相关消息
  - 精制魔晶石！获得了xxx
  - 开始制作
  - 取出了材料
  - 发动“坯料制作”
  - 作业进展了
- 43 - 采集相关消息
  - 开始了采掘作业
  - 结束了采掘作业
  - 传说的矿脉从眼前消失了……
  - 成功钓上了
  - 获得了
- 44 - NPC 对话
- 45 - Player has logged in/out 
- 46 - 部队成员上下线
- 48 - 当前共有244个队伍正在招募队员，其中有244个队伍符合搜索条件
- 49 - 标注了“禁止2”标记
- 4b - 达到人数上限，无法加入新人频道 / 加入了新人频道。
- A9 - Outgoing Damage 
- AA - Outgoing Miss / No effect / Resist 
- AB - Player/Enemy readies/casting ability 
- AC - 使用物品（如武器箱子、幻卡、金碟优待券等）
- AD - HP/MP 恢复（对自身）
- AE - -> You/Other gain/lose the effect of <buff>. 
- AF - -> You/Enemy suffers from <effect> 
- B0 - 自身 Buff 消失
- B1 - 敌方 Buff 消失
- B9 - 任务相关
  - 交纳19,800张军票，获得了
  - 接受了任务
  - 完成了任务
  - 陆行鸟离开了
- BA - Player/Enemy defeated
- BE - 获得物品
  - 幻卡、金碟币、双色物品交换
- C2 - 制作相关
  - 在制作笔记中记下了XXX的制作记录
  - 开始制作
  - 制作成功

Tokens aka "garbage":

- byte 1 is the header [02]
- byte 2 is the type
  - 0x27 = name
  - 0x13 = color change. payload: [?? ?? RED GRN BLU 03]
  - 0x2E = auto translate
- byte 3 is the size of the remaining payload, including terminator [03]

- [02 27 05 01 01 01 01 03] name start
- [02 27 05 CF 01 01 01 03] name end
- [02 13 06 FE FF F3 F3 F3 03] item start (white) color = F3F3F3
- [02 13 06 FE FF FA 89 B6 03] item start (purple) color = FA89B6
- [02 13 02 EC 03] item end (reset)
- [02 2E 05 09 F2 03 CE 03] translate: (Roegadyn)
- [02 2E 05 0A F2 05 10 03] translate: (/disappointed)

Text is UTF-8 encoded:

- [EE 80 BC] U+E03C - little materia symbol at end of "attaches" message
- [EE 81 AF] U+E06F - litte -> arrow next to battles stuff


## Token 类型

- 0x12: 图标
  - 4f: 皇冠
  - 4e: 豆芽
  - 51: 锤子
  - 59: 跨服的花
  - 60: 豆花
- 0x27: 链接到目标
  - 玩家: 0x01
    - [01 11 f2 04 52 01 ff 07 e5 a4 9c e6 a9 98] 类型1，同一小队
    - [01 02 f2 04 13 01 ff 0a e9 99 86 e6 b5 b7 e7 a9 ba]，类型4，新频
    - [01 04 f2 04 13 01 ff 0d e6 9c 88 e8 af ba e7 ba a4 e8 a8 80] 类型5
    - [01 11 f2 04 91 01 ff 13 e9 ad 94 e6 b5 81 e5 89 91 e9 a3 8e e4 b9 8b e7 97 95] 类型2，同一小队
    - [01 02 f2 04 13 01 ff 13 e6 a0 96 e4 b9 8c e4 b8 8d e8 af ad e5 b9 bd e6 a0 91] 类型3，新频

    - [01 01 01 01 ff 10 e6 ad aa e6 ac a7 e7 90 b3 e5 85 88 e7 94 9f]
    - [01 01 f2 04 13 01 ff 10 e6 ad aa e6 ac a7 e7 90 b3 e5 85 88 e7 94 9f] 同一个人

    - [01 01 f2 04 13 02 ff 0a e5 a4 a7 e5 b0 be e5 b7 b4]
    - [01 01 01 01 ff 0a e5 a4 a7 e5 b0 be e5 b7 b4] 同一个人
    
  - 物品: 0x03 
    - [03 f2 16 c1 02 01]: // 16c1 = 物品 ID
    - [03 13 02 01]: // 雷之晶簇(18, 0x12)
    - [03 f6 0f d3 e0 02 01]: // 艾布拉纳赛黄晶 HQ. 0xd3e0 = 物品ID + 0x4240?
  - 地图: 0x04
    - [04 fe 03 bd 02 b8 fe ff f6 48 c6 f6 0c aa 76 ff 01] // 萨维奈岛(0x02b8) 3x () ( 8.7 , 38.0 )
    - [04 fe 03 32 01 f0 fe ff fc 1d 61 fe ff fe d2 05 ff 01] // 黑风海 ( 16.3 , 19.9 ) Z:-2.8
  - 成就: 0x06
    - [06 f2 03 44 01 01 ff 0e e5 8f 8c e8 9b 87 e5 87 b6 e7 8b bc 34] // 双蛇凶狼4
    - [06 f2 05 bb 01 01 ff 17 e5 91 bc e5 94 a4 e8 83 9c e5 88 a9 e7 9a 84 e5 8c bb e5 b8 88 31] // 呼唤胜利的医师1
    - [06 f2 09 85 01 01 ff 0e e6 a2 a6 e5 9b ad e4 bb 99 e5 ad 90 32] // 梦园仙子2

  - 招募板: 0x08
    - [08 01 01 01 ff 01]
  - Buff: 0x09
    - [9 f2 4 b4 1 1 ff 2 20] // 醒梦
    - [9 f2 4 a9 1 1 ff 2 20] // 雪仇
  - 队员招募: 0x0a
    - [0a f6 02 e0 e6 01 f3 01]
  - 结束Tag：0xCF
    - [cf 1 1 1 ff 1]
- 0x2E: 定型文
  - 参考对应关系: [Github gist](https://gist.github.com/3735943886/fe5ac8012ffe37c9dfa180b1944b513c)
  = 对应数据表: Completion.csv
  - 第一个Byte是组别
  - 第二个Byte开始是压缩数据格式。
    - 若为 0x01-0xCF，则数据为此数据 - 1
    - 若为 0xF0，则说明后面跟着一个Byte，其值为数据实际值
    - 若为 0xF1, 则说明后面跟着一个Byte，其值为数据实际值 / 256
    - 若为 0xF2，则说明后面跟着2个Byte，其值为数据实际值
    - 若为 0xF6，则说明后面跟着3个Byte，其值为数据实际值
- 0x48: 像是样式设定
  - [f2 01 f4] 链接图标参数(橙色) 
  - [f2 02 25] 普通物体（看上去像是白色）
  - [f2 02 27] 绿色装备
  - [f2 02 29] 蓝色装备
  - [f2 02 05] Buff 图标（蓝色） 
  - [f2 02 06] Debuff 图标 （红色）
  - [f2 02 3b] 量谱
  - [01] 重置样式
  - 看上去是 UIColor.csv 这个表的颜色
- 0x49: 像是样式设定
  - [f2 01 f5] 链接图标参数 (橙色) 
  - [f2 02 26] 部分物体链接前也可见参数（看上去像是白色）
  - [f2 02 28] 绿色装备
  - [f2 02 2a] 蓝色装备
  - [f2 02 3c] 量谱
  - [01] 重置样式
  - 看上去是 UIColor.csv 这个表的颜色

```
2 48 4 f2 2 25 3
2 49 4 f2 2 26 3
2 27 7 3 f2 16 c1 2 1 3 // 16c1 = 物品 ID
2 48 4 f2 1 f4 3
2 49 4 f2 1 f5 3

ee 82 bb // U+E0BB, 链接图标字符

2 49 2 1 3
2 48 2 1 3

e4 ba 9a e6 8b 89 e6 88 88 e9 93 b6 e5 b8 81 // 亚拉戈银币

2 27 7 cf 1 1 1 ff 1 3
2 49 2 1 3
2 48 2 1 3


e2 80 9d c3 97 38 e3 80 82 // "x8。

```