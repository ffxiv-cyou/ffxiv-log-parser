<template>
  <div>
    <form class="pure-form">
      <fieldset>
        <legend>请选择你的日志文件</legend>
        <input ref="file" type="file" accept=".log" placeholder="ACT" multiple />
        <a @click="parse" class="pure-button pure-button-primary">处理</a>
      </fieldset>
      <FilterSetting :filter="filter"/>
    </form>
    <div class="message-list">
      <Message class="message-item" v-for="(item, index) in filterMessages" :msg="item" />
    </div>
  </div>
</template>

<script lang="ts">
import type { Message } from '@/model/message';
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

  messages: Message[] = [];
  filter = new Map<number, boolean>();

  get filterMessages(): Message[] {
    return this.messages.filter((x) => this.filter.get(x.filter) === true);
  }

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

  public async parse() {
    if (this.file.files !== null) {
      const parser = new BinLogParser();
      
      let files = [];
      for (let i = 0; i < this.file.files.length; i++) {
        const file = this.file.files[i];
        files.push(file);
      }
      files.sort((a, b) => {
          return a.name > b.name ? 1 : (a.name === b.name ? 0 : -1) ;
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

</style>