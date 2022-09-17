<template>
  <div>
    <div>
      <form class="pure-form">
        <fieldset>
          <div class="pure-g">
            <div class="pure-u-1-2 pure-u-md-1-3">
              <legend>
                选择日志文件
                <span
                  aria-label="支持ACT日志与游戏日志"
                  data-microtip-position="right"
                  role="tooltip"
                  >(?)</span
                >
              </legend>
              <input
                ref="file"
                type="file"
                accept=".log"
                placeholder="ACT"
                multiple
                @change="parse"
              />
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
      <Message
        v-for="(item, index) in filterMessages"
        :key="index"
        class="message-item"
        :msg="item"
        :long-time="longTime"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Message } from "@/model/message";
import { Component, Ref, Vue } from "vue-facing-decorator";
import { BinLogParser } from "../model/binlog_parser";
import { ActLogParser } from "../model/actlog_parser";
import MessageComponent from "@/component/Message.vue";
import FilterSetting from "@/component/FilterSetting.vue";
import "microtip/microtip.css";

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

  messages: Message[] = [
    Message.SimpleText(10, "", "欢迎使用 FFXIV 日志解析工具，请选择日志文件。"),
    Message.SimpleText(10, "", "当前支持 ACT 日志与游戏日志两种文件"),
    Message.SimpleText(10, "", "ACT日志存放于: \n(咖啡) [ACT目录]/AppData/Advanced Combat Tracker/FFXIVLogs \n(呆萌) [ACT目录]/FFXIVLogs "),
    Message.SimpleText(10, "", "游戏日志存放于: [游戏安装目录]/game/My Games/FINAL FANTASY XIV - A Realm Reborn/FFXIV_xxxxxxxxxxxxxxxx/log"),
    Message.SimpleText(10, "", "请查阅帮助页面了解两种日志的区别与限制"),
  ];
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
}
</script>

<style scoped>
.message-list {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  margin-bottom: 20px;
}
</style>
