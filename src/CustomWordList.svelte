<script>
  import { words, scores, customListName, importWordList } from "./wordlist";
  let customListText = localStorage.getItem(customListName);
  let scoredList =
    (customListText && customListText.split("\n").map((l) => l.split(";"))) ||
    [];
  let nextWord = ["", 50];
  function addWord() {
    scoredList = [...scoredList, nextWord];
    nextWord = ["", 50];
  }
  function getListAsString() {
    return scoredList.map((l) => l.join(";")).join("\n");
  }
  function saveList() {
    localStorage.setItem(customListName, getListAsString());
  }
  function activate() {
    importWordList(getListAsString());
  }
  $: nextWord[0] = nextWord[0].toUpperCase().replace(/[^A-Za-z]/g, "");
</script>

<ul>
  {#each scoredList as item}
    <li>
      Word: <input bind:value={item[0]} />
      Score: <input bind:value={item[1]} type="number" min="0" />
      {#if scores[item[0]]}
        (Default: {scores[item[0]]})
      {/if}
    </li>
  {/each}
  <li>
    <form on:submit|preventDefault={addWord}>
      Word: <input bind:value={nextWord[0]} />
      Score:
      <input class="score" bind:value={nextWord[1]} type="number" min="0" />
      <span style="display:inline-block;width:10em"
        >{#if scores[nextWord[0]]}
          (Default: {scores[nextWord[0]]})
        {/if}</span
      >
      <input type="submit" value="Add" />
    </form>
  </li>
</ul>
<button on:click={activate}>Use</button>
<button on:click={saveList}>Save</button>

<style>
  .score {
    width: 3em;
  }
</style>
