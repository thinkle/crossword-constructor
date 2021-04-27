<script type="ts">
  import Words from "./Words.svelte";
  import { getContext } from "svelte";
  import type { PuzzleContext, Word } from "./puzzleStore";
  let p: PuzzleContext = getContext("puzzleContext");
  let { acrosses, downs, currentCell } = p;
  export let playMode;

  let currentWords = [];
  let neighborhoodWords = [];

  function getNeighborhood(currentIndex: {} | null) {
    if (!$currentCell) {
      currentWords = [];
      neighborhoodWords = [];
    } else {
      let words = [...$acrosses, ...$downs];
      currentWords = words.filter(
        (w) => w.indices.indexOf($currentCell.index) > -1
      );
      let currentIndices: number[] = [];
      currentWords.forEach(
        (w) => (currentIndices = [...currentIndices, ...w.indices])
      );
      console.log("Looking in neighborhood of", currentIndices);
      neighborhoodWords = words.filter((w) => {
        if (currentWords.indexOf(w) > -1) {
          return false;
        }
        for (let i of currentIndices) {
          if (w.indices.indexOf(i) > -1) {
            return true;
          }
        }
      });
    }
  }
  $: getNeighborhood($currentCell);
  let showCurrent;
</script>

{#if currentWords.length && showCurrent}
  <div>
    <h3>Nearby <button on:click={() => (showCurrent = false)}>hide</button></h3>
    <Words {playMode} words={currentWords} />
    <h3>Neighborhood</h3>
    <Words {playMode} words={neighborhoodWords} />
  </div>
{:else}
  <button on:click={() => (showCurrent = true)}>Show nearby</button>
{/if}
<div>
  <h3>Acrosses</h3>
  <Words {playMode} words={$acrosses} />
</div>
<div>
  <h3>Downs</h3>
  <Words {playMode} words={$downs} />
</div>
