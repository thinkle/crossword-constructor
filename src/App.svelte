<script lang="ts">
  import Grid from "./Grid.svelte";
  let playMode;
  let x: number = 4;
  let y: number = 4;
  let letters = [];

  type puzzle = {
    x: number;
    y: number;
    letters: string[];
  };

  function getSaved(): puzzle[] {
    let savedPuzzles = [];
    let saved = localStorage.getItem("saved-crosswords");
    if (saved) {
      try {
        savedPuzzles = JSON.parse(saved);
        if (!Array.isArray(savedPuzzles)) {
          console.log("Something is wrong with", savedPuzzles);
          savedPuzzles = [];
        }
      } catch (err) {
        console.log("Error loading puzzles :(", err);
      }
    }
    return savedPuzzles;
  }

  let puzzleOptions = [];

  function save() {
    let savedPuzzles = getSaved();
    savedPuzzles.push({ x, y, letters });
    localStorage.setItem("saved-crosswords", JSON.stringify(savedPuzzles));
  }

  function load() {
    let savedPuzzles = getSaved();
    if (savedPuzzles.length == 1) {
      loadPuzzle(savedPuzzles[0]);
    } else {
      puzzleOptions = savedPuzzles;
    }
  }

  function loadPuzzle(puzzle: puzzle) {
    x = puzzle.x;
    y = puzzle.y;
    letters = puzzle.letters;
    puzzleOptions = [];
  }
</script>

<main>
  <h1 class="center">Grid Builder</h1>
  <div class="center">
    <input bind:value={x} type="number" min="1" max="20" />
    x<input bind:value={y} type="number" min="1" max="20" />
  </div>
  <button class="center" on:click={() => (playMode = !playMode)}>
    {#if playMode}
      Construct
    {:else}
      Play
    {/if}
  </button>
  <button on:click={() => save()}>Save</button>
  <button on:click={() => load()}>Load</button>
  {#if puzzleOptions.length}
    Choose a puzzle!
    {#each puzzleOptions as puzzle, n}
      <div class="thumb">
        <div class="row">
          {#each puzzle.letters as l, n}
            {#if n % puzzle.x == 0 && n != 0}
              <br />
            {/if}
            <span class="square" class:black={l == "."}>{l}</span>
          {/each}
        </div>
      </div>
      <button on:click={() => loadPuzzle(puzzle)}>Load</button>
    {/each}
  {:else}
    <Grid {x} {y} {playMode} bind:letters />
  {/if}
</main>

<style>
  .thumb {
    font-size: tiny;
  }
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
    max-width: 240px;
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
</style>
