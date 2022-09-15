<template>
    <span v-html="text"></span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator'
import type { TokenItem, TokenText } from '@/model/message';

@Component
export default class TokenTextComponent extends Vue {
    @Prop
    token!: TokenText;

    get tokens(): TokenItem[] {
        return this.token.items;
    }

    get text(): string {
        let s = "";
        for (let i = 0; i < this.token.items.length; i++) {
            const token = this.token.items[i];
            s += token.ToHtmlString();
        }
        return s;
    }
}
</script>

<style>
.color1 {
    color: var(--color);
}
.color2 {
    text-shadow: 0.5px 0.5px 1px var(--color), -0.5px 0.5px 1px var(--color), 0.5px -0.5px 1px var(--color), -0.5px -0.5px 1px var(--color);
}
.link,
auto-translate {
    user-select: all;
}
.link:hover {
    background: rgba(128,128,128,0.2);
}
</style>