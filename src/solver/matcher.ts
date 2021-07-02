let cache = {};

/* Needed if we want to change dictionaries... */
export function clearWordMatchCache() {
  cache = {};
}

export function findMatches(
  word: string,
  dictionary: string[],
  excludes: string[] = []
) {
  if (!cache[word]) {
    cache[word] = dictionary.filter(isMatch);
  }
  let results = cache[word];
  results = results.filter((w) => excludes.indexOf(w) == -1);
  return results;

  function isMatch(dword) {
    if (dword.length == word.length) {
      for (let i = 0; i < word.length; i++) {
        let l = word[i];
        if (l && l != "?" && l != dword[i]) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
}
