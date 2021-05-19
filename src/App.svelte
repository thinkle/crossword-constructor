<script lang="ts">
  import Grid from "./Grid.svelte";
  import LetterCounter from "./LetterCounter.svelte";
  import CustomWordList from "./CustomWordList.svelte";
  let playMode;
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
  <nav>
    <button class="center" on:click={() => (playMode = !playMode)}>
      {#if playMode}
        Construct
      {:else}
        Play
      {/if}
    </button>
  </nav>
  <Grid xsize={x} ysize={y} {playMode} bind:initialLetters={letters} />
  {#if !playMode}
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

  @media print {
    nav {
      display: none;
    }
    .center {
      display: none;
    }
  }
</style>
