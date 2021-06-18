<script type="ts">
  export let fillGrid: boolean = true;
  export let small: boolean = false;
  import { getContext } from "svelte";
  import type { PuzzleContext } from "./puzzleStore";

  let p: PuzzleContext = getContext("puzzleContext");
  let { x, y, letters, circles, numbers, acrosses, downs, clues, words } = p;

  function range(n) {
    let a = [];
    for (let i = 0; i < n; i++) {
      a.push(i);
    }
    return a;
  }
</script>

<div class:small class="grid" style={`--square-width:${$x}`}>
  {#each range($y) as rn}
    <div class="row">
      {#each range($x) as cn}
        <div
          class:black={$letters[p.idx(rn, cn)] == "."}
          class="square"
          class:circle={$circles[p.idx(rn, cn)]}
        >
          {#if $numbers[p.idx(rn, cn)]}
            <span class="number">
              {$numbers[p.idx(rn, cn)]}
            </span>
          {/if}
          {#if fillGrid}
            {$letters[p.idx(rn, cn)]}
          {:else}
            &nbsp;
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .grid {
    align-self: center;
    justify-self: center;
    margin-top: auto;
    margin-bottom: auto;
    --base-size: 30pt;
    /* min-width: calc(32pt * var(--square-width)); */
  }
  .grid.small {
    --base-size: 23pt;
  }
  .square {
    border: 1px solid black;
    border-left: none;
    border-top: none;
    display: inline-flex;
    align-items: center;
    /* font-size: calc(13in / var(--square-width)); */
    justify-content: center;
    position: relative;
    width: calc(var(--base-size) * 15 / var(--square-width));
    height: calc(var(--base-size) * 15 / var(--square-width));
    font-size: calc(var(--base-size) / 2 * 15 / var(--square-width));
  }
  .square:first-child {
    border-left: 1px solid black;
  }
  .row:first-child .square {
    border-top: 1px solid black;
  }
  .square span {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    font-size: 45%;
    margin-left: 1pt;
    margin-top: 1pt;
  }
  .black.square {
    background-color: black;
    color: black;
  }
  tr > td {
    padding-top: 1em;
  }
  .number {
    padding-right: 1em;
  }
  .clue {
    padding-left: 2em;
  }
  .info p {
    margin-top: 0.25pt;
    margin-bottom: 0.25pt;
  }

  .circle {
    position: relative;
  }
  .circle::before {
    display: block;
    content: " ";
    width: calc(var(--base-size) * 15 / var(--square-width));
    height: calc(var(--base-size) * 15 / var(--square-width));
    position: absolute;
    border-radius: 50%;
    border: 1px solid grey;
    pointer-events: none;
  }
</style>
