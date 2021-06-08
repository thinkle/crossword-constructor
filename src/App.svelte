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
  <h1 style="float:right">Tom's Puzzle Tool</h1>
  <nav class="center tabs">
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
      <button class="button" on:click={() => window.print()}>
        <i class="fa fa-print" aria-hidden="true" />
      </button>
    {/if}
  </nav>
  {#if mode == Mode.CONSTRUCT}
    <div class="center">
      <input bind:value={x} type="number" min="1" max="20" />
      x
      <input bind:value={y} type="number" min="1" max="20" />
    </div>
  {/if}
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
    float: right;
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
    background-color: #f1bebe;
    border-bottom: 1px solid #8f0202;
  }
  .tabs button {
    border-color: transparent;
    background-color: #e4e4e4;
    border-radius: 15px 15px 0 0;
    border-bottom: 1px solid #917474;
    cursor: pointer;
  }
  button.button {
    border-radius: 15px 15px 15px 15px;
    background-color: white;
    border-bottom: none;
  }
  button.button:hover {
    border: 1px solid #8f0202;
    transition: 200ms;
  }
  @media print {
    nav {
      display: none;
    }
    .center {
      display: none;
    }
    h1 {
      display: none;
    }
  }
</style>
