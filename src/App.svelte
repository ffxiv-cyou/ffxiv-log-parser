<script lang="ts">
  import { Message } from "@/model/message";
  import { BinLogParser } from "@/model/binlog_parser";
  import { ActLogParser } from "@/model/actlog_parser";
  import MessageComponent from "@/component/Message.svelte";
  import FilterSetting from "@/component/FilterSetting.svelte";
  import defaultMessagesBinlog from "@/assets/default_messages.binlog.b64?raw";
  import("@/model/auto_translate");

  let file!: HTMLInputElement;
  let filterPanel!: FilterSetting;

  const defaultBinlogBase64 = defaultMessagesBinlog.trim();
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function loadDefaultMessages(): Message[] {
    const buffer = base64ToArrayBuffer(defaultBinlogBase64);
    const parsed = BinLogParser.parse(buffer);
    const now = new Date().getTime() / 1000;
    return parsed.map(
      (msg) => new Message(now, msg.filter, msg.channel, msg.sender, msg.text),
    );
  }

  let messages: Message[] = $state(loadDefaultMessages());
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
