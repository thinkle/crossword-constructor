<script lang="ts">
  import { tick, setContext, getContext } from "svelte";
  import { writable } from "svelte/store";
  import { makePuzzleStore } from "./puzzleStore";
  import type { PuzzleContext } from "./puzzleStore";
  import { solvePuzzle } from "./solver";
  import type { Word } from "./puzzleStore";
  import WordLists from "./WordLists.svelte";
  import DownloadButton from "./DownloadButton.svelte";
  import Saver from "./Saver.svelte";
  import { createPuzzleFile } from "./acrosslite";
  export let playMode;
  export let xsize: number;
  export let ysize: number;
  export let initialLetters = [];
  let widthDelta = 200;
  let fullWidth = 0;
  let gridLetterSize = 4;
  $: gridLetterSize = Math.max($x, $y);
  let size = 2;
  let p: PuzzleContext = makePuzzleStore(initialLetters, xsize, ysize);
  console.log("Made magic", p);
  setContext("puzzleContext", p);
  let {
    x,
    y,
    numbers,
    letters,
    possibleLetters,
    clues,
    acrosses,
    downs,
    currentCell,
    autoMode,
    scoreCutoff,
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
    console.log("key?", event.key);
    return event.key.length == 1 && event.key.match(/[A-Za-z.]/);
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
    console.log("get next by word", word);
    let { rn, cn } = getInfo(idx);
    let rawNext = (rn + amount) * $x + cn;
    if (word.indices.indexOf(rawNext) > -1) {
      return rawNext;
    } else {
      /* Ok we are switching words... */
      let currentWordNumber = $numbers[word.indices[0]];
      console.log("cw# = ", currentWordNumber);
      let nextWord;
      let firstWord;
      for (let w of $downs) {
        let wordNumber = $numbers[w.indices[0]];
        console.log("Compare to ", wordNumber);
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
              console.log("Sure");
            } else {
              if ($numbers[w.indices[0]] < $numbers[nextWord.indices[0]]) {
                nextWord = w;
                console.log("Sure");
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
        console.log("Have next word", nextWord);
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
        console.log("getNextDownSquareByWord Oops? fallback");
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
      console.log("In word", word);
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
      event.preventDefault();
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
      console.log("Tab!", event);
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
  $: if (fullWidth != originalClientWidth) {
    let roomLeft = originalClientWidth - 200;
    if (roomLeft > 0) {
      zoomPercentage = roomLeft / fullWidth;
    } else {
      zoomPercentage = 1;
    }
  }
</script>

<nav>
  {#if !playMode}
    <button on:click={() => ($letters = $letters.map(() => "?"))}
      >Clear All</button
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
    <button
      on:click={() => {
        zoomPercentage += 0.05;
      }}>+</button
    >
    <button
      on:click={() => {
        zoomPercentage -= 0.05;
      }}>-</button
    >
    Min word: <input bind:value={$scoreCutoff} type="number" min="0" max="50" />
    <Saver bind:title bind:author />
  {/if}
  <DownloadButton
    content={createPuzzleFile($letters, $x, $y, $clues, title, author)}
    filename={`${new Date().toLocaleDateString().replace(/\//g, "-")}.txt`}
    >Download Acrosslite</DownloadButton
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
  style="--grid-width:{fullWidth}px;
  --grid-max:{gridLetterSize};
  --size:{(fullWidth * zoomPercentage) / (gridLetterSize * 3)}px"
>
  {#each [{ $x, $y }] as newGrid}
    <section class={`grid size-${size}`}>
      {#each range($y) as rn (rn)}
        <div class="row">
          {#each range($x) as cn (cn)}
            <div class="inputwrapper">
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
                  class:short={getAcrossWord(p.idx(rn, cn), $acrosses)?.indices
                    ?.length < 3 ||
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
    flex-grow: 1;
    flex-basis: 80%;
    max-height: 100vh;
    overflow-y: scroll;
  }
  section.words {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 20%;
    align-items: start;
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
  }
  .author {
    font-style: italic;
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
