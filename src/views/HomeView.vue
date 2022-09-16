<template>
  <div>
    <div>
      <form class="pure-form">
        <fieldset>
          <div class="pure-g">
            <div class="pure-u-1-3">
              <legend>选择日志文件</legend>
              <input ref="file" type="file" accept=".log" placeholder="ACT" multiple />
              <a @click="parse" class="pure-button pure-button-primary">解析</a>
            </div>
            <div class="pure-u-1-3">
              <legend>设置</legend>
              <label for="show-long-time">
                <input type="checkbox" id="show-long-time" v-model="longTime"/>
                显示消息日期
              </label>
              <a @click="toggleFilter" class="pure-button">消息过滤设置</a>
            </div>
          </div>
        </fieldset>
      </form>
      <FilterSetting ref="filterPanel" :filter="filter" />
    </div>

    <div class="message-list">
      <Message class="message-item" v-for="(item, index) in filterMessages" :msg="item" :longTime="longTime" />
    </div>
  </div>
</template>

<script lang="ts">
import { Message } from '@/model/message';
import { Component, Ref, Vue } from 'vue-facing-decorator'
import { BinLogParser } from '../model/binlog_parser'
import MessageComponent from '@/component/Message.vue';
import FilterSetting from '@/component/FilterSetting.vue';
import { initTooltip } from '@thewakingsands/kit-tooltip';

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
    Message.Text(new Date().getTime() / 1000, 57, 0, "", "请载入文件")
  ];
  filter = new Map<number, boolean>();

  get filterMessages(): Message[] {
    return this.messages.filter((x) => this.filter.get(x.filter) === true);
  }

  longTime = false;

  parseFile(file: File): Promise<ArrayBuffer> {
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
  }

  public async parse() {
    if (this.file.files !== null) {
      const parser = new BinLogParser();

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
        const buffer = await this.parseFile(file);
        this.messages.push(...parser.parse(buffer));
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
}
</style>