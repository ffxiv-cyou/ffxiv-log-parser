<template>
    <div class="message" :class="'filter-' + msg.filter">
        <span class="time">[{{ time }}]</span>
        <span class="text-body">
            <span class="sender">
                <TokenText :token="msg.sender" />
            </span>
            <span>
                <TokenText :token="msg.text" />
            </span>
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator'
import type { Message } from '@/model/message';
import TokenTextComponent from './TokenText.vue';
import '@/assets/UIColor.css'
import '@/assets/LogKind.css'
import '@/assets/LogFilterColor.css'
import '@/assets/LogFilterColor.css'
import '@/assets/Icon.css'

@Component({
    components: {
        TokenText: TokenTextComponent
    }
})
export default class MessageComponent extends Vue {
    @Prop
    msg!: Message;

    @Prop
    longTime!: boolean;

    get time(): string {
        if (this.longTime) return this.msg.time.toLocaleString();
        return this.msg.time.toLocaleTimeString();
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

.message {
    font-family: "思源黑体", "微软雅黑", Arial, sans-serif, "FFXIV";
    line-height: 1.3em;
}

.message .time {
    margin-right: 0.2em;
    color: white;
}

.message .channel,
.message .filter {
    display: none;
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
    text-shadow: 0.5px 0.5px 1px var(--shadow), -0.5px 0.5px 1px var(--shadow),
        0.5px -0.5px 1px var(--shadow), -0.5px -0.5px 1px var(--shadow);
    filter: blur(0.45px) brightness(0.98);
}

.message .text-body {
    color: var(--default-color);
}

.message ::selection {
    background: rgba(255, 255, 255, 0.25);
}
</style>