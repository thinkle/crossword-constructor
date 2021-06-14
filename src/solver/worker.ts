import { solveForConstraint } from "./constraintSolver";

onmessage = function (event) {
  let { acrosses, downs, letters, dictionary, scores } = event.data;
  let words = [
    ...acrosses.map((w) => w.indices),
    ...downs.map((w) => w.indices),
  ];
  let key = letters;
  // Our word is a list of indices. Our key is the "grid" of solutions.
  console.log("Worker trying to solve!");
  let solution = solveForConstraint(words, letters, dictionary, scores);
  console.log("Worker got a solution!", solution);
  postMessage({
    status: "complete",
    letters: solution,
  });
};
