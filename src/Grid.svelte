<script lang="ts">
  import { tick, setContext, getContext } from "svelte";
  import { makePuzzleStore } from "./puzzleStore";
  import type {Word} from './puzzleStore'
  import WordLists from "./WordLists.svelte";
  import DownloadButton from './DownloadButton.svelte';
  import Saver from './Saver.svelte';
  import {createPuzzleFile} from './acrosslite'
  export let playMode;
  export let xsize: number;
  export let ysize: number;
  export let initialLetters = [];
  let size = 2;
  let p = makePuzzleStore(initialLetters, xsize, ysize);
  console.log('Made magic',p)
  setContext("puzzleContext", p);
  let {
    x, y, numbers, letters, possibleLetters,
    clues, acrosses, downs
  } = p;

  console.log('Initial store values',
    $x,$y,$numbers,$letters,$possibleLetters,$clues
  )

  $: console.log('Possible letters:',$possibleLetters)
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
      $letters.push('?');
    }
    // Wait to change otherwise we do tons of extra work as we go
    $letters = $letters;
  }
  
  let ROW = 1;
  let COL = 2;
  let mode: ROW | COL = ROW;
  let activeCol: number | null = null;
  let activeRow: number | null = null;
  let activeWord : Word | null = null;
  $: if (mode == ROW) {
    activeCol = null;
  }
  $: if (mode == COL) {
    activeRow = null;
  }

  function isInput(event) {
    console.log('key?',event.key)
    return event.key.length==1 && event.key.match(/[A-Za-z.]/)
  }

  function updateActiveWord (idx) {
    if (mode == ROW) {
      activeWord = $acrosses.find(
        (word : Word)=>word.indices.indexOf(idx)>-1
      )
    } else {
      activeWord = $downs.find(
        (word : Word)=>word.indices.indexOf(idx)>-1
      );
    }
  }

  function onFocus(event) {
    let idx = Number(event.target.getAttribute("item"));
    let cn = idx % x;
    let rn = Math.floor(idx / $x);
    updateActiveWord(idx)
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
    let input = getInput(next);
    input.focus();
    input.select();
  }

  function moveDown(idx, amount = 1) {
    let { rn, cn } = getInfo(idx);
    let next = (rn + amount) * $x + cn;
    if (next >= $x * $y) {
      if (cn < $x - 1) {
        next = cn + 1;
      } else {
        next = 0;
      }
    }
    let input = getInput(next);
    input.focus();
    input.select();
  }

  function onKeyDown(event) {
    let idx = Number(event.target.getAttribute("item"));
    let { cn, rn } = getInfo(idx);
    let mirrorRn = $y - rn - 1;
    let mirrorCn = $x - cn - 1;
    let mirrorIdx = p.idx(mirrorRn,mirrorCn);
    if (isInput(event)) {      
      if (event.code=='Period') {
        console.log('Special case period!')        
        if ($letters[mirrorIdx]=='?') {
          $letters[mirrorIdx] = '.';
          console.log('Set ',mirrorIdx,'to .')
        }
      } else {
        if ($letters[mirrorIdx]=='.') {
          $letters[mirrorIdx] = '?';
        }
      }
      console.log('Set letter!',event);
      $letters[idx] = event.key
      if (mode == ROW) {
        moveRight(idx);
      } else {
        // COL MODE
        moveDown(idx);
      }
      event.preventDefault();
    } else if (event.code == "ArrowLeft" || event.code == "ArrowRight") {
      if (mode != ROW) {
        let { cn, rn } = getInfo(idx);
        mode = ROW;
        activeRow = rn;
        event.target.select();
        updateActiveWord(idx);
      } else {
        moveRight(idx, (event.code == "ArrowRight" && 1) || -1);
      }
    } else if (event.code == "ArrowDown" || event.code == "ArrowUp") {
      if (mode != COL) {
        let { cn, rn } = getInfo(idx);
        mode = COL;
        activeCol = cn;
        event.target.select();
        updateActiveWord(idx);
      } else {
        moveDown(idx, (event.code == "ArrowDown" && 1) || -1);
      }
    } else if (event.code == 'Backspace') {   
      $letters[idx] = '?'   
      if ($letters[mirrorIdx]=='.') {
        $letters[mirrorIdx] = '?';
      }
      if (mode==COL) {
        moveDown(idx,-1);
      } else {
        moveRight(idx,-1);
      }
    } else if (event.code == 'Tab') {
      console.log("Tab!",event);
      if (activeWord) {
        let nextWordIndex;
        if (event.shiftKey) {
          nextWordIndex = activeWord.index - 1;
        } else { 
          nextWordIndex = activeWord.index + 1;
        }
        let wordList = $downs;
        if (activeWord.type=='across') {
          wordList = $acrosses 
        } 
        if (wordList.length <= nextWordIndex) {
          nextWordIndex = 0;
        } else if (nextWordIndex < 0) {
          nextWordIndex = wordList.length - 1;
        }
        let nextWord = wordList[nextWordIndex];
        if (mode==ROW) {
          moveRight(nextWord.indices[0],0);
        } else {
          moveDown(nextWord.indices[0],0);
        }
        event.preventDefault();
      } else {
        console.log('no word, weird')
      }
    } else {
      console.log('Unhandled code',event.code)
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
    let cn = Math.floor(idx / $y);
    let rn = idx % $y;
    return rn * $x + cn;
  }

</script>

<div class="sbs">
  {#each [{ $x , $y }] as newGrid}
    <section class={`size-${size}`}>      
      <nav>
        {#if !playMode}
        <button on:click={() => ($letters = $letters.map(() => "?"))}>Clear</button>
        <button on:click={p.updateMatches}>Update</button>
        <Saver/>
        {/if}
        <DownloadButton
          content={createPuzzleFile($letters,$x,$y,$clues)}
          filename={`${new Date().toLocaleDateString().replace(/\//g,'-')}.txt`}
        >Download Acrosslite</DownloadButton>        
      </nav>     
      {#each range($y) as rn (rn)}
        <div class="row">
          {#each range($x) as cn (cn)}
            <div class="inputwrapper">
              <!-- Fix me -->
              <span class="number">
                {$numbers[p.idx(rn,cn)]||''}
              </span>
              {#if playMode}
                <input
                  class:solid={$letters[p.idx(rn,cn)] == "."}
                  class:active={activeWord?.indices?.indexOf(p.idx(rn,cn))>-1}
                  on:focus={onFocus}
                  on:keydown={onKeyDown}
                  item={p.idx(rn,cn)}
                />
              {:else}
                <input
                  class:solid={$letters[p.idx(rn,cn)] == "."}
                  class:active={activeWord?.indices?.indexOf(p.idx(rn,cn))>-1}
                  on:focus={onFocus}
                  on:keydown={onKeyDown}
                  item={p.idx(rn,cn)}
                  bind:value={$letters[p.idx(rn,cn)]}
                />
                {#if $letters[p.idx(rn,cn)] == "?" && $possibleLetters[p.idx(rn,cn)]?.across}
                  <span class="possible">                    
                    {#each [...$possibleLetters[p.idx(rn,cn)].across].filter((l)=>$possibleLetters[p.idx(rn,cn)].down?.has(l)) as letter}
                        {letter}
                    {:else}
                      <span class="warning">No match                      
                      </span>
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
    <WordLists
      {playMode}
    />
  </section>
</div>

<style>

  nav {
    display: flex;
    flex-direction: row;
    margin: auto;
    font-size: 1rem;
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
  .warning {
    color: #822;
    font-weight: bold;
  }

  @media print {
    nav {
      display: none;
    }
    .size-1 {
      font-size: 32pt;
    }
    .size-2 {
      font-size: 14pt;
    }
    .size-3 {
      font-size: 11pt;
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
