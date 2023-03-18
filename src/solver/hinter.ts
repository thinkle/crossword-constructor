/* Provide in-square hints about what letters are available */
import { findMatches } from "./matcher";
import type { Word } from "../puzzleStore";

type Possible = {
  across: string[][];
  down: string[][];
  possible: Set<string>[];
  justUpdated: boolean;
};

export function getPossibleWords(
  letters,
  across: Word[],
  down: Word[],
  dictionary: string[],
  filters: RegExp[] = []
): Possible {
  let possible = getInitialPossibleLetters(
    across,
    down,
    letters,
    dictionary,
    filters
  );
  postMessage({
    status: "partial",
    ...possible,
  });
  possible = getSecondaryPossibleLetters(
    across,
    down,
    letters,
    dictionary,
    possible
  );
  return possible;
}

function getRegexp(word: Word, possible: Set<[]>[]): RegExp {
  let reString = word.indices
    .map((i) => {
      let part =
        "[" +
        [...possible[i]].filter((l: string) => l.match(/[A-Z1-9]/)).join("") +
        "]";
      if (part == "[]") {
        return "FAIL";
      } else {
        return part;
      }
    })
    .join("");
  return new RegExp("^" + reString + "$");
}

function getInitialPossibleLetters(
  across: Word[],
  down: Word[],
  letters: string[],
  dictionary,
  filters: RegExp[] = []
): Possible {
  let possible = {
    across: [],
    down: [],
    possible: [],
    justUpdated: true,
  };
  // First loop through the across and just get possible words...
  for (let word of across) {
    if (word.word.indexOf("?") > -1) {
      let matches = findMatches(word.word, dictionary, [], filters);
      possible.across[word.index] = matches;
      for (let match of matches) {
        for (let li = 0; li < match.length; li++) {
          let idx = word.indices[li];
          if (word.word[li] == "?") {
            if (!possible.possible[idx]) {
              possible.possible[idx] = new Set();
            }
            let letter = match[li];
            possible.possible[idx].add(letter);
          } else {
            possible.possible[idx] = new Set([word.word[li]]);
          }
        }
      }
    } else {
      for (let i = 0; i < word.word.length; i++) {
        possible.possible[word.indices[i]] = new Set([word.word[i]]);
      }
    }
  }
  // Next, loop through the down and get possible word based on limitations
  for (let word of down) {
    let re = getRegexp(word, possible.possible);
    let matches = dictionary.filter((w) => w.match(re));
    possible.down[word.index] = matches;
    // Now loop through available letters and see if any aren't present in any matches,
    // in which case we remove them from our list of possible letters.
    for (let i = 0; i < word.word.length; i++) {
      if (word.word[i] == "?") {
        for (let possibleLetter of [...possible.possible[word.indices[i]]]) {
          let matchingWord = matches.find((w) => w[i] == possibleLetter);
          if (!matchingWord) {
            // Remove letter
            possible.possible[word.indices[i]].delete(possibleLetter);
          }
        }
      }
    }
  }
  return possible;
}

function getSecondaryPossibleLetters(
  across: Word[],
  down: Word[],
  letters: string[],
  dictionary: string[],
  possible: Possible
): Possible {
  let words = { across, down };
  for (let direction in words) {
    for (let word of words[direction]) {
      let w: Word = word;
      let regexp = getRegexp(w, possible.possible);
      let matches = dictionary.filter((w) => w.match(regexp));
      possible[direction][word.index] = matches;
      for (let i = 0; i < w.word.length; i++) {
        if (w.word[i] == "?") {
          for (let possibleLetter of [...possible.possible[w.indices[i]]]) {
            if (!matches.find((w) => w[i] == possibleLetter)) {
              possible.possible[w.indices[i]].delete(possibleLetter);
            }
          }
        }
      }
    }
  }
  return possible;
}
