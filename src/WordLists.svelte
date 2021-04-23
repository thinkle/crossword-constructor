<script type="ts">
  import Words from "./Words.svelte";

  export let letters: string[] = [];
  export let width;
  export let getWordIndices = (indices) => {};
  export let getMatches = (matches) => {};
  export let playMode;
  let columns = [];
  let rows = [];
  let acrosses = [];
  let downs = [];
  let indices = {
    across: {},
    down: {},
  };
  $: processLetters(letters, width);
  $: acrosses = getWords(rows, "across");
  $: downs = getWords(columns, "down");

  function onAcrossMatch(word, metadata, matches) {
    //console.log("Across", word, metadata, matches);
    metadata.matches = matches;
    metadata.type = "across";
    metadata.word = word;
    getMatches(metadata);
  }
  function onDownMatch(word, metadata, matches) {
    //console.log("Down", word, metadata, matches);
    metadata.matches = matches;
    metadata.type = "down";
    getMatches(metadata);
  }

  function getWords(rows: string[][][], indexName) {
    indices[indexName] = {};
    let index = indices[indexName];
    let n = 0;
    let rowCount = 0;
    let words = [];
    for (let row: string of rows) {
      let rowString = row.join("");
      let rowIndex = rowCount * row.length;
      let rowWords = row
        .join("")
        .split(".")
        .filter((w) => w);
      words = [...words, ...rowWords];
      // get indices...
      let characterIndex = rowIndex + rowString.search(/[^.]/);
      for (
        let wordIndex = words.length - rowWords.length;
        wordIndex < words.length;
        wordIndex++
      ) {
        index[wordIndex] = {
          characterIndex,
          wordIndex,
          word: words[wordIndex],
        };
        characterIndex =
          rowIndex + rowString.indexOf(".", characterIndex - rowIndex) + 1;
      }
      rowCount += 1;
    }
    if (getWordIndices) {
      getWordIndices(indices);
    }
    return words;
  }

  function processLetters(letters) {
    let total = letters.length;
    let rowStart = 0;
    rows = [];
    while (rowStart < total) {
      let row = letters.slice(rowStart, rowStart + width);
      rowStart = rowStart + width;
      rows.push(row);
    }
    let height = letters.length / width;
    columns = [];
    for (let cn = 0; cn < width; cn++) {
      let column = [];
      for (let rn = 0; rn < height; rn++) {
        let idx = cn + rn * width;
        column.push(letters[idx]);
      }
      columns.push(column);
    }
    columns = columns;
    rows = rows;
  }
</script>

<div>
  <h3>Acrosses</h3>
  <Words
    {playMode}
    indices={indices.across}
    words={acrosses}
    onMatch={onAcrossMatch}
  />
</div>
<div>
  <h3>Downs</h3>
  <Words
    {playMode}
    indices={indices.down}
    words={downs}
    onMatch={onDownMatch}
  />
</div>
