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
import {filters} from './filters';
import {words,scores} from './wordlist'
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


let worker

export function cancelSolve () {
  if (worker) {
    worker.terminate();
  }
}
export function solvePuzzle(ps: PuzzleContext) {
  cancelSolve();
  console.log("Solve!", ps);
  console.log("Launching test worker!");
  worker = new Worker("/build/worker.js");
  let cutoff = get(ps.scoreCutoff)
  worker.postMessage({ 
    mode : 'solve',
    acrosses : get(ps.acrosses);
    downs : get(ps.downs),
    letters: get(ps.letters),
    dictionary : words.filter((w)=>scores[w]>=cutoff),
    scores,
    filters : get(filters),
   });
  worker.onmessage = (ev) => {
    console.log("Got message from worker!", ev);
    if (!ev.data.letters) {
      console.log('FAILED TO SOLVE');
      ps.autofill.set([]);
    } else {
      console.log('Set letters to ',ev.data.letters)
      ps.autofill.set(ev.data.letters);
    }
  };  
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
