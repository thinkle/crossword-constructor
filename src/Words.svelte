<script type="ts">
  import type { Word } from "./puzzleStore";
  export let playMode;
  import WordDisplay from "./Word.svelte";
  import { getContext } from "svelte";
  let { numbers } = getContext("puzzleContext");
  export let words: Word[] = [];

  let sortedWords = [...words];
  $: {
    sortedWords = [...words];
    sortedWords.sort((a, b) => $numbers[a.indices[0]] - $numbers[b.indices[0]]);
  }
</script>

{#each words as word}
  <br />{$numbers[word.indices[0]]}.
  <WordDisplay {playMode} {word} />
{/each}
