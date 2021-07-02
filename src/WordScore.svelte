<script type="ts">
  export let word: string = "";
  import { words, scores } from "./findMatches";
  import { addWord } from "./customWordlistStore";
  let isWord = words.find((w) => w == word);
  let editMode = false;
  let newScore = scores[word];
  $: setScore(word);

  function setScore(word) {
    newScore = scores[word];
  }

  function saveScore() {
    addWord(word, newScore);
    scores[word] = newScore; // react!
    editMode = false;
  }
</script>

{#if editMode}
  <input type="number" min="-1" bind:value={newScore} />
  <button class="min" on:click={() => (editMode = false)}>&times;</button>
  <button class="min" on:click={saveScore}>Set</button>
{:else}
  <button class="min" on:click={() => (editMode = true)}>
    {#if isWord}
      <span class={`score score-${Math.round(scores[word] / 10)}`}
        >{scores[word]}</span
      >
    {:else}
      <span class="score score-0">Not on list</span>
    {/if}
  </button>
{/if}

<style>
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
  input {
    width: 4em;
  }
</style>
