<script type="ts">
  import { tick, onDestroy } from "svelte";
  import scoredFile from "./crossword_wordlist.txt";
  export let playMode;
  export let onMatch = (matches) => {};
  let clue = "";
  let lines = scoredFile.split("\n");
  export const scores = {};
  export const words = [];
  for (let line of lines) {
    let [word, score] = line.split(";");
    word = word.replace(" ", "").toUpperCase();
    words.push(word);
    scores[word] = Number(score);
  }

  let matches = [];
  export let word: string = "";
  let needsMatch = false;
  let isWord = false;
  let forceShow = false;
  let lastWord;
  $: if (word != lastWord) {
    forceShow = false;
    lastWord = words;
  }

  $: needsMatch = word.indexOf("?") > -1;

  function updateMatches() {
    let matcher = new RegExp("^" + word.replace(/[?]/g, ".") + "$", "i");
    matches = words.filter((w) => w.match(matcher));
    matches.sort((a, b) => scores[b] - scores[a]);
    onMatch(matches);
  }

  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  let timeout;
  function launchMatch(word) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(updateMatches, 250);
  }

  $: if (needsMatch) {
    launchMatch(word);
  } else {
    updateCompleteWord();
  }

  function updateCompleteWord() {
    let finder = new RegExp("^" + word + "$", "i");
    if (words.find((w) => w.match(finder))) {
      isWord = true;
    } else {
      isWord = false;
    }
    onMatch([word]);
  }
</script>

{#if playMode}
  <b>{clue}</b>
{:else}
  <span class:complete={!needsMatch} class:exists={!!isWord}>
    {word}
    {#if !needsMatch}
      {#if isWord}
        <span class={`score score-${Math.round(scores[word] / 10)}`}
          >{scores[word]}</span
        >
      {:else}
        <span class="score score-0">Not on list</span>
      {/if}
    {/if}
  </span>
  {#if needsMatch}
    <a href="#" on:click={() => (forceShow = !forceShow)}
      >{matches.length} matches</a
    >
    {#if matches.length < 5 || forceShow}
      <ul>
        {#each matches as match}
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
    Clue: <input type="text" bind:value={clue} />
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
