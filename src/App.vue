<template>
  <header>
    <div class="home-menu pure-menu pure-menu-horizontal">
      <a class="pure-menu-heading">FFXIV 日志解析工具</a>
      <div class="pure-menu-list">
        <input ref="file" type="file" accept=".log" placeholder="ACT" multiple @change="parse" />
      </div>
      <div class="pure-menu-list">
        <label for="show-long-time">
          <input id="show-long-time" v-model="longTime" type="checkbox" />
          显示日期
        </label>
        <button @click="toggleFilter">过滤设置</button>
      </div>
    </div>
  </header>

  <div class="container">
    <FilterSetting ref="filterPanel" :filter="filter" />
    <div class="message-list">
      <Message v-for="(item, index) in filterMessages" :key="index" class="message-item" :msg="item"
        :long-time="longTime" />
    </div>
  </div>
  <footer>
    &copy; 2022-{{ year }}
    <a href="https://ffxiv.cyou" target="_blank">狒狒西柚</a> | <a href="https://github.com/ffxiv-cyou/ffxiv-log-parser/"
      target="_blank">源代码</a> | ALL FINAL
    FANTASY XIV CONTENT IS PROPERTY OF SQUARE ENIX CO., LTD
</footer>
</template>

<script lang="ts">

import { Message, TokenText, TokenItem, TokenType } from "@/model/message";
import { Component, Ref, Vue } from "vue-facing-decorator";
import { BinLogParser } from "@/model/binlog_parser";
import { ActLogParser } from "@/model/actlog_parser";
import MessageComponent from "@/component/Message.vue";
import FilterSetting from "@/component/FilterSetting.vue";

import("@/model/auto_translate");
@Component({
  components: {
    Message: MessageComponent,
    FilterSetting: FilterSetting,
  },
})
export default class App extends Vue {
  @Ref
  readonly file!: HTMLInputElement;
  @Ref
  readonly filterPanel!: FilterSetting;

  messages: Message[] = [];
  filter = new Map<number, boolean>();

  get filterMessages(): Message[] {
    return this.messages.filter((x) => this.filter.get(x.filter) === true);
  }

  longTime = false;

  loadFile(file: File): Promise<ArrayBuffer> {
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

  toggleFilter() {
    this.filterPanel.show();
    return false;
  }

  public async parse() {
    if (this.file.files !== null) {
      const files = [];
      for (let i = 0; i < this.file.files.length; i++) {
        const file = this.file.files[i];
        files.push(file);
      }
      files.sort((a, b) => {
        return a.name > b.name ? 1 : a.name === b.name ? 0 : -1;
      });

      this.messages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = await this.loadFile(file);
        if (BinLogParser.validate(buffer))
          this.messages.push(...BinLogParser.parse(buffer));
        else if (ActLogParser.validate(buffer)) {
          this.messages.push(...ActLogParser.parse(buffer));
        } else {
          this.messages.push(
            Message.Text(
              new Date().getTime() / 1000,
              60,
              0,
              "",
              "文件格式不正确：" + file.name
            )
          );
        }
      }
    }
    return false;
  }

  mounted() {
    const now = new Date().getTime() / 1000;
    this.messages = [
      new Message(now, 57, 0, new TokenText([]), new TokenText([
        new TokenItem(TokenType.AutoTranslate, [3, 201], ""),
      ])),
      new Message(now, 57, 0, new TokenText([]), new TokenText([
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
      ])),
      new Message(now, 57, 0, new TokenText([]), new TokenText([
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("游戏日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("的优点是不需要使用第三方插件，且显示效果好；缺点是日志是非实时写出的，且每次登录后都会被从头开始覆盖。"),
      ])),
      new Message(now, 57, 0, new TokenText([]), new TokenText([
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
        TokenItem.FromText("[游戏安装目录]/game/My Games/FINAL FANTASY XIV - A Realm Reborn/FFXIV_xxxxxxxxxxxxxxxx/log"),
        new TokenItem(TokenType.Link, [0xce], ""),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("目录下"),
      ])),
      new Message(now, 57, 0, new TokenText([]), new TokenText([
        new TokenItem(TokenType.StyleFront, [549], ""),
        new TokenItem(TokenType.StyleBack, [550], ""),
        TokenItem.FromText("ACT日志"),
        new TokenItem(TokenType.StyleBack, [0], ""),
        new TokenItem(TokenType.StyleFront, [0], ""),
        TokenItem.FromText("的优点是日志持久性好，缺点是无法显示特殊效果。"),
      ])),
      new Message(now, 57, 0, new TokenText([]), new TokenText([
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
        TokenItem.FromText("[ACT目录]/AppData/Advanced Combat Tracker/FFXIVLogs"),
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
      ])),
      Message.SimpleText(57, "", "你也可以同时选择多个日志文件用于解析。"),
      Message.SimpleText(57, "", "解析操作运行在本地，你的日志信息不会被上传。")
    ];
  }
  get year() {
    return new Date().getFullYear();
  }
}
</script>

<style>
body {
  background: url("https://static.web.sdo.com/jijiamobile/pic/ff14/20211217patch6/media/scCg_9dJvPwFHLqfB6KBgwhh9o.jpg") fixed 50% 50%/cover;
}
.home-menu {
  background: #18181a;
  padding: 0.5em;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.5);
}

.home-menu {
  color: #bcbccc;
}

.home-menu .pure-menu-heading {
  color: #bcbccc;
  font-weight: 400;
  font-size: 120%;
}

.home-menu .pure-menu-item+.pure-menu-item {
  margin-left: 1em;
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
  background-color: rgba(0, 0, 0, 0.7);
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
