<template>
    <div class="message" :class="'filter-' + msg.filter">
        <span class="time">[{{ time }}]</span>
        <span class="channel">{{ channel }}</span>
        <span class="filter">{{ filter }}</span>
        <span class="sender">
            <TokenText :token="sender" />
        </span>
        <span>
            <TokenText :token="content" />
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-facing-decorator'
import type { Message, TokenText } from '@/model/message';
import TokenTextComponent from './TokenText.vue';
import '@/assets/UIColor.css'
import '@/assets/LogKind.css'

@Component({
    components: {
        TokenText: TokenTextComponent
    }
})
export default class MessageComponent extends Vue {
    @Prop
    msg!: Message;

    get time(): string {
        return this.msg.time.toLocaleTimeString();
    }

    get channel(): number {
        return this.msg.channel;
    }

    get filter(): number {
        return this.msg.filter;
    }

    get sender(): TokenText {
        return this.msg.sender;
    }

    get content(): TokenText {
        return this.msg.text;
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
    font-family: "思源黑体", "Franklin Gothic Medium", "Arial Narrow", Arial,
        sans-serif, "FFXIV";
}

.message .time {
    margin-right: 1em;
    font-family: 'Courier New', Courier, monospace;
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
</style>