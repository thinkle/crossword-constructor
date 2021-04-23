<script type="ts">
  export let indices = {};
  export let playMode;
  import Word from "./Word.svelte";
  export let words: string[] = [];
  let matches = {};
  export let onMatch = (matches) => {
    console.log("Cool matches:", matches);
  };

  function onWordMatch(word, metadata, matches) {
    //matches[word] = matches;
    if (typeof onMatch == "function") {
      onMatch(word, metadata, matches);
    } else {
      console.log("What is going on with ", onMatch, typeof onMatch);
    }
  }
  let byIndex = [];

  function reIndex(ww, ii) {
    byIndex = [];
    for (let n = 0; n < words.length; n++) {
      let idx = Number(indices[n]?.number);
      let word = words[n];
      byIndex[idx] = { word, number: indices[n]?.number, metadata: indices[n] };
    }
  }
  $: reIndex(words, indices);
</script>

{#each byIndex as indexedWord}
  {#if indexedWord}
    <br />{indexedWord.number}.
    <Word
      {playMode}
      word={indexedWord.word}
      onMatch={(matches) =>
        onWordMatch(indexedWord.word, indexedWord.metadata, matches)}
    />
  {/if}
{/each}
<!-- 
{#each words as word, n (n)}
  <br />{indices[n].number}. <Word
    {playMode}
    {word}
    onMatch={(matches) => onWordMatch(word, indices[n], matches)}
  />
{/each}
 -->
