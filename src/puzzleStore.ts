import { writable, get, derived } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import { tick } from "svelte";
import { findMatches } from "./findMatches";
export interface Word {
  word: string;
  indices: number[];
  type: "across" | "down";
  index: number;
}
export interface PuzzleContext {
  letters: Writable<string[]>;
  clues: Writable<{ across: string[]; down: string[] }>;
  x: Writable<number>;
  y: Writable<number>;
  acrosses: Readable<Word[]>;
  downs: Readable<Word[]>;
  possibleLetters: Readable<{}>;
  numbers: Readable<{}>;
  matches: Writable<{}>;
  updateMatches(): void;
  idx(rn: number, cn: number): number;
  currentCell: Writable<{ index: number; direction: "across" | "down" } | null>;
}

export function makePuzzleStore(
  initialLetters: string[],
  initialX: number,
  initialY: number
): PuzzleContext {
  let _letters = writable(initialLetters.map(oneCap));
  let letters = {
    subscribe: _letters.subscribe,
    set: ($letters) => _letters.set($letters.map(oneCap)),
    update: _letters.update,
  };
  let x = writable(initialX);
  let y = writable(initialY);
  let idx = (rn: number, cn: number): number => {
    return rn * get(x) + cn;
  };

  let acrosses = derived([letters, x, y], ([$letters, $x, $y]) => {
    let words: Word[] = [];
    let count = 0;
    for (let rn = 0; rn < $y; rn++) {
      let currentWord: Word = {
        word: "",
        indices: [],
        type: "across",
        index: count,
      };
      for (let cn = 0; cn < $x; cn++) {
        let letter = $letters[idx(rn, cn)] || "?";
        if (letter == ".") {
          if (currentWord.word) {
            words.push(currentWord);
            count += 1;
            currentWord = {
              word: "",
              indices: [],
              type: "across",
              index: count,
            };
          }
        } else {
          currentWord.word = currentWord.word + letter;
          currentWord.indices.push(idx(rn, cn));
        }
      }
      if (currentWord.word) {
        words.push(currentWord);
        count += 1;
      }
    }
    return words;
  });

  let downs = derived([letters, x, y], ([$letters, $x, $y]) => {
    let words: Word[] = [];
    for (let cn = 0; cn < $x; cn++) {
      let currentWord: Word = {
        word: "",
        indices: [],
        type: "down",
        index: -1,
      };
      for (let rn = 0; rn < $y; rn++) {
        let letter = $letters[idx(rn, cn)] || "?";
        if (letter == ".") {
          if (currentWord.word) {
            words.push(currentWord);
            currentWord = { word: "", indices: [], type: "down", index: -1 };
          }
        } else {
          currentWord.word = currentWord.word + letter;
          currentWord.indices.push(idx(rn, cn));
        }
      }
      if (currentWord.word) {
        words.push(currentWord);
      }
    }
    words.sort((a, b) => a.indices[0] - b.indices[0]);
    // Fix indices now that we are sorted...
    words.forEach((w, i) => {
      w.index = i;
    });
    return words;
  });

  let matches = writable({});

  let possibleLetters = derived(
    [acrosses, downs, matches],
    ([$acrosses, $downs, $matches]) => {
      console.log("Compute possible letters", new Date().getTime());
      let lettersByIndex = {};
      for (let wordList of [$acrosses, $downs]) {
        for (let word of wordList) {
          for (let ci = 0; ci < word.word.length; ci++) {
            let gridIndex = word.indices[ci];
            if (!lettersByIndex[gridIndex]) {
              lettersByIndex[gridIndex] = {
                across: new Set(),
                down: new Set(),
              };
            }
          }
          if ($matches[word.word]) {
            $matches[word.word].forEach((match) => {
              for (
                let letterIndex = 0;
                letterIndex < match.length;
                letterIndex++
              ) {
                let gridIndex = word.indices[letterIndex];
                let letter = match[letterIndex];
                lettersByIndex[gridIndex][word.type].add(letter);
              }
            });
          }
        }
      }
      console.log("Done computing letters", new Date().getTime());
      return lettersByIndex;
    }
  );

  function updateMatches() {
    let $acrosses = get(acrosses);
    let $downs = get(downs);
    matches.update(($matches) => {
      [$acrosses, $downs].forEach((wordList) => {
        wordList.forEach((word) => {
          if (!$matches[word.word]) {
            $matches[word.word] = findMatches(word.word);
          }
        });
      });
      return $matches;
    });
  }

  let autoUpdate = true;
  let updating = false;
  letters.subscribe(($letters) => {
    if (!updating && autoUpdate) {
      setTimeout(() => {
        if (!updating) {
          updating = true;
          try {
            updateMatches();
          } catch (err) {}
          updating = false;
        } else {
        }
      }, 500);
    }
  });

  let numbers: Readable<{}> = derived(
    [acrosses, downs, x, y],
    ([$acrosses, $downs, $x, $y]) => {
      let numberIndex = {};
      let number = 0;
      for (let idx = 0; idx < $x * $y; idx++) {
        if (
          $acrosses.find((word) => word.indices[0] == idx) ||
          $downs.find((word) => word.indices[0] == idx)
        ) {
          number += 1;
          numberIndex[idx] = number;
        }
      }
      return numberIndex;
    }
  );

  let clues: Writable<{ across: string[]; down: string[] }> = writable({
    across: [],
    down: [],
  });
  acrosses.subscribe(fillBlankClues);
  downs.subscribe(fillBlankClues);
  function fillBlankClues($words: Word[]) {
    clues.update(($clues) => {
      let lastWord: Word | null;
      for (let word of $words) {
        if ($clues[word.type][word.index] === undefined) {
          $clues[word.type][word.index] = "";
        }
        lastWord = word;
      }
      if ($clues[lastWord.type].length > lastWord.index + 1) {
        console.log(
          "CLUES Slicing off end of array",
          lastWord.type,
          $clues[lastWord.type]
        );
        console.log("CLUES Had", [...$clues[lastWord.type]]);
        $clues[lastWord.type] = $clues[lastWord.type].slice(0, lastWord.index);
        console.log("CLUES Now we have:", $clues[lastWord.type]);
      }
      return $clues;
    });
  }

  return {
    letters,
    numbers,
    clues,
    x,
    y,
    idx,
    acrosses,
    downs,
    possibleLetters,
    matches,
    updateMatches,
    currentCell: writable(null),
  };
  // I was halfway to implementing some row magic but let's put that off for now...
  /* let oldX = x;
puzzleStore.x.subscribe(
  (newX) => {
    // Add a row...
    if (newX > oldX) {
      puzzleStore.letters.update(
        // Add at the end of each row when we add on rows...
        ($letters)=>{
          newLetters = [];
          for (let rn=0; rn<get(puzzleStore.y); rn++) {              
            for (let cn=0; cn<oldX; cn++) {

            }
          }
          return newLetters
      });
    }

    oldX = newX;
  } 
)*/
}

function oneCap(s) {
  s = s.replace("?", "");
  if (s == ".") {
    return ".";
  } else {
    if (s.length > 1) {
      s = s.replace(/[.]/g, "");
      if (s.length) {
        return s[s.length - 1];
      } else {
        return ".";
      }
    } else {
      return s.toUpperCase() || "?";
    }
  }
}
