import { solveForConstraint } from "./constraintSolver";
import { findMatches } from "./matcher";
import {getPossibleWords} from './hinter';
onmessage = function (event) {
  let { mode, acrosses, downs, letters, dictionary, scores } = event.data;
  if (mode == "solve") {
    let words = [
      ...acrosses.map((w) => w.indices),
      ...downs.map((w) => w.indices),
    ];
    let key = letters;
    // Our word is a list of indices. Our key is the "grid" of solutions.
    let solution = solveForConstraint(words, letters, dictionary, scores);
    postMessage({
      status: "complete",
      letters: solution,
    });
  } else {
      let possible = getPossibleWords(
        letters,
        acrosses,
        downs,
        dictionary
      )
      postMessage({
        status : 'complete',
        ...possible
      })
    }
    
  }
};
