// Simple constraint solver
type WordIndices = number[] & { word?: Word };
type Word = {
  indices: WordIndices;
  word: string;
  matches?: string[];
};
let cache = {};

/* Needed if we want to change dictionaries... */
export function clearWordMatchCache() {
  cache = {};
}

function findMatches(
  word: string,
  dictionary: string[],
  excludes: string[] = []
) {
  /* THIS IS NOT WORKING AS EXPECTED - WHAT'S UP HERE??? */
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

export function solveForConstraint(
  words: WordIndices[],
  letters: string[],
  dictionary: string[],
  scores,
  byIndex?: {
    [key: number]: number[][];
  }
) {
  postMessage({
    status: "solving",
    letters,
  });

  console.log("Solve", letters.join(""), letters.length);
  let complete: Word[] = [];
  let needResolution: Word[] = [];
  if (!byIndex) {
    byIndex = buildMapByIndex(byIndex, words);
  }
  /* Get list of words we need to solve for... */
  for (let wordIndices of words) {
    let word = wordIndices.map((i) => letters[i] || "?").join("");
    if (word.indexOf("?") == -1) {
      complete.push({ indices: wordIndices, word });
    } else {
      let w = { indices: wordIndices, word };
      needResolution.push(w);
      w.indices.word = w;
    }
  }
  if (needResolution.length == 0) {
    // we are done if we've resolved every word!
    return letters;
  } else {
    // Otherwise, we've got some work to do :)
    needResolution.map((w) => {
      w.matches = findMatches(
        w.word,
        dictionary,
        complete.map((w) => w.word)
      );
    }); // got all possible matches...
    let possibleLettersBySquares: {
      [key: number]: Set<string> | null;
    } = {};
    let mostConstrained = undefined;
    let forcedToFill = false;
    for (let sq in byIndex) {
      let square = Number(sq);
      if (letters[square] == "?" || !letters[square]) {
        // squares we actually need to solve...
        let possibleLetters: Set<string> | null = null;
        let wordIndicesSet: WordIndices[] = byIndex[square];
        for (let wi of wordIndicesSet) {
          let positionOfLetter = wi.indexOf(square);
          let wordLetterMatches = wi.word.matches.map(
            (s) => s[positionOfLetter]
          );
          if (!possibleLetters) {
            possibleLetters = new Set(wordLetterMatches);
          } else {
            possibleLetters = new Set(
              [...possibleLetters].filter(
                (a) => wordLetterMatches.indexOf(a) > -1
              )
            );
          }
        }
        possibleLettersBySquares[square] = possibleLetters;
        if (possibleLetters.size == 1) {
          let ltr = possibleLetters.values().next().value;
          forcedToFill = true;
          letters[square] = ltr;
          // Now check -- did we just create a word...
          let completedWords: Word[] = [];
          for (let wordIndices of byIndex[square]) {
            let word = wordIndices
              .map((i: number) => letters[i] || "?")
              .join("");
            if (word.indexOf("?") == -1) {
              // we completed a word... is it real?
              console.log("Forced to complete word...", word);
              completedWords.push({ word, indices: wordIndices });
            }
          }
          for (let word of completedWords) {
            if (dictionary.indexOf(word.word) == -1) {
              console.log("Completed", word, "which is not a word :(");
              return null;
            } else {
              let dup = complete.find((w) => w.word == word.word);
              if (dup) {
                console.log("Completed duplicate...", word, dup);
                return null;
              } else {
                complete.push(word);
              }
            }
          }
          // If there is only one choice, solve right away -- recurse!
        } else if (possibleLetters.size == 0) {
          // fail fast!
          return null; // failure
        } else if (
          !mostConstrained ||
          possibleLetters.size < possibleLettersBySquares[mostConstrained].size
        ) {
          mostConstrained = square;
        }
      }
    }
    if (forcedToFill) {
      // recurse now with autofilled stuff...
      return solveForConstraint(words, letters, dictionary, scores, byIndex);
    }
    // if we made it here, we have no squares w/ only one possibility and no impossible squares, so let's
    // try some things...
    let possibleLetters = [
      ...possibleLettersBySquares[mostConstrained].values(),
    ];
    possibleLetters.sort((a, b) => scoreLetter(b) - scoreLetter(a));
    function scoreLetter(l) {
      let words = byIndex[mostConstrained].map((indices) =>
        findMatches(
          indices
            .map((i) => (i == mostConstrained && l) || letters[i])
            .join(""),
          dictionary,
          complete.map((c) => c.word)
        )
      );
      let allWords = [];
      for (let wordSet of words) {
        allWords = [...wordSet, ...allWords];
      }
      let tot = 0;
      for (let word of allWords) {
        tot += scores[word] || 0;
      }
      let aveScore = tot / allWords.length;
      return aveScore;
    }

    for (let letter of possibleLetters) {
      // now for each letter... let's try one...
      letters[mostConstrained] = letter;
      let result = solveForConstraint(
        words,
        letters.slice(),
        dictionary,
        scores,
        byIndex
      );
      if (result) {
        return result;
      }
    }
    console.log("Out of options for", mostConstrained, "fail");
    return null;
  }
}

function buildMapByIndex(
  byIndex: {},
  words: WordIndices[]
): {
  [key: number]: number[][];
} {
  byIndex = {};
  for (let indices of words) {
    for (let index of indices) {
      if (!byIndex[index]) {
        byIndex[index] = [];
      }
      byIndex[index].push(indices);
    }
  }
  return byIndex;
}
