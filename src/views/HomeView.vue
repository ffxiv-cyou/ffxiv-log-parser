<template>
  <div>
    <div>
      <form class="pure-form">
        <fieldset>
          <div class="pure-g">
            <div class="pure-u-1 pure-u-md-1-3">
              <legend>
                选择日志文件
                <span
                  aria-label="支持ACT日志与游戏日志，详情请看帮助。"
                  data-microtip-position="right"
                  role="tooltip"
                >(?)</span>
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
            <div class="pure-u-1 pure-u-md-1-3">
              <legend>设置</legend>
              <label for="show-long-time">
                <input type="checkbox" id="show-long-time" v-model="longTime" />
                显示日期
              </label>
              <label for="show-filter-panel" @click="toggleFilter">
                <input type="checkbox" id="show-filter-panel" checked />
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
        class="message-item"
        v-for="(item, index) in filterMessages"
        :key="index"
        :msg="item"
        :longTime="longTime"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Message } from '@/model/message';
import { Component, Ref, Vue } from 'vue-facing-decorator'
import { BinLogParser } from '../model/binlog_parser'
import { ActLogParser } from '../model/actlog_parser'
import MessageComponent from '@/component/Message.vue';
import FilterSetting from '@/component/FilterSetting.vue';
import { initTooltip } from '@thewakingsands/kit-tooltip';
import 'microtip/microtip.css';

import("@/model/auto_translate");

@Component({
  components: {
    Message: MessageComponent,
    FilterSetting: FilterSetting
  }
})
export default class Home extends Vue {
  @Ref
  readonly file!: HTMLInputElement
  @Ref
  readonly filterPanel!: FilterSetting

  messages: Message[] = [
    Message.SimpleText(57, "", "欢迎使用 FFXIV 日志解析工具"),
    Message.SimpleText(57, "", "请选择日志文件"),
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
      }
      reader.onerror = reject;
    });
  }

  toggleFilter() {
    this.filterPanel.show();
    return false;
  }

  public async parse() {
    if (this.file.files !== null) {
      let files = [];
      for (let i = 0; i < this.file.files.length; i++) {
        const file = this.file.files[i];
        files.push(file);
      }
      files.sort((a, b) => {
        return a.name > b.name ? 1 : (a.name === b.name ? 0 : -1);
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
          this.messages.push(Message.Text(new Date().getTime() / 1000, 60, 0, "", "文件格式不正确：" + file.name))
        }
      }
    }
    return false;
  }

  mounted() {
    initTooltip({
      context: {
        apiBaseUrl: 'https://cafemaker.wakingsands.com',  // xivapi 或 cafemaker 的 url；最后不要有斜线
        iconBaseUrl: 'https://cafemaker.wakingsands.com/i', // 图标 cdn 的 url；最后不要有斜线
        defaultHq: false,  // 是否默认显示 HQ 数据
        hideSeCopyright: false, // 是否隐藏 SE 版权信息
      },
      links: {
        detectWikiLinks: true,  // 是否自动识别 wiki 物品链接
        itemIdAttribute: 'item-id', // 自定义悬浮窗时，声明物品 ID 的属性
        actionIdAttribute: 'action-id', // 自定义悬浮窗时，声明技能 ID 的属性
        rootContainer: document.body, // 监控的根元素
      },
    })
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