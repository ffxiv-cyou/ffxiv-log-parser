<script lang="ts">
  import type { Message } from "@/model/message";
  import TokenTextComponent from "./TokenText.svelte";
  import "@/assets/UIColor.css";
  import "@/assets/LogKind.css";
  import "@/assets/LogFilterColor.css";
  import "@/assets/LogFilterColor.css";
  import "@/assets/Icon.css";

  let {
    msg,
    longTime,
  }: {
    msg: Message;
    longTime: boolean;
  } = $props();

  let time = $derived(
    longTime ? msg.time.toLocaleString() : msg.time.toLocaleTimeString(),
  );
</script>

<div class={["message", "message-item", "filter-" + msg.filter]}>
  <span class="time">[{time}]</span>
  <span class="text-body">
    <span class="sender">
      <TokenTextComponent token={msg.sender} />
    </span>
    <span>
      <TokenTextComponent token={msg.text} />
    </span>
  </span>
</div>

<style scoped>
  @font-face {
    font-family: "FFXIV";
    src:
      url("../assets/FFXIV_Lodestone_SSF.ttf") format("truetype"),
      url("../assets/FFXIV_Lodestone_SSF.woff") format("woff");
    unicode-range: U+E020-E0DB;
  }

  .message {
    font-family: "思源黑体", "微软雅黑", Arial, sans-serif, "FFXIV";
    line-height: 1.3em;
  }
  .message .time {
    margin-right: 0.2em;
    color: white;
  }

  .message .sender::before {
    content: var(--prefix);
  }

  .message .sender::after {
    content: var(--suffix);
  }

  .message .sender {
    display: var(--visible);
  }

  .message {
    --shadow: rgba(0, 0, 0, 1);
    text-shadow:
      0.5px 0.5px 1px var(--shadow),
      -0.5px 0.5px 1px var(--shadow),
      0.5px -0.5px 1px var(--shadow),
      -0.5px -0.5px 1px var(--shadow);
    filter: blur(0.3px) brightness(0.99);
  }

  .message .text-body {
    color: var(--default-color);
  }

  .message::selection,
  .message :global(::selection) {
    background: rgba(115, 225, 5, 0.4);
  }
</style>
