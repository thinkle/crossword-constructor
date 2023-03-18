<script lang="ts">
    import {
    scoredList,    
  } from "./customWordlistStore";    

  import { words, scores, customListName, importWordList } from "./wordlist";
  
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let text = "";
  let score = 50;

  function processWords(text) {
    let words = text.split("\n");
    words = words.map((w) => w.toUpperCase().replace(/[^A-Z0-9]/g, ""));
    words = words.map((w) => [w, score]);
    return words;
  }

  let newScoredList = [];
  $: newScoredList = processWords(text);
  $: dispatch("change", { list: newScoredList, text });

  function sortList() {
    let lines = text.split("\n");
    lines.sort(
      (a, b) =>
        b.replace(/[^A-Za-z]/g, "").length - a.replace(/[^A-Za-z]/g, "").length
    );
    text = lines.join("\n");
  }

  function getCurrentStatus (word) {
    debugger;
    for (let w of $scoredList) {
      if (w[0]==word) {
        return w[1];
      }
    }
    if (scores[word]) {
      return scores[word];
    } else {
      return 'New!';
    }
  }
</script>

Score for words below: <input type="number" bind:value={score} />
<button on:click={sortList}>Sort</button>
<div>
  <textarea bind:value={text} />
  <ul class="echo">
    {#each newScoredList as item}
      {#if item[0]}
        <li>{item[0]} ({item[0].length})
        [{getCurrentStatus(item[0])}]
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style>
  div {
    position: relative;
  }
  .echo {
    position: absolute;
    top: 6px;
    right: 6px;
    text-align: right;
    color: grey;
    pointer-events: none;
  }
  li {
    list-style: none;
  }
  textarea {
    width: 100%;
    height: 60vh;
    border: 1px solid #aaa;
  }
</style>
