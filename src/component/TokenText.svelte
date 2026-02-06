<script lang="ts">
  import type { TokenText } from "@/model/message";

  let {
    token,
  }: {
    token: TokenText;
  } = $props();

  let text: string = $derived.by(() => {
    let s = "";
    for (let i = 0; i < token.items.length; i++) {
      const t = token.items[i];
      s += t.ToHtmlString();
    }
    return s;
  });
</script>

<span>
  {@html text}
</span>

<style>
  :global {
    .color1 {
      color: var(--color);
    }
    .color2 {
      text-shadow:
        0.5px 0.5px 1px var(--color),
        -0.5px 0.5px 1px var(--color),
        0.5px -0.5px 1px var(--color),
        -0.5px -0.5px 1px var(--color);
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
      margin: calc(-0.25 * 40px) calc(-0.25 * var(--width));
    }
  }
</style>
