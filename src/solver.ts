// Let's think about how to do some solving...
// Start w/ something simple...
//
// 1. Get letters for each square (we already do this).
// 2. Add letters to squares w/ one letter.
// 3. Sort word list by fewest words, try words in order, until we get a solution...
// Remember state to plug back in old state...
import { get } from "svelte/store";
import { makePuzzleStore } from "./puzzleStore";
import type { PuzzleContext } from "./puzzleStore";

export function getPossible(possible: {
  across: Set<string>;
  down: Set<string>;
}) {
  let r = [];
  if (!possible || !possible.across) {
    return [];
  }
  possible.across.forEach((l) => {
    if (possible.down.has(l)) {
      r.push(l);
    }
  });
  return r;
}

export function solvePuzzle(ps: PuzzleContext) {
  console.log("Solve!", ps);
  // First, put in every letter we need to...
  let changes;
  do {
    console.log("Fill where we can by letters...");
    changes = fillWhereOneOption(ps);
  } while (changes > 0);
  // Next up... fill by words...
  let $acrosses = get(ps.acrosses);
  let $downs = get(ps.downs);
  let $matches = get(ps.matches);
}

function fillWhereOneOption(ps: PuzzleContext) {
  let $letters = get(ps.letters);
  let $possibleLetters = get(ps.possibleLetters);
  let changes = 0;
  for (let i = 0; i < $letters.length; i++) {
    if ($letters[i] == "?") {
      let lettersForSquare = getPossible($possibleLetters[i]);
      console.log("Check out", i, lettersForSquare);
      if (lettersForSquare.length == 0) {
        console.log("No letters for ", i, $letters[i]);
        return -1;
      } else if (lettersForSquare.length == 1) {
        $letters[i] = lettersForSquare[0];
        changes += 1;
      } else {
        console.log("Still have", lettersForSquare.length, "for square", i);
      }
    }
  }
  ps.letters.set($letters);
  return changes;
}

/* Create a new puzzleContext for the chunk isolated by index
(i.e. only do one corner/section at a time) */
function findChunkAt(index: number, puzzleStore: PuzzleContext) {}
