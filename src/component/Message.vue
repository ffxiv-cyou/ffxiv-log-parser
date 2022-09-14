<template>
    <div class="message">
        <span>{{ time }}</span>
        <span>{{ channel }}</span>
        <span>{{ filter }}</span>
        <span>
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
.message span + span {
    margin-left: 1em;
}
</style>