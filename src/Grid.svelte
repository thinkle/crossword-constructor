<script lang="ts">
  import { tick } from "svelte";
  import WordLists from "./WordLists.svelte";
  export let playMode;
  export let x: number;
  export let y: number;
  export let letters = [];

  let size = 1;

  $: if (x * y > 64) {
    size = 2;
  } else if (x * y > 400) {
    size = 1;
  } else {
    size = 3;
  }

  $: if (letters.length != x * y) {
    letters = letters.slice(0, x * y);
    while (letters.length < x * y) {
      letters.push("");
    }
  }

  function oneCap(s) {
    s.replace("?", "");
    if (s == ".") {
      return ".";
    } else {
      if (s.length > 1) {
        return s[s.length - 1].toUpperCase();
      } else {
        return s.toUpperCase() || "?";
      }
    }
  }
  $: letters = letters.map(oneCap);
  let ROW = 1;
  let COL = 2;
  let mode: ROW | COL = ROW;
  let activeCol: number | null = null;
  let activeRow: number | null = null;

  $: if (mode == ROW) {
    activeCol = null;
  }
  $: if (mode == COL) {
    activeRow = null;
  }

  function isInput(event) {
    return event.code.indexOf("Key") > -1 || event.code == "Period";
  }

  function onFocus(event) {
    let idx = Number(event.target.getAttribute("item"));
    let cn = idx % x;
    let rn = Math.floor(idx / x);
    if (mode == ROW) {
      activeRow = rn;
    } else {
      activeCol = cn;
    }
    event.target.select();
  }

  function getInfo(idx) {
    return {
      cn: idx % x,
      rn: Math.floor(idx / x),
    };
  }

  function getInput(idx) {
    return document.querySelector(`input[item="${idx}"]`);
  }

  function moveRight(idx, amount = 1) {
    let { cn, rn } = getInfo(idx);
    let next = rn * x + cn + amount;
    if (next >= x * y) {
      next = 0;
    }
    if (next < 0) {
      next = x * y - 1;
    }
    let input = getInput(next);
    input.focus();
    input.select();
  }

  function moveDown(idx, amount = 1) {
    let { rn, cn } = getInfo(idx);
    let next = (rn + amount) * x + cn;
    if (next >= x * y) {
      if (cn < x - 1) {
        next = cn + 1;
      } else {
        next = 0;
      }
    }
    let input = getInput(next);
    input.focus();
    input.select();
  }

  function onKeyUp(event) {
    let idx = Number(event.target.getAttribute("item"));
    if (isInput(event)) {
      if (mode == ROW) {
        moveRight(idx);
      } else {
        // COL MODE
        moveDown(idx);
      }
    } else if (event.code == "ArrowLeft" || event.code == "ArrowRight") {
      if (mode != ROW) {
        let { cn, rn } = getInfo(idx);
        mode = ROW;
        activeRow = rn;
        event.target.select();
      } else {
        moveRight(idx, (event.code == "ArrowRight" && 1) || -1);
      }
    } else if (event.code == "ArrowDown" || event.code == "ArrowUp") {
      if (mode != COL) {
        let { cn, rn } = getInfo(idx);
        mode = COL;
        activeCol = cn;
        event.target.select();
      } else {
        moveDown(idx, (event.code == "ArrowDown" && 1) || -1);
      }
    }
  }

  function range(n) {
    let a = [];
    for (let i = 0; i < n; i++) {
      a.push(i);
    }
    return a;
  }
  let indices = {};

  function convertDownToAcross(idx) {
    let cn = Math.floor(idx / y);
    let rn = idx % y;
    return rn * x + cn;
  }

  function updateIndices(wordIndices) {
    indices = {};
    for (let value of Object.values(wordIndices.across)) {
      indices[value.characterIndex] = { across: value };
    }
    for (let value of Object.values(wordIndices.down)) {
      let idx = convertDownToAcross(value.characterIndex);
      if (!indices[idx]) {
        indices[idx] = {};
      }
      indices[idx].down = value;
    }
    let keys = Object.keys(indices);
    keys.sort((a, b) => Number(a) - Number(b));
    let count = 1;
    for (let key of keys) {
      indices[key].number = count;
      if (indices[key].across) indices[key].across.number = count;
      if (indices[key].down) indices[key].down.number = count;
      count += 1;
    }
  }

  let matchInfoByIndex = [];

  async function updateMatches(metadata: {
    characterIndex: number;
    type: "across" | "down";
    matches: string[];
  }) {
    await tick();
    console.log("Grid.updateMatches", metadata);
    let idx = metadata.characterIndex;
    if (metadata.type == "down") {
      idx = convertDownToAcross(metadata.characterIndex);
    }
    if (!matchInfoByIndex[idx]) {
      matchInfoByIndex[idx] = {
        across: {},
        down: {},
      };
    }
    matchInfoByIndex[idx][metadata.type] = metadata;
  }

  let possibleLettersByIndex = [];
  $: updatePossibleLeters(matchInfoByIndex);

  function updatePossibleLeters(matchInfoByIndex) {
    for (let idx = 0; idx < matchInfoByIndex.length; idx++) {
      //console.log("look at", idx, matchInfoByIndex[idx]);
      let wordMatches = matchInfoByIndex[idx];
      if (wordMatches) {
        if (wordMatches.across && wordMatches.across.matches) {
          //console.log("Add word across", wordMatches.across);
          if (!wordMatches.across.matches.map) {
            console.log("WTF IS UP WITH", wordMatches);
          }
          for (
            let letter = 0;
            letter < wordMatches.across.word.length;
            letter++
          ) {
            if (!possibleLettersByIndex[letter + idx]) {
              possibleLettersByIndex[letter + idx] = {};
            }
            possibleLettersByIndex[letter + idx].across = Array.from(
              new Set(wordMatches.across.matches.map((s) => s[letter]))
            );
          }
        }
        if (wordMatches.down && wordMatches.down.matches) {
          //console.log("Add match down", wordMatches.down);
          for (
            let letter = 0;
            letter < wordMatches.down.word.length;
            letter++
          ) {
            let letterIndex = idx + letter * x;
            if (!possibleLettersByIndex[letterIndex]) {
              possibleLettersByIndex[letterIndex] = {};
            }
            possibleLettersByIndex[letterIndex].down = new Set(
              wordMatches.down.matches.map((s) => s[letter])
            );
          }
        }
      }
    }
  }

  const intersection = (a, b) => new Set([...a].filter((x) => b.has(x)));
  $: console.log(possibleLettersByIndex);
