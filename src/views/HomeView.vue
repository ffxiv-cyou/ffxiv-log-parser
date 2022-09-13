<template>
  <div>
    <form class="pure-form">
      <fieldset>
        <legend>请选择你的日志文件</legend>
        <input ref="file" type="file" accept=".log" placeholder="ACT" />
        <button @click="parse" class="pure-button pure-button-primary">处理</button>
      </fieldset>
    </form>
    <div class="message-list">
      <div class="message-item" v-for="(item, index) in messages">
        <span>{{item.time.toLocaleTimeString()}}</span>
        <span>{{('00' + item.filter.toString(16)).slice(-2)}}</span>
        <span>{{('00' + item.channel.toString(16)).slice(-2)}}</span>
        <span>{{item.sender.ToString()}}</span>
        <span>{{item.text.ToString()}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-facing-decorator'
import { BinLogParser, Message } from '../model/binlog_parser'

@Component
export default class Home extends Vue {

// Setup and Context must work together
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
  font-family: '思源黑体', 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif, 'FFXIV';
}
.message-item span + span {
  padding-left: 1em;
}
</style>