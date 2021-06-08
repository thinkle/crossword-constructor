<script type="ts">
  import Words from "./Words.svelte";
  import { getContext } from "svelte";
  import type { PuzzleContext, Word } from "./puzzleStore";
  let p: PuzzleContext = getContext("puzzleContext");
  let { acrosses, downs, currentCell } = p;
  export let playMode;

  let currentWords: Word[] = [];
  let neighborhoodWords: Word[] = [];

  function getNeighborhood() {
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
      currentWords.sort(
        (a, b) => (a.type == $currentCell.direction && -1) || 1
      );
      currentWords = currentWords;
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
      neighborhoodWords.sort((a: Word, b: Word) => {
        if (a.type == b.type) {
          return 0;
        } else if ($currentCell.direction == a.type) {
          return 1;
        } else {
          return -1;
        }
      });
      neighborhoodWords = neighborhoodWords;
    }
  }
  $: getNeighborhood($currentCell);
  let showCurrent = true;
</script>

{#if currentWords.length && showCurrent}
  <div>
    <h3>
      Nearby <button class="button" on:click={() => (showCurrent = false)}
        ><i class="fa fa-angle-up" aria-hidden="true" /></button
      >
    </h3>
    <Words {playMode} words={currentWords} />
    <h3>Neighborhood</h3>
    <Words {playMode} words={neighborhoodWords} />
  </div>
{:else if !showCurrent}
  <button class="button" on:click={() => (showCurrent = true)}
    ><i class="fa fa-angle-down" aria-hidden="true" /></button
  >
{/if}
<div>
  <h3>Acrosses</h3>
  <Words {playMode} words={$acrosses} />
</div>
<div>
  <h3>Downs</h3>
  <Words {playMode} words={$downs} />
</div>
