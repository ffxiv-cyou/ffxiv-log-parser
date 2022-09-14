<template>
  <div>
    <form class="pure-form">
      <fieldset>
        <legend>请选择你的日志文件</legend>
        <input ref="file" type="file" accept=".log" placeholder="ACT" />
        <a @click="parse" class="pure-button pure-button-primary">处理</a>
      </fieldset>
    </form>
    <div class="message-list">
      <Message class="message-item" v-for="(item, index) in messages" :msg="item" />
    </div>
  </div>
</template>

<script lang="ts">
import type { Message } from '@/model/message';
import { Component, Ref, Vue } from 'vue-facing-decorator'
import { BinLogParser } from '../model/binlog_parser'
import MessageComponent from '@/component/Message.vue';
import { initTooltip } from '@thewakingsands/kit-tooltip';

@Component({
  components: {
    Message: MessageComponent
  }
})
export default class Home extends Vue {
  @Ref
  readonly file!: HTMLInputElement

  messages: Message[] = [];

  public parse() {
    if (this.file.files !== null) {
      const f = this.file.files[0];

      const reader = new FileReader();
      reader.readAsArrayBuffer(f);
      reader.onload = (evt) => {
        if (evt.target !== null) {
          const parser = new BinLogParser();
          this.messages = parser.parse(evt.target.result as ArrayBuffer);
        }
      };
      reader.onerror = (evt) => {
        console.log(evt);
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
@font-face {
  font-family: "FFXIV";
  src: url("../assets/FFXIV_Lodestone_SSF.ttf") format("truetype"),
    url("../assets/FFXIV_Lodestone_SSF.woff") format("woff");
  unicode-range: U+E020-E0DB;
}

.message-item {
  font-family: "思源黑体", "Franklin Gothic Medium", "Arial Narrow", Arial,
    sans-serif, "FFXIV";
}
.message-item span + span {
  padding-left: 1em;
}
</style>