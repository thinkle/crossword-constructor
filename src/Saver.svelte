<script type="ts">
  import { getContext } from "svelte";
  export let title = "";
  export let author = "";
  let { letters, x, y, clues } = getContext("puzzleContext");

  type puzzle = {
    x: number;
    y: number;
    title: string;
    author: string;
    letters: string[];
    clues: {
      across: string[];
      down: string[];
    };
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
    savedPuzzles.push({
      x: $x,
      y: $y,
      letters: $letters,
      clues: $clues,
      title,
      author,
    });
    localStorage.setItem("saved-crosswords", JSON.stringify(savedPuzzles));
  }

  function load() {
    let savedPuzzles = getSaved();
    if (savedPuzzles.length == 1) {
      loadPuzzle(savedPuzzles[0]);
    } else {
      savedPuzzles.reverse();
      puzzleOptions = savedPuzzles;
    }
  }

  function loadPuzzle(puzzle: puzzle) {
    $x = puzzle.x;
    $y = puzzle.y;
    $letters = puzzle.letters;
    if (puzzle.clues) {
      $clues = puzzle.clues;
    }
    if (puzzle.title) {
      title = puzzle.title;
    }
    if (puzzle.author) {
      author = puzzle.author;
    }
    puzzleOptions = [];
  }

  function moveToTop(el) {
    document.body.appendChild(el);
  }
</script>

<button on:click={() => save()}>Save</button>
<button on:click={() => load()}>Load</button>
{#if puzzleOptions.length}
  <section use:moveToTop>
    <div class="center">
      <h2>Choose a puzzle!</h2>
      {#each puzzleOptions as puzzle, n}
        <div class="choice">
          <h3>{puzzle.title || "Untitled"}</h3>
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
        </div>
      {/each}
    </div>
    <button
      on:click={() => {
        puzzleOptions = [];
      }}>&times;</button
    >
  </section>
{/if}

<style>
  .choice {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: start;
    margin-bottom: 2em;
  }
  section > button {
    position: absolute;
    top: 1em;
    right: 1em;
  }
  .center {
    margin: auto;
    margin-top: 2em;
    text-align: center;
  }
  section {
    position: fixed;
    width: 100%;
    height: 100vh;
    overflow-y: scroll;
    top: 0;
    left: 0;
    background-color: #fffb;
  }

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
</style>
