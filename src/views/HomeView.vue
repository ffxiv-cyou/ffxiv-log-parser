<template>
  <div>
    <div>
      <form class="pure-form">
        <fieldset>
          <div class="pure-g">
            <div class="pure-u-1-2 pure-u-md-1-3">
              <legend>
                选择日志文件
              </legend>
              <input ref="file" type="file" accept=".log" placeholder="ACT" multiple @change="parse" />
            </div>
            <div class="pure-u-1-2 pure-u-md-1-3">
              <legend>设置</legend>
              <label for="show-long-time">
                <input id="show-long-time" v-model="longTime" type="checkbox" />
                显示日期
              </label>
              <label for="show-filter-panel" @click="toggleFilter">
                <input id="show-filter-panel" type="checkbox" checked />
                过滤消息
              </label>
            </div>
          </div>
        </fieldset>
      </form>
      <FilterSetting ref="filterPanel" :filter="filter" />
    </div>

    <div class="message-list">
      <Message v-for="(item, index) in filterMessages" :key="index" class="message-item" :msg="item"
        :long-time="longTime" />
    </div>
  </div>
</template>

<script lang="ts">
import { Message, TokenText, TokenItem, TokenType } from "@/model/message";
import { Component, Ref, Vue } from "vue-facing-decorator";
import { BinLogParser } from "../model/binlog_parser";
import { ActLogParser } from "../model/actlog_parser";
import MessageComponent from "@/component/Message.vue";
import FilterSetting from "@/component/FilterSetting.vue";

import("@/model/auto_translate");

@Component({
  components: {
    Message: MessageComponent,
    FilterSetting: FilterSetting,
  },
})
export default class Home extends Vue {
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
}
</script>

<style scoped>
.message-list {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  margin-bottom: 20px;
}
</style>
