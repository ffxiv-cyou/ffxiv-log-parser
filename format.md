
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

Known channels: 
- 03 - motd / server announcements
- 0A - say
- 0B - shout
- 0C - outgoing tell
- 0D - incoming tell
- 0E - party
- 10 - linkshell
- 18 - Free company
- 1D - Emote
- 1E - Yell
- 29 - Incoming Damage
- 2A - Incoming Miss / No effect / Resist
- 2B - Player/Enemy finished using/casting ability 
- 2C - Player uses food (or item?) 
- 2D - -> Player recovers HP. 
- 2E - Player loses/gains <buff> 
- 2F - Player/Enemy suffers from <effect> 
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
- 3C - Error 
  - EX: cannot change gear, cannot send tell in when in duty 
- 3D - NPC Chat 
- 3E - You/Other obtains/converts an item 
- 40 - You/other gain exp/level 
- 41 - You/Other rolls on an item 
- 45 - Player has logged in/out 
- A9 - Outgoing Damage 
- AA - Outgoing Miss / No effect / Resist 
- AB - Player/Enemy readies/casting ability 
- AE - -> You/Other gain/lose the effect of <buff>. 
- AF - -> You/Enemy suffers from <effect> 
- BA - Player/Enemy defeated

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

- 12: 图标
  - 4f: 皇冠
  - 4e: 豆芽
  - 51: 锤子
  - 59: 跨服的花
  - 60: 豆花
- 27: 链接到目标
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
  - 招募板: 0x08
    - [08 01 01 01 ff 01]
  - Buff: 0x09
    - [9 f2 4 b4 1 1 ff 2 20] // 醒梦
    - [9 f2 4 a9 1 1 ff 2 20] // 雪仇
  - 结束Tag：0xCF
    - [cf 1 1 1 ff 1]

- 48:
  - 像是样式设定
  - 链接图标参数 [f2 01 f4]，部分物体链接前也可见参数 [f2 02 25]
  - Buff 图标 [f2 02 05], Debuff 图标 [f2 02 06]
  - 参数为1的时候应该是重置
- 49:
  - 像是样式设定
  - 链接图标参数 [f2 01 f5]，部分物体链接前也可见参数 [f2 02 26], [f2 02 2a]
  
  - 参数为1的时候应该是重置

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