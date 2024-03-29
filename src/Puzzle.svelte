<script lang="ts">
  import JsonUrl from "json-url";
  import { Mode } from "./types";
  export let mode = Mode.CONSTRUCT;
  import { tick, setContext, getContext } from "svelte";
  import { writable } from "svelte/store";
  import { makePuzzleStore } from "./puzzleStore";
  import type { PuzzleContext } from "./puzzleStore";
  import { solvePuzzle, cancelSolve } from "./solver";
  import type { Word } from "./puzzleStore";
  import WordLists from "./WordLists.svelte";
  import DownloadButton from "./DownloadButton.svelte";
  import Saver from "./Saver.svelte";
  import { createPuzzleFile } from "./acrosslite";
  import PrintSubmission from "./PrintSubmission.svelte";
  import PrintPuzzle from "./PrintPuzzle.svelte";
  let playMode;
  $: playMode = mode == Mode.PLAY;
  export let xsize: number;
  export let ysize: number;
  export let initialLetters = [];
  let widthDelta = 200;
  let fullWidth = 0;
  let gridLetterSize = 4;
  $: gridLetterSize = Math.max($x, $y);
  let size = 2;
  let p: PuzzleContext = makePuzzleStore(initialLetters, xsize, ysize);
  //console.log("Made magic", p);
  setContext("puzzleContext", p);
  let {
    x,
    y,
    numbers,
    letters,
    circles,
    possibleLetters,
    clues,
    acrosses,
    downs,
    currentCell,
    autoMode,
    scoreCutoff,
    autofill,
  } = p;

  let answers = writable([]);

  $: if (lockMode) {
    $autoMode = true;
  } else {
    $autoMode = false;
  }

  $: $x = xsize;
  $: $y = ysize;

  $: if ($x * $y > 64) {
    size = 2;
  } else if ($x * $y > 400) {
    size = 1;
  } else {
    size = 3;
  }

  $: if ($letters.length != $x * $y) {
    $letters = $letters.slice(0, $x * $y);
    while ($letters.length < $x * $y) {
      $letters.push("?");
    }
    // Wait to change otherwise we do tons of extra work as we go
    $letters = $letters;
  }

  /* let ROW = 1;
  let COL = 2;
  let mode: ROW | COL = ROW; */
  let activeWord: Word | null = null;

  function isInput(event) {    
    if (event.key.length != 1) {
      return false;
    }
    if (event.key.match(/[A-Za-z0-9.]/)) {
      return true;
    } else {
      return false;
    }
  }

  function updateActiveWord(idx) {
    if ($currentCell.direction == "across") {
      activeWord = getAcrossWord(idx);
    } else {
      activeWord = getDownWord(idx);
    }
  }

  let locallySetCell = -1;
  $: if ($currentCell && $currentCell.index != locallySetCell) {
    moveRight($currentCell.index, 0);
  }

  function onFocus(event) {
    let idx = Number(event.target.getAttribute("item"));
    if ($currentCell) {
      $currentCell.index = idx;
    } else {
      $currentCell = {
        index: idx,
        direction: "across",
      };
    }
    locallySetCell = idx;
    updateActiveWord(idx);
    event.target.select();
  }

  function getInfo(idx) {
    return {
      cn: idx % $x,
      rn: Math.floor(idx / $x),
    };
  }

  function getInput(idx) {
    return document.querySelector(`input[item="${idx}"]`);
  }

  function moveRight(idx, amount = 1) {
    let { cn, rn } = getInfo(idx);
    let next = rn * $x + cn + amount;
    if (next >= $x * $y) {
      next = 0;
    }
    if (next < 0) {
      next = $x * $y - 1;
    }
    if (lockMode && $letters[next] == "." && amount) {
      moveRight(next, amount);
    } else {
      let input = getInput(next);
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  function getNextDownSquareByWord(idx, amount, word) {    
    let { rn, cn } = getInfo(idx);
    let rawNext = (rn + amount) * $x + cn;
    if (word.indices.indexOf(rawNext) > -1) {
      return rawNext;
    } else {
      /* Ok we are switching words... */
      let currentWordNumber = $numbers[word.indices[0]];      
      let nextWord;
      let firstWord;
      for (let w of $downs) {
        let wordNumber = $numbers[w.indices[0]];        
        if (amount > 0) {
          if (
            firstWord === undefined ||
            $numbers[w.indices[0]] < $numbers[firstWord.indices[0]]
          ) {
            firstWord = w;
          }
          // next
          if (wordNumber > currentWordNumber) {
            if (!nextWord) {
              nextWord = w;              
            } else {
              if ($numbers[w.indices[0]] < $numbers[nextWord.indices[0]]) {
                nextWord = w;                
              }
            }
          }
        } else {
          // moving up...
          if (
            firstWord === undefined ||
            $numbers[w.indices[0]] > $numbers[firstWord.indices[0]]
          ) {
            firstWord = w;
          }
          if (wordNumber < currentWordNumber) {
            if (!nextWord) {
              nextWord = w;
            } else {
              if ($numbers[w.indices[0]] > $numbers[nextWord.indices[0]]) {
                nextWord = w;
              }
            }
          }
        }
      }
      if (nextWord) {        
        if (amount > 0) {
          return nextWord.indices[0];
        } else {
          return nextWord.indices.slice(-1)[0];
        }
      } else if (firstWord) {
        if (amount > 0) {
          return firstWord.indices[0];
        } else {
          return firstWord.indices.slice(-1)[0];
        }
      } else {        
        return idx + amount;
      }
    }
  }

  function moveDown(idx, amount = 1) {
    let word: Word = $downs.find((w: Word) => w.indices.indexOf(idx) > -1);
    let next = idx;
    if (lockMode && word) {
      next = getNextDownSquareByWord(idx, amount, word);
    } else {      
      let { rn, cn } = getInfo(idx);
      if (rn == $y - 1 && amount > 0) {
        // end of row, moving forward
        rn = 0;
        cn += amount;
        if (cn >= $x) {
          cn = 0;
        }
      } else if (rn == 0 && amount < 0) {
        // start of row, moving backward
        rn = $y - 1;
        cn += amount;
        if (cn < 0) {
          cn = $x - 1;
        }
      } else {
        rn += amount;
      }
      next = rn * $x + cn;
    }
    let input = getInput(next);
    if (input) {
      input.focus();
      input.select();
    }
  }

  function setLetter(idx, val) {
    if (playMode) {
      $answers[idx] = val;
      if (val == "?") {
        $answers[idx] = "";
      }
    } else {
      $letters[idx] = val;
    }
  }

  function onKeyDown(event) {
    let idx = Number(event.target.getAttribute("item"));
    let { cn, rn } = getInfo(idx);
    let mirrorRn = $y - rn - 1;
    let mirrorCn = $x - cn - 1;
    let mirrorIdx = p.idx(mirrorRn, mirrorCn);
    if (leftRightSymmetryMode) {
      mirrorRn = rn;
      mirrorCn = $x - cn - 1;
      mirrorIdx = p.idx(mirrorRn, mirrorCn);
    }
    event.preventDefault();
    if (isInput(event)) {
      if ((lockMode && event.code == "Period") || $letters[idx] == ".") {
        //showGridIsLockedWarning
        console.log("grid is locked");
      } else {
        if (!playMode && mirrorMode && !lockMode) {
          if (event.code == "Period") {
            $letters[mirrorIdx] = ".";
          } else {
            if ($letters[mirrorIdx] == ".") {
              $letters[mirrorIdx] = "?";
            }
          }
        }
        setLetter(idx, event.key.toUpperCase());
        if ($currentCell?.direction == "across") {
          moveRight(idx);
        } else {
          moveDown(idx);
        }
      }
    } else if (event.code == "Backspace") {
      if ($letters[idx] == "." && lockMode) {
        event.preventDefault();
      } else {
        setLetter(idx, "?");
        if (mirrorMode && !playMode) {
          if ($letters[mirrorIdx] == ".") {
            $letters[mirrorIdx] = "?";
          }
        }
        if ($currentCell.direction == "down") {
          moveDown(idx, -1);
        } else {
          moveRight(idx, -1);
        }
        event.preventDefault();
      }
    } else if (event.key == "*") {      
      $circles[idx] = !$circles[idx];      
    } else if (event.code == "ArrowLeft" || event.code == "ArrowRight") {
      if ($currentCell.direction != "across") {
        let { cn, rn } = getInfo(idx);
        $currentCell.direction = "across";
        event.target.select();
        updateActiveWord(idx);
      } else {
        moveRight(idx, (event.code == "ArrowRight" && 1) || -1);
      }
    } else if (event.code == "ArrowDown" || event.code == "ArrowUp") {
      if ($currentCell.direction != "down") {
        let { cn, rn } = getInfo(idx);
        $currentCell.direction = "down";
        event.target.select();
        updateActiveWord(idx);
      } else {
        moveDown(idx, (event.code == "ArrowDown" && 1) || -1);
      }
    } else if (event.code == "Tab") {      
      if (activeWord) {
        let nextWordIndex;
        if (event.shiftKey) {
          nextWordIndex = activeWord.index - 1;
        } else {
          nextWordIndex = activeWord.index + 1;
        }
        let wordList = $downs;
        if (activeWord.type == "across") {
          wordList = $acrosses;
        }
        if (wordList.length <= nextWordIndex) {
          nextWordIndex = 0;
        } else if (nextWordIndex < 0) {
          nextWordIndex = wordList.length - 1;
        }
        let nextWord = wordList[nextWordIndex];
        if ($currentCell.direction == "across") {
          moveRight(nextWord.indices[0], 0);
        } else {
          moveDown(nextWord.indices[0], 0);
        }
        event.preventDefault();
      } else {
        console.log("no word, weird");
      }
    } else {
      console.log("Unhandled code", event.code);
    }
  }

  function range(n) {
    let a = [];
    for (let i = 0; i < n; i++) {
      a.push(i);
    }
    return a;
  }

  function getAcrossWord(idx) {
    return $acrosses.find((word: Word) => word.indices.indexOf(idx) > -1);
  }

  function getDownWord(idx) {
    return $downs.find((word: Word) => word.indices.indexOf(idx) > -1);
  }

  let lockMode: boolean = false;
  let mirrorMode: boolean = true;
  let leftRightSymmetryMode: boolean = false;
  let title: string = "";
  let author: string = "";
  $: if (playMode) {
    lockMode = true;
  }

  let zoomPercentage = 1;
  let originalClientWidth = 0;

  let compressed;
  $: makeCompressed({
    letters: $letters,
    title,
    author,
    circles: $circles,
    x: $x,
    y: $y,
    clues: $clues,
  });

  function makeCompressed(puzzle) {
    let codec = JsonUrl("lzw");
    codec.compress(puzzle).then((result) => {
      compressed = result;
    });
  }
  let windowHeight;
  let windowWidth;
  let gridWidth = 300;
  const rightSize = 150;
  $: if (windowWidth - rightSize < windowHeight) {
    gridWidth = windowWidth - rightSize;    
  } else {
    gridWidth = windowHeight;    
  }
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

{#if mode == Mode.PLAY || mode == Mode.CONSTRUCT}
  <nav class="top-2">
    {#if mode == Mode.CONSTRUCT}
      <button
        on:click={() => {
          $letters = $letters.map(() => "?");
          $circles = [];
          $clues.across = $clues.across.map(() => "");
          $clues.down = $clues.down.map(() => "");
        }}>Clear All</button
      >
      <button
        on:click={() =>
          ($letters = $letters.map((l) => (l == "." && ".") || "?"))}
        >Clear Letters</button
      >
      <input type="checkbox" bind:checked={lockMode} /> Lock black
      <input type="checkbox" bind:checked={mirrorMode} />Mirror mode
      <input type="checkbox" bind:checked={leftRightSymmetryMode} />Left/Right
      <button on:click={p.updateMatches}>Update</button>
      <button on:click={() => solvePuzzle(p)}>Solve</button>
      {#if $autofill.length}<button
          on:click={() => {
            cancelSolve();
            $autofill = [];
          }}>Cancel</button
        >{/if}
      Min word:
      <input bind:value={$scoreCutoff} type="number" min="0" max="50" />
    {/if}
    <Saver bind:title bind:author />
    {#if compressed}
      <a target="_blank" href={`?${compressed}`}>Share</a>
    {/if}
    <button
      on:click={() => {
        zoomPercentage += 0.05;
      }}>+</button
    >
    <button
      on:click={() => {
        zoomPercentage = 1;
      }}
    >
      Fit
    </button>
    <button
      on:click={() => {
        zoomPercentage -= 0.05;
      }}>-</button
    >

    <DownloadButton
      content={createPuzzleFile(
        $letters,
        $x,
        $y,
        $clues,
        title,
        author,
        $circles
      )}
      filename={`${
        title || new Date().toLocaleDateString().replace(/\//g, "-")
      }.txt`}>Download Acrosslite</DownloadButton
    >
  </nav>
  <div class="titlebar">
    {#if playMode}
      <h3>{title || "Untitled"}</h3>
      by<span class="author">{author}</span>
    {:else}
      <input bind:value={title} placeholder="Title" class="title" /> by
      <input placeholder="Author" class="author" bind:value={author} />
    {/if}
  </div>
  <div
    class="sbs"
    bind:clientWidth={fullWidth}
    style="--grid-width:{gridWidth}px;
  --grid-max:{gridLetterSize};
  --size:{(gridWidth * zoomPercentage) / (gridLetterSize * 3)}px"
  >
    {#each [{ $x, $y }] as newGrid}
      <section class={`grid size-${size}`}>
        {#each range($y) as rn (rn)}
          <div class="row">
            {#each range($x) as cn (cn)}
              <div class="inputwrapper" class:circle={$circles[p.idx(rn, cn)]}>
                <!-- Fix me -->
                <span class="number">
                  {$numbers[p.idx(rn, cn)] || ""}
                </span>
                {#if playMode}
                  <input
                    class="square"
                    class:solid={$letters[p.idx(rn, cn)] == "."}
                    class:active={activeWord?.indices?.indexOf(p.idx(rn, cn)) >
                      -1}
                    on:focus={onFocus}
                    on:keydown={onKeyDown}
                    item={p.idx(rn, cn)}
                    bind:value={$answers[p.idx(rn, cn)]}
                  />
                {:else}
                  <input
                    class="square"
                    class:solid={$letters[p.idx(rn, cn)] == "."}
                    class:active={activeWord?.indices?.indexOf(p.idx(rn, cn)) >
                      -1}
                    class:missing={$letters[p.idx(rn, cn)] == "?"}
                    class:short={getAcrossWord(p.idx(rn, cn), $acrosses)
                      ?.indices?.length < 3 ||
                      getDownWord(p.idx(rn, cn), $downs)?.indices?.length < 3}
                    on:focus={onFocus}
                    on:keydown={onKeyDown}
                    item={p.idx(rn, cn)}
                    bind:value={$letters[p.idx(rn, cn)]}
                  />
                  {#if $letters[p.idx(rn, cn)] == "?" && $possibleLetters[p.idx(rn, cn)]?.across}
                    <span class="possible">
                      {#each [...$possibleLetters[p.idx(rn, cn)].across].filter( (l) => $possibleLetters[p.idx(rn, cn)].down?.has(l) ) as letter}
                        {letter}
                      {:else}
                        <span class="warning">No match </span>
                      {/each}
                    </span>
                    {#if $autofill[p.idx(rn, cn)] && $autofill[p.idx(rn, cn)] != "?"}
                      <span class="autofill">
                        {$autofill[p.idx(rn, cn)]}
                      </span>
                    {/if}
                  {/if}
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </section>
    {/each}
    <section class="words">
      <WordLists {playMode} />
    </section>
  </div>
{:else if mode == Mode.SOLUTION}
  <PrintSubmission {author} {title} />
{:else if mode == Mode.PRINT}
  <PrintPuzzle {author} {title} />
{/if}

<style>
  .grid {
    font-size: var(--size);
  }
  /* .size-1 {
    font-size: 16pt;
    --size : 16pt;
  }
  .size-2 {
    font-size: 30pt;
    --size : 30pt;
  }
  .size-3 {
    font-size: 40pt;
    --size: 40pt;
  }
 */
  nav {
    display: flex;
    flex-direction: row;
    margin-left: auto;
    margin-right: auto;
    font-size: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .top-2 {
    position: sticky;
    top: 32px;
    background-color: white;
    z-index: 3;
  }

  nav > :global(*) {
    margin-right: 0.5em;
    margin-left: 0.5em;
  }

  .sbs {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    max-width: 100%;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 100vh;
    overflow-y: scroll;
  }
  section.words {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 20%;
    margin-left: 1em;
    align-items: start;
  }
  section.grid {
    flex-basis: 75%;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  input.square {
    width: 2em;
    height: 2em;
    margin: 0;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    border-left: none;
    border-top: none;
    border-radius: 0;
  }
  .inputwrapper:first-child input.square {
    border-left: 1px solid black;
  }
  .row:first-child input.square {
    border-top: 1px solid black;
  }

  input.active {
    background-color: #ffffaa;
  }
  input.active:focused {
    background-color: #ffff00;
    font-weight: bold;
  }
  input.missing {
    color: #ddd;
  }

  input.solid {
    background-color: black;
  }
  input.short {
    background-color: #ffdd88;
  }

  .inputwrapper {
    position: relative;
  }

  .number {
    position: absolute;
    pointer-events: none;
    top: 2px;
    left: 2px;
    font-size: calc(var(--size) / 2);
  }

  .circle {
    position: relative;
  }
  .circle::before {
    display: block;
    content: " ";
    width: 2em;
    height: 2em;
    position: absolute;
    border-radius: 50%;
    border: 1px solid grey;
    pointer-events: none;
  }
  .possible {
    position: absolute;
    right: 2px;
    top: 2px;
    font-size: calc(var(--size) / 3);
    color: #8af;
    word-break: break-all;
    max-width: calc(1.3 * var(--size));
    max-height: calc(2 * var(--size));
    overflow-y: scroll;
    pointer-events: none;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .possible::-webkit-scrollbar {
    display: none;
  }

  .warning {
    color: #822;
    font-weight: bold;
  }
  .titlebar {
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .titlebar > * {
    margin-right: 1em;
  }
  .author {
    font-style: italic;
  }
  .autofill {
    font-weight: bold;
    font-size: var(--size);
    color: purple;
    position: absolute;
    z-index: 3;
    pointer-events: none;
    width: 2em;
    height: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    top: 0;
    left: 0;
  }
  @media print {
    nav {
      display: none;
    }
    .size-1 {
      font-size: 36pt;
    }
    .size-2 {
      font-size: 14pt;
    }
    .size-3 {
      font-size: 11pt;
    }
    .possible {
      display: none;
    }
    .words {
      font-size: 9pt;
    }
    input.active {
      background-color: initial;
    }
    input:focused {
      background-color: initial;
    }
  }
</style>