</script>

<div class="sbs">
  {#each [{ x, y }] as newGrid}
    <section class={`size-${size}`}>
      {#each range(y) as rn (rn)}
        <div class="row">
          {#each range(x) as cn (cn)}
            <div class="inputwrapper">
              {#if indices[rn * x + cn]}
                <span class="number">
                  {indices[rn * x + cn].number}.
                </span>
              {/if}
              {#if playMode}
                <input
                  class:solid={letters[rn * x + cn] == "."}
                  class:active={rn == activeRow || cn == activeCol}
                  on:focus={onFocus}
                  on:keyup={onKeyUp}
                  item={rn * x + cn}
                />
              {:else}
                <input
                  class:solid={letters[rn * x + cn] == "."}
                  class:active={rn == activeRow || cn == activeCol}
                  on:focus={onFocus}
                  on:keyup={onKeyUp}
                  item={rn * x + cn}
                  bind:value={letters[rn * x + cn]}
                />
                {#if letters[rn * x + cn] == "?" && possibleLettersByIndex[rn * x + cn]?.across}
                  <span class="possible">
                    {#each possibleLettersByIndex[rn * x + cn].across as acrossLetter}
                      {#if possibleLettersByIndex[rn * x + cn].down?.has(acrossLetter)}
                        {acrossLetter}
                      {/if}
                    {/each}
                  </span>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      {/each}
      <button on:click={() => (letters = letters.map(() => "?"))}>Clear</button>
    </section>
  {/each}
  <section class="words">
    <WordLists
      {playMode}
      {letters}
      width={x}
      getMatches={updateMatches}
      getWordIndices={updateIndices}
    />
  </section>
</div>

<style>
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
  input {
    width: 2em;
    height: 2em;
    margin: 0;
  }

  input.active {
    background-color: #ffffaa;
  }

  input:focused {
    background-color: #ffff00;
    font-weight: bold;
  }
  input.solid {
    background-color: black;
  }

  .size-1 {
    font-size: 1rem;
  }
  .size-2 {
    font-size: 2rem;
  }
  .size-3 {
    font-size: 3rem;
  }

  .inputwrapper {
    position: relative;
  }

  .number {
    position: absolute;
    pointer-events: none;
    top: 2px;
    left: 2px;
    font-size: small;
  }

  .possible {
    position: absolute;
    right: 2px;
    top: 2px;
    font-size: xx-small;
    color: grey;
    word-break: break-all;
    max-width: 1rem;
  }
  .size-2 .possible {
    max-width: 2rem;
  }
  .size-3 .possible {
    max-width: 3rem;
  }
</style>
