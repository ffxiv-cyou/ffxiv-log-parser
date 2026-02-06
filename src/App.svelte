<script lang="ts">
  import { Message, TokenText, TokenItem, TokenType } from "@/model/message";
  import { BinLogParser } from "@/model/binlog_parser";
  import { ActLogParser } from "@/model/actlog_parser";
  import MessageComponent from "@/component/Message.svelte";
  import FilterSetting from "@/component/FilterSetting.svelte";
  import("@/model/auto_translate");

  let file!: HTMLInputElement;
  let filterPanel!: FilterSetting;

  let messages: Message[] = $state([]);
  let filter = new Map<number, boolean>();

  let filterMessages = $derived(
    messages.filter((x) => filter.get(x.filter) === true),
  );

  let longTime = $state(false);

  function loadFile(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (evt) => {
        if (evt.target !== null) resolve(evt.target.result as ArrayBuffer);
        else reject("empty return");
      };
      reader.onerror = reject;
    });
  }

  function toggleFilter() {
    filterPanel.show();
    return false;
  }

  async function parse() {
    if (file.files !== null) {
      const files = [];
      for (let i = 0; i < file.files.length; i++) {
        files.push(file.files[i]);
      }
      files.sort((a, b) => {
        return a.name > b.name ? 1 : a.name === b.name ? 0 : -1;
      });

      messages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = await loadFile(file);
        if (BinLogParser.validate(buffer))
          messages = messages.concat(BinLogParser.parse(buffer));
        else if (ActLogParser.validate(buffer)) {
          messages = messages.concat(ActLogParser.parse(buffer));
        } else {
          messages.push(
            Message.Text(
              new Date().getTime() / 1000,
              60,
              0,
              "",
              "文件格式不正确：" + file.name,
            ),
          );
        }
      }
    }
    return false;
  }

  const now = new Date().getTime() / 1000;
  messages = [
    new Message(
      now,
      57,
      0,
      new TokenText([]),
      new TokenText([new TokenItem(TokenType.AutoTranslate, [3, 201], "")]),
    ),
    new Message(
      now,
      57,
      0,
      new TokenText([]),
      new TokenText([
        TokenItem.FromText("本工具用于解析日志中的聊天框信息，当前支持"),
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("游戏日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("与"),
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("ACT日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("两种文件。"),
      ]),
    ),
    new Message(
      now,
      57,
      0,
      new TokenText([]),
      new TokenText([
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("游戏日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText(
          "的优点是不需要使用第三方插件，且显示效果好；缺点是日志是非实时写出的，且每次登录后都会被从头开始覆盖。",
        ),
      ]),
    ),
    new Message(
      now,
      57,
      0,
      new TokenText([]),
      new TokenText([
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("游戏日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("存放于 "),
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        new TokenItem(TokenType.Link, [0xff], ""),
        new TokenItem(TokenType.StyleFront, [500], ""),
        new TokenItem(TokenType.StyleBack, [501], ""),
        TokenItem.FromText(""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText(
          "[游戏安装目录]/game/My Games/FINAL FANTASY XIV - A Realm Reborn/FFXIV_xxxxxxxxxxxxxxxx/log",
        ),
        new TokenItem(TokenType.Link, [0xce], ""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("目录下"),
      ]),
    ),
    new Message(
      now,
      57,
      0,
      new TokenText([]),
      new TokenText([
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("ACT日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("的优点是日志持久性好，缺点是无法显示特殊效果。"),
      ]),
    ),
    new Message(
      now,
      57,
      0,
      new TokenText([]),
      new TokenText([
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("ACT日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("存放于\n"),
        TokenItem.FromText("(FFCafe整合版)"),
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        new TokenItem(TokenType.Link, [0xff], ""),
        new TokenItem(TokenType.StyleFront, [500], ""),
        new TokenItem(TokenType.StyleBack, [501], ""),
        TokenItem.FromText(""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText(
          "[ACT目录]/AppData/Advanced Combat Tracker/FFXIVLogs",
        ),
        new TokenItem(TokenType.Link, [0xce], ""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("目录下，或\n"),
        TokenItem.FromText("(呆萌整合版)"),
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        new TokenItem(TokenType.Link, [0xff], ""),
        new TokenItem(TokenType.StyleFront, [500], ""),
        new TokenItem(TokenType.StyleBack, [501], ""),
        TokenItem.FromText(""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("[ACT目录]/FFXIVLogs"),
        new TokenItem(TokenType.Link, [0xce], ""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("目录下"),
      ]),
    ),
    Message.SimpleText(57, "", "你也可以同时选择多个日志文件用于解析。"),
    Message.SimpleText(57, "", "解析操作运行在本地，你的日志信息不会被上传。"),
  ];

  let year = new Date().getFullYear();
</script>

<svelte:head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-MEMN364SMZ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-MEMN364SMZ');
  </script>
</svelte:head>

<header>
  <div class="home-menu pure-menu pure-menu-horizontal">
    <span class="pure-menu-heading">FFXIV 日志解析工具</span>
    <div class="pure-menu-list">
      <input
        bind:this={file}
        type="file"
        accept=".log"
        placeholder="ACT"
        multiple
        onchange={parse}
      />
    </div>
    <div class="pure-menu-list">
      <label for="show-long-time">
        <input id="show-long-time" bind:checked={longTime} type="checkbox" />
        显示日期
      </label>
      <button onclick={toggleFilter}>过滤设置</button>
    </div>
  </div>
</header>

<div class="container">
  <FilterSetting bind:this={filterPanel} {filter} />
  <div class="message-list">
    {#each filterMessages as item}
      <MessageComponent msg={item} {longTime} />
    {/each}
  </div>
</div>
<footer>
  &copy; 2022-{ year }
  <a href="https://ffxiv.cyou" target="_blank">狒狒西柚</a> |
  <a href="https://github.com/ffxiv-cyou/ffxiv-log-parser/" target="_blank"
    >源代码</a
  > | ALL FINAL FANTASY XIV CONTENT IS PROPERTY OF SQUARE ENIX CO., LTD
</footer>

<style>
  :global(body) {
    background: url("https://static.web.sdo.com/jijiamobile/pic/ff14/20240927dawntrail/patch70/images/GanCtqM08pr--cxI4qfpOkqLGg.jpg")
      fixed 50% 50% / cover;
  }
  .home-menu {
    background: #18181a;
    padding: 0.5em;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.5);
    user-select: none;
  }

  .home-menu {
    color: #bcbccc;
  }

  .home-menu .pure-menu-heading {
    color: #bcbccc;
    font-weight: 400;
    font-size: 120%;
  }

  .home-menu .pure-menu-list {
    display: inline-block;
    vertical-align: middle;
  }

  header,
  .home-menu {
    height: 60px;
  }

  .container {
    margin: auto;
    min-height: calc(100vh - 60px - 50px);
    background-color: rgba(0, 0, 0, 0.6);
    padding: 10px 20px;
  }

  footer {
    font-size: 14px;
    line-height: 20px;
    padding: 5px 0 5px 10px;
    background: #18181a;
    color: #bcbccc;
  }

  footer a {
    text-decoration: none;
    color: #bcbccc;
  }
</style>
