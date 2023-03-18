let cache = {};

/* Needed if we want to change dictionaries... */
export function clearWordMatchCache() {
  cache = {};
}

export function findMatches(
  word: string,
  dictionary: string[],
  excludes: string[] = [],
  filters: RegExp[] = []
) {
  if (!cache[word]) {
    cache[word] = dictionary.filter(isMatch);
  }
  let results = cache[word];
  /*if (filters.length) {
    console.log("Got results", results);
  }*/
  results = results.filter((w) => excludes.indexOf(w) == -1);
  results = results.filter(isMatch);
  //if (filters.length) {
  //    console.log("Filtered to results", results, filters);
  //}

  return results;

  function isMatch(dword) {
    if (dword.length == word.length) {
      for (let i = 0; i < word.length; i++) {
        let l = word[i];
        if (l && l != "?" && l != dword[i]) {
          return false;
        }
      }
      for (let f of filters) {
        if (!dword.match(f)) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
}
