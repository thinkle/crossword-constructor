<script type="ts">
  import PrintGrid from "./PrintGrid.svelte";

  export let author;
  export let title;
  import { getContext, onDestroy } from "svelte";
  import type { PuzzleContext } from "./puzzleStore";
  let interval;

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  let p: PuzzleContext = getContext("puzzleContext");
  let { x, y, letters, circles, numbers, acrosses, downs, clues, words } = p;

  function range(n) {
    let a = [];
    for (let i = 0; i < n; i++) {
      a.push(i);
    }
    return a;
  }

  let c1: HTMLDivElement,
    c2: HTMLDivElement,
    c3: HTMLDivElement,
    c4: HTMLDivElement;
  let clueDiv: HTMLDivElement;

  let moved = false;
  $: if (!moved && c1 && c2 && c3 && c4 && clueDiv) {
    moveClues();
  }
  function moveClues() {
    const cols = [c1, c1, c2, c3, c4];
    //console.log("Time to move clues!");
    //console.log(clueDiv.children.length);
    // first approximation, divide into fifths...
    let fifth = clueDiv.children.length / 5;
    let moved = 0;
    // initially, just distribute the clues roughly evenly...
    while (clueDiv.children.length) {
      let child = clueDiv.children[0];
      let colNum = Math.floor(moved / fifth);
      let col = cols[colNum];
      if (!col) {
        col = cols[cols.length - 1];
      }
      col.appendChild(child);
      moved += 1;
      //console.log("Moved ", moved, "to column", colNum, col);
    }
    // Now try to adjust...
    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(adjustByOne, 200);
    /* setTimeout(() => {
      clearInterval(i);
    }, 2000); */
  }

  function adjustByOne() {
    let cols = [c1, c2, c3, c4];
    let bottoms = cols.map(
      (c) => c.lastChild && c.lastChild.getBoundingClientRect().bottom
    );
    let bottomest = Math.max(...bottoms);
    let bottomestCol = cols[bottoms.indexOf(bottomest)];
    //console.log(bottoms, bottomest, bottomestCol);
    if (bottomestCol == c1) {
      moveTextRight(c1, c2);
    } else if (bottomestCol == c4) {
      moveTextLeft(c4, c3);
    } else {
      let idx = cols.indexOf(bottomestCol);
      if (bottoms[idx + 1] < bottoms[idx - 1]) {
        moveTextRight(bottomestCol, cols[idx + 1]);
      } else {
        moveTextLeft(bottomestCol, cols[idx - 1]);
      }
    }

    // now grab the shortest one...
    bottoms = cols.map(
      (c) => c.lastChild && c.lastChild.getBoundingClientRect().bottom
    );
    let toppest = Math.min(...bottoms);
    let toppestCol = cols[bottoms.indexOf(toppest)];
    if (toppestCol == c1) {
      moveTextLeft(c2, c1);
    } else if (toppestCol == c4) {
      moveTextRight(c3, c4);
    } else {
      let idx = cols.indexOf(toppestCol);
      if (bottoms[idx + 1] > bottoms[idx - 1]) {
        moveTextLeft(cols[idx + 1], toppestCol);
      } else {
        moveTextRight(cols[idx - 1], toppestCol);
      }
    }

    function moveTextLeft(fromCol: HTMLDivElement, toCol: HTMLDivElement) {
      toCol.appendChild(fromCol.children[0]);
    }

    function moveTextRight(fromCol: HTMLDivElement, toCol: HTMLDivElement) {
      toCol.prepend(fromCol.children[fromCol.children.length - 1]);
    }
  }
  let fontSize = ($x <= 15 && 11) || 7;
</script>

<label class="noprint"
  >Clue Size: <input
    type="number"
    min="1"
    max="24"
    bind:value={fontSize}
  /></label
>
{#key { $x, $y, $letters, $clues }}
  <article class="printout">
    <div class="page" style={`--font-size:${fontSize}pt`}>
      <div class="outline" />
      <div class="info">
        <span contenteditable="true" bind:textContent={author} />
        <span>
          &ldquo;<span contenteditable="true" bind:textContent={title} />
          &rdquo;
        </span>
      </div>
      <div class="puzzleLayout">
        <div class="grid">
          <PrintGrid small={true} fillGrid={false} />
        </div>
        <div bind:this={c1} class="c1" />
        <div bind:this={c2} class="c2" />
        <div bind:this={c3} class="c3" />
        <div bind:this={c4} class="c4" />
      </div>
      <div bind:this={clueDiv} class="clues">
        <h2>Across</h2>
        {#each $acrosses as across}
          <p>
            <span class="number">
              {$numbers[across.indices[0]]}.
            </span>
            <span
              class="clue"
              contenteditable
              bind:textContent={$clues.across[across.index]}
            />
          </p>
        {/each}

        <h2>Down</h2>
        {#each $downs as down}
          <p>
            <span class="number">
              {$numbers[down.indices[0]]}.
            </span>
            <span
              class="clue"
              contenteditable
              bind:textContent={$clues.down[down.index]}
            />
          </p>
        {/each}
      </div>
    </div>
  </article>
{/key}

<style>
  @media print {
    @page {
      size: letter;
      margin-bottom: 0.5in;
      margin-top: 0.5in;
    }
    .noprint {
      display: none;
    }
    .outline {
      display: none;
    }
  }
  label {
    width: 200px;
    margin: auto;
    height: 100px;
  }
  h2 {
    margin-bottom: 0px;
    font-size: calc(1.4 * var(--font-size));
  }
  .float {
    float: left;
  }
  .page {
    flex-direction: column;
    page-break-before: always;
    page-break-after: always;
    margin: auto;
    max-width: 8in;
    min-height: 8in;
    position: relative;
  }
  .outline {
    position: absolute;
    pointer-events: none;
    top: -0.5in;
    left: -0.25in;
    width: 8.5in;
    height: 11in;
    border: 3px solid #ababab;
  }
  p {
    margin-top: 0;
    margin-bottom: 0;
    font-size: var(--font-size);
    text-indent: -2em;
    margin-left: 2em;
  }
  .clue {
    padding-left: 0.5em;
  }
  .info p {
    margin-top: 0.25pt;
    margin-bottom: 0.25pt;
  }

  .puzzleLayout {
    display: grid;
    grid-template-areas:
      "c1 g g g"
      "c1 c2 c3 c4";
    grid-template-columns: 25% 25% 25% 25%;
  }
  .c1 {
    grid-area: c1;
  }
  .c2 {
    grid-area: c2;
  }
  .c3 {
    grid-area: c3;
  }
  .c4 {
    grid-area: c4;
  }
  .grid {
    grid-area: g;
    align-items: center;
    justify-content: center;
    display: flex;
    align-self: center;
    justify-self: center;
  }
</style>
