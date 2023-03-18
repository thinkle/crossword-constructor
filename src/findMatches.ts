import { scores, words } from "./wordlist";
import { filters } from "./filters";
import { get } from "svelte/store";

export function findMatches(word: string, cutoff: number | null) {
  if (word.indexOf("?") == -1) {
    return [word];
  }
  let matcher = new RegExp("^" + word.replace(/[?]/g, ".") + "$", "i");
  let matches = words.filter((w) => w.match(matcher));
  let $filters = get(filters);
  if ($filters) {
    console.log("Extra filtering...", $filters);
    for (let f of $filters) {
      matches = words.filter((w) => w.match(f));
    }
  }
  matches.sort((a, b) => scores[b] - scores[a]);
  if (cutoff !== null) {
    matches = matches.filter((a) => scores[a] > cutoff);
  }
  return matches;
}

let worker = new Worker("/build/worker.js");
let working = false;
export function getGridHints(
  acrosses,
  downs,
  scoreCutoff,
  onMatch: Function
): void {
  if (working) {
    worker.terminate();
    worker = new Worker("/build/worker.js");
  }
  worker.onmessage = (event) => {
    working = false;
    onMatch(event.data);
  };
  working = true;
  let $filters = get(filters);
  worker.postMessage({
    mode: "match",
    acrosses,
    downs,
    dictionary: words.filter((w) => scores[w] >= scoreCutoff),
    scores,
    filters: $filters,
  });
}

export { scores, words };
