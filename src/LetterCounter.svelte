<script type="ts">
  let counts: { word: string; count: number }[] = [];
  let text = "";

  $: analyzeText(text);

  function analyzeText(text) {
    let lines = text.split("\n");
    counts = lines.map((l) => {
      let word = l.replace(/[^A-Za-z]/g, "").toUpperCase();
      return { word, count: word.length };
    });
  }

  function sort() {
    let lines = text.split("\n");
    lines.sort(
      (a, b) =>
        b.replace(/[^A-Za-z]/g, "").length - a.replace(/[^A-Za-z]/g, "").length
    );
    text = lines.join("\n");
  }
</script>

<button on:click={sort}>Sort Words</button>

<div>
  <textarea
    placeholder="Just type words here and hit return"
    bind:value={text}
  />
  <table>
    {#each counts as count}
      <tr>
        <td>{count.word}</td>
        <td>{count.count}</td>
      </tr>
    {/each}
  </table>
</div>

<style>
  div {
    display: flex;
  }
  textarea {
    width: 40vw;
    height: 300px;
    border: 1px solid #aaa;
  }
</style>
