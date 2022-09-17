<template>
  <span v-html="text" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import type { TokenItem, TokenText } from "@/model/message";

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
  text-shadow: 0.5px 0.5px 1px var(--color), -0.5px 0.5px 1px var(--color),
    0.5px -0.5px 1px var(--color), -0.5px -0.5px 1px var(--color);
}
auto-translate {
  user-select: all;
}
.link {
  cursor: pointer;
}
.link:hover {
  background: rgba(128, 128, 128, 0.5);
}
.message icon {
  transform: scale(0.6);
  margin: calc(-0.25 * 40px) calc(-0.25 * var(--width))
}
</style>
