<script type="ts">
  import type { Word } from "./puzzleStore";
  import { tick, onDestroy, getContext } from "svelte";
  export let playMode;
  import { words, scores } from "./findMatches";

  export let word: Word;
  let needsMatch = false;
  let isWord = false;
  let forceShow = false;
  let lastWord;
  let { matches, clues } = getContext("puzzleContext");
  let wordMatches = [];
  $: wordMatches = $matches[word.word];
  $: if (word.word != lastWord) {
    forceShow = false;
    lastWord = word.word;
  }

  $: needsMatch = word.word.indexOf("?") > -1;

  $: if (!needsMatch) {
    updateCompleteWord();
  }

  function updateCompleteWord() {
    let finder = new RegExp("^" + word + "$", "i");
    if (words.find((w) => w.match(finder))) {
      isWord = true;
    } else {
      isWord = false;
    }
  }
</script>

{#if playMode}
  <b>{$clues[word.type][word.index]}</b>
{:else}
  <span class:complete={!needsMatch} class:exists={!!isWord}>
    {word.word}
    {#if !needsMatch}
      {#if isWord}
        <span class={`score score-${Math.round(scores[word.word] / 10)}`}
          >{scores[word.word]}</span
        >
      {:else}
        <span class="score score-0">Not on list</span>
      {/if}
    {/if}
  </span>
  {#if needsMatch}
    <a href="#" on:click={() => (forceShow = !forceShow)}
      >{wordMatches?.length} matches</a
    >
    {#if wordMatches?.length < 5 || forceShow}
      <ul>
        {#each wordMatches || [] as match}
          <li>
            {match}
            <span class={`score score-${Math.round(scores[match] / 10)}`}
              >{scores[match]}</span
            >
          </li>
        {:else}
          No matches
        {/each}
      </ul>
    {/if}
  {:else}
    Clue: <input type="text" bind:value={$clues[word.type][word.index]} />
  {/if}
{/if}

<style>
  .complete {
    font-style: italic;
    color: #a77;
  }

  .complete.exists {
    font-style: bold;
    color: black;
  }

  span {
    font-size: small;
    font-family: monospace;
  }

  .score {
    font-size: small;
  }
  .score-5 {
    color: black;
    font-weight: bold;
  }
  .score-4 {
    color: #111;
    font-weight: 400;
  }
  .score-3 {
    color: #333;
    font-weight: 400;
  }
  .score-2 {
    color: #555;
    font-weight: 300;
  }
  .score-1 {
    color: #222;
    font-weight: 200;
  }
  .score-0 {
    color: #aaa;
    font-weight: 100;
  }
</style>
