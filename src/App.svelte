<script lang="ts">
  import Puzzle from "./Puzzle.svelte";
  import FilterMaker from "./FilterMaker.svelte";
  import ThemeTools from "./ThemeTools.svelte";
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
  <header class="topbar">
    <nav class="center tabs">
      <button
        class="tab"
        class:active={mode == Mode.PLAY}
        on:click={() => (mode = Mode.PLAY)}
      >
        Play
      </button>
      <button
        class="tab"
        class:active={mode == Mode.CONSTRUCT}
        on:click={() => (mode = Mode.CONSTRUCT)}
      >
        Construct
      </button>
      <button
        class="tab"
        class:active={mode == Mode.PRINT}
        on:click={() => (mode = Mode.PRINT)}
      >
        Print Puzzle
      </button>
      <button
        class="tab"
        class:active={mode == Mode.SOLUTION}
        on:click={() => (mode = Mode.SOLUTION)}
      >
        Print Solution
      </button>
      {#if mode == Mode.SOLUTION || mode == Mode.PRINT}
        <button class="button min" on:click={() => window.print()}>
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
  </header>
  <Puzzle xsize={x} ysize={y} {mode} bind:initialLetters={letters} />
  {#if mode == Mode.CONSTRUCT}
    <FilterMaker />
    <hr />
    <!-- <h3>Letter Counter</h3> -->
    <!-- <LetterCounter /> -->
    <CustomWordList />
    <ThemeTools />
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
    padding-left: 8px;
    padding-right: 8px;
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

  header {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 3;
    display: flex;
    justify-content: space-evenly;
  }
  nav .active {
    border-color: transparent;
    font-weight: bold;
    background-color: #3a2020;
    border-bottom: 1px solid #8f0202;
  }
  button.tab {
    border-color: transparent;
    background-color: #e4e4e4;
    border-radius: 15px 15px 0 0;
    border-bottom: 1px solid #917474;
    cursor: pointer;
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
