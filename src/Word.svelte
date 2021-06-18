<script type="ts">
  import WordScore from "./WordScore.svelte";

  import { getPossible } from "./solver";
  import type { Word } from "./puzzleStore";
  import { tick, onDestroy, getContext } from "svelte";
  export let playMode;
  import { words, scores } from "./findMatches";

  export let word: Word;
  let needsMatch = false;
  let isWord = false;
  let forceShow = false;
  let lastWord;
  let { matches, clues, currentCell, possibleLetters, wordMatches } =
    getContext("puzzleContext");
  let myMatches = [];

  $: myMatches = $matches[word.word];
  $: if ($wordMatches[word.type][word.index]?.length) {
    myMatches = $wordMatches[word.type][word.index];
  }
  $: if (word.word != lastWord) {
    forceShow = false;
    lastWord = word.word;
  }

  $: needsMatch = word.word.indexOf("?") > -1;

  $: isWord = !needsMatch && words.indexOf(word.word) > -1;

  /* let matcher = new RegExp(".*");

  $: matcher = new RegExp(
    "^" +
      word.indices
        .map((i) => "[" + getPossible($possibleLetters[i]).join("") + "]")
        .join("") +
      "$"
  ); */
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
        <WordScore word={word.word} />
      {/if}
    </span>
    {#if needsMatch}
      <button on:click={() => (forceShow = !forceShow)}
        >{myMatches?.length} matches</button
      >
      {#if myMatches?.length < 5 || forceShow}
        <ul>
          {#each myMatches || [] as match}
            <li>
              {match}
              <WordScore word={match} />
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
</style>
