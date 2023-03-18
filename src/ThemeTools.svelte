<script lang="typescript">
  import { words, scores } from "./findMatches";

  let pattern;
  let fun = `
    function (words) {
      // Create our function based on all words...
      return function (word) {
        // This is a filter function run once per word...
        // So we can look for any kind of relationship / pattern we want...

      }
    }
  `;
  fun = `function (words) {
    // Create our function based on all words...
    let wordsByLength = {};
    console.log('Get words by length');
    for (let word of words) {
        if (!wordsByLength[word.length]) {
           wordsByLength[word.length] = [word]
        } else {
           wordsByLength[word.length].push(word)
        }
    }
    return function (word) {
      // This is a filter function run once per word...
      // So we can look for any kind of relationship / pattern we want...
      if (word.length >= 10) {
          let w = word;
          let target = w.substr(0,6) + w.substr(7,2) + w.substr(10)  ;
          //console.log('seeking',target,'for',w);       
          if (wordsByLength[target.length]) {
          if (wordsByLength[target.length].find((word)=>word==target)) { 
            console.log('A hit: ',word,target,word.length)
            return true}
          }
      }
    }
  }`;

  let fdun = `function (words) {
    // Create our function based on all words...
    let words10 = words.filter((w)=>w.length==10);
    return function (word) {
      // This is a filter function run once per word...
      // So we can look for any kind of relationship / pattern we want...
      if (word.length == 12) {
          let target = word.substr(1,10);
          if (words10.find((word)=>word==target)) { return true}
      }
    }
  }`;

  fun = `function (words) {
    let possibleMatches = words.filter(
      (w)=>(w.indexOf("S")>-1)
    )
    console.log('Working with a subset of ',possibleMatches.length,'words');
    return function (word) {      
      if (word.indexOf("S") == -1) {
        return false;
      }
      if (word.length > 10) { 
        return false 
      }
      // This is a filter function run once per word...
      // So we can look for any kind of relationship / pattern we want...
      let matches = possibleMatches.filter((p) => {
        if (p.length != word.length + 1) {return false}  
        if (p+'S' == word) {return false}  
        let oneS = 0;
        let wi = 0; // word index
        let mi = 0; // match index
        for (let letter of p) {
          if (letter != word[wi]) {
            if (letter == "S" && !oneS) {
              wi += 1;
              oneS += 1;
            } else {
              return false;
            }
          }
          wi += 1;                                
        }
        return true;
      });
      if (matches.length) {
        console.log("Match!", word, matches);
      }
      return matches.length;
    };
  }`;

  fun = `function (words) {    
    return function (word) {
      let match = word.match(/S/g);
      if (match && match.length == 1) {
        // ignore if it ends with an s
        if (word[word.length-1] != 'S') {                    
          let otherWord = word.replace(/S/,'');          
          if (words.indexOf(otherWord)>-1) {
            console.log(word,otherWord)
            // Now if we do have a match, lets see if its just
            // an internal word that ends with an "s"...
            let firstParticle = word.split('S')[0];
            if (firstParticle.length > 2 && words.indexOf(firstParticle) > -1) {
              console.log('IGNORE ',word,'because',firstParticle);
              return false
            }
            return true
          }
        }
      }
    }
  }`;

  let errors = [];
  let results = [];
  let start = 0;
  let end = 100;

  let results_list_subset = [];
  $: results_list_subset = results.slice(start, end);

  function moveWindowDown() {
    let windowLength = end - start;
    let nend = end + windowLength;
    let nstart = end;
    start = nstart;
    end = nend;
  }
  function moveWindowUp() {
    let windowLength = end - start;
    let nend = start;
    let nstart = start - windowLength;
    start = nstart;
    end = nend;
  }

  function searchPattern() {
    try {
      var re = new RegExp(pattern);
    } catch (err) {
      console.log("Error creating regexp");
      console.log(err);
      errors.push(err);
      return;
    }
    console.log("Got a valid search pattern...", re);
    let filtered_words = words.filter((w: string) => w.match(re));

    console.log("Got words:", filtered_words);
    results = filtered_words;
    return filtered_words;
  }
  function searchWithFun() {
    // We are now looking for pairs...
    try {
      var myfun = Function("return " + fun)();
    } catch (err) {
      console.log("Error creating function");
      errors.push(err);
      console.log(err);
      return;
    }
    let filterFunction = myfun(words);
    console.log("Created function!", filterFunction);
    console.log("Filtering...");
    // async filter...
    filterAsync(words, filterFunction);
    //let filtered_words = words.filter(filterFunction);
    //console.log("Got words:", filtered_words);
    //results = filtered_words;
    //return filtered_words;
  }

  function filterAsync(words, filterFunction, resultSet = [], index = 0) {
    setTimeout(function () {
      let subset = words.slice(index, index + 1000);
      resultSet = [...resultSet, ...subset.filter(filterFunction)];
      results = resultSet;
      index += 1000;
      if (index < words.length) {
        console.log("Done up to", index, "keep filtering...");
        filterAsync(words, filterFunction, resultSet, index);
      } else {
        results = resultSet;
      }
    }, 1);
  }
</script>

<div>
  <h3>Advanced Theme Tools</h3>
  <p>Some advanced theme tools... for people who know how to code.</p>

  RegExp Pattern:<input bind:value={pattern} />

  Or... Given word, run a function on each item...

  <pre contenteditable bind:textContent={fun} />

  <button on:click={searchPattern}>Search Matches</button>
  <button on:click={searchWithFun}>Search Matches w/ function match</button>

  {#if results.length}
    <header class="results-head">
      <h4>{results.length} Results</h4>
      <div>
        Show <input type="number" bind:value={start} />&ndash;<input
          type="number"
          bind:value={end}
        />
        {#if start > 0}
          <button on:click={moveWindowUp}>-</button>
        {/if}
        {#if end < results.length}
          <button on:click={moveWindowDown}>+ </button>
        {/if}
      </div>
    </header>
    <ul class="results">
      {#each results_list_subset as result}
        <li>{result}</li>
      {/each}
    </ul>
  {/if}
  {#if errors.length}
    <div>
      <h4>Errors</h4>
      <ul class="results">
        {#each errors as e}
          <li>{JSON.stringify(e)}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .results {
    columns: 20em 4;
  }
  header {
    position: sticky;
    top: 40px;
    background-color: white;
    width: 100%;
  }
</style>
