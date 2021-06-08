<script type="ts">
  import PrintGrid from "./PrintGrid.svelte";

  export let author;
  export let title;
  import { getContext } from "svelte";
  import type { PuzzleContext } from "./puzzleStore";

  let p: PuzzleContext = getContext("puzzleContext");
  let { x, y, letters, circles, numbers, acrosses, downs, clues, words } = p;

  function range(n) {
    let a = [];
    for (let i = 0; i < n; i++) {
      a.push(i);
    }
    return a;
  }
</script>

{#key { $x, $y }}
  <article class="printout">
    <div class="page">
      <div class="info">
        <p contenteditable="true" bind:textContent={author} />
        <p>
          &ldquo;<span contenteditable="true" bind:textContent={title} />
          &rdquo;
        </p>
        <p contenteditable="true">10 Maple Rd.</p>
        <p contenteditable="true">Westford, MA 01886</p>
        <p contenteditable="true">tmhinkle@gmail.com</p>
      </div>
      <PrintGrid />
    </div>
    <div class="page">
      <h2>Across</h2>
      <table>
        {#each $acrosses as across}
          <tr>
            <td class="number">
              {$numbers[across.indices[0]]}.
            </td>
            <td class="answer">
              {across.word}
            </td>
            <td
              class="clue"
              contenteditable
              bind:textContent={$clues.across[across.index]}
            />
          </tr>
        {/each}
      </table>
      <h2>Down</h2>
      <table>
        {#each $downs as down}
          <tr>
            <td class="number">
              {$numbers[down.indices[0]]}.
            </td>
            <td class="answer">
              {down.word}
            </td>
            <td
              class="clue"
              contenteditable
              bind:textContent={$clues.down[down.index]}
            />
          </tr>
        {/each}
      </table>
    </div>
  </article>
{/key}

<style>
  @media print {
    @page {
      size: letter;
      margin-bottom: 1in;
      margin-top: 1in;
    }
  }
  .page {
    display: flex;
    flex-direction: column;
    page-break-before: always;
    page-break-after: always;
    margin: auto;
    max-width: 7in;
    min-height: 8in;
  }

  tr > td {
    padding-top: 1em;
  }
  .number {
    padding-right: 1em;
  }
  .clue {
    padding-left: 2em;
  }
  .info p {
    margin-top: 0.25pt;
    margin-bottom: 0.25pt;
  }
</style>
