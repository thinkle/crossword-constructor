<script lang="ts">
  import Puzzle from "./Puzzle.svelte";
  import { Mode } from "./types";
  import LetterCounter from "./LetterCounter.svelte";
  import CustomWordList from "./CustomWordList.svelte";
  let mode: Mode = Mode.CONSTRUCT;
  if (location.search) {
    mode = Mode.PLAY;
  }
  let x: number = 15;
  let y: number = 15;
  let letters = [];
  $: if (x < 1) {
    x = 1;
  }
  $: if (y < 1) {
    y = 1;
  }
</script>

<main>
  <h1 class="center">Tom's Puzzle Tool</h1>
  <div class="center">
    <input bind:value={x} type="number" min="1" max="20" />
    x
    <input bind:value={y} type="number" min="1" max="20" />
  </div>
  <nav class="center">
    <button
      class:active={mode == Mode.PLAY}
      on:click={() => (mode = Mode.PLAY)}
    >
      Play
    </button>
    <button
      class:active={mode == Mode.CONSTRUCT}
      on:click={() => (mode = Mode.CONSTRUCT)}
    >
      Construct
    </button>
    <button
      class:active={mode == Mode.PRINT}
      on:click={() => (mode = Mode.PRINT)}
    >
      Print Puzzle
    </button>
    <button
      class:active={mode == Mode.SOLUTION}
      on:click={() => (mode = Mode.SOLUTION)}
    >
      Print Solution
    </button>
    {#if mode == Mode.SOLUTION || mode == Mode.PRINT}
      <button on:click={() => window.print()}> Print </button>
    {/if}
  </nav>
  <Puzzle xsize={x} ysize={y} {mode} bind:initialLetters={letters} />
  {#if mode == Mode.CONSTRUCT}
    <hr />
    <!-- <h3>Letter Counter</h3> -->
    <!-- <LetterCounter /> -->
    <CustomWordList />
  {/if}
</main>

<style>
  .square {
    display: inline-block;
    width: 1em;
    height: 1em;
  }
  .black {
    background-color: black;
    color: black;
  }
  .center {
    margin: auto;
    text-align: center;
    display: block;
    margin-bottom: 1em;
  }
  main {
    padding: 1em;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 1.2em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  nav {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  nav .active {
    border-color: transparent;
    font-weight: bold;
    background-color: transparent;
  }
  @media print {
    nav {
      display: none;
    }
    .center {
      display: none;
    }
  }
</style>
