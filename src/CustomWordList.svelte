<script type="ts">
  import { words, scores, customListName, importWordList } from "./wordlist";
  import BulkWordlist from "./BulkWordlist.svelte";
  let scoredList: [string, number][] = [];
  let nextWord: [string, number] = ["", 50];
  function loadList() {
    let customListText = localStorage.getItem(customListName);
    scoredList =
      customListText &&
      customListText
        .split("\n")
        .map((l) => [l.split(";")[0], Number(l.split(";")[1])]);
    nextWord = ["", 50];
  }
  loadList();
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
  let showList: boolean = false;
  let bulkList = [];
  let bulkWLText = "";
</script>

<div class="head">
  <h4>Custom Words</h4>
  <button on:click={activate}>Use</button>
  <button on:click={loadList}>Revert</button>
  <button on:click={saveList}>Save</button>
</div>
<h4>Bulk Add</h4>
<button
  on:click={() => {
    scoredList = [...scoredList, ...bulkList];
    bulkWLText = "";
  }}>Add bulk list</button
>
<BulkWordlist
  bind:text={bulkWLText}
  on:change={(e) => {
    bulkList = e.detail.list;
    bulkWLText = e.detail.text;
  }}
/>
<ul>
  {#if scoredList && scoredList.length}
    <button on:click={() => (showList = !showList)}>
      {#if showList}Hide{:else}Show{/if}
      {scoredList.length} items currently on list
    </button>
  {/if}
  {#if showList}
    {#each scoredList as item, i}
      <li>
        <label>Word: <input bind:value={item[0]} /></label>
        <label
          >Score: <input bind:value={item[1]} type="number" min="0" />
          {#if scores[item[0]]}
            (Current: {scores[item[0]]})
          {/if}
        </label>
        <button
          on:click={() =>
            (scoredList = [
              ...scoredList.slice(0, i),
              ...scoredList.slice(i + 1),
            ])}>-</button
        >
      </li>
    {/each}
  {/if}
  <li>
    <form on:submit|preventDefault={addWord}>
      <label>Word: <input bind:value={nextWord[0]} /></label>
      <label
        >Score:
        <input class="score" bind:value={nextWord[1]} type="number" min="0" />
        <span style="display:inline-block;width:10em"
          >{#if scores[nextWord[0]]}
            (Default: {scores[nextWord[0]]})
          {/if}</span
        >
      </label>
      <input type="submit" value="Add" />
    </form>
  </li>
</ul>

<style>
  .head {
    position: sticky;
    top: 5px;
    background-color: white;
  }
  .score {
    width: 3em;
  }
  li {
    list-style: none;
  }
  label {
    display: inline-block;
  }
</style>
