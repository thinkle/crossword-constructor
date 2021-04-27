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
  let { matches, clues, currentCell } = getContext("puzzleContext");
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

<span
  class:neighborhood={word.indices.indexOf($currentCell?.index) > -1}
  class:current={word.indices.indexOf($currentCell?.index) > -1 &&
    word.type == $currentCell.direction}
>
  {#if playMode}
    <b>{$clues[word.type][word.index]}</b>
  {:else}
    <span class:complete={!needsMatch} class:exists={!!isWord}>
      <button
        on:click={() =>
          ($currentCell = { index: word.indices[0], direction: word.type })}
        >{word.word}</button
      >
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
      <button on:click={() => (forceShow = !forceShow)}
        >{wordMatches?.length} matches</button
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
      <p
        contenteditable="true"
        type="text"
        bind:textContent={$clues[word.type][word.index]}
      />
    {/if}
  {/if}
</span>

<style>
  .neighborhood {
    background-color: #ffc;
  }
  .current {
    background-color: #ff3;
  }
  p {
    border: 1px solid #ccc;
    min-width: 170px;
    min-height: 1em;
    padding: 15px;
    margin-left: 2em;
    margin-top: 0;
  }
  button {
    border: none;
    background: inherit;
  }

  button:hover {
    text-decoration: underline;
  }

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
