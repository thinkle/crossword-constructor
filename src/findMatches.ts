import { scores, words } from "./wordlist";

export function findMatches(word: string, cutoff: number | null) {
  if (word.indexOf("?") == -1) {
    return [word];
  }
  let matcher = new RegExp("^" + word.replace(/[?]/g, ".") + "$", "i");
  let matches = words.filter((w) => w.match(matcher));
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
  worker.postMessage({
    mode: "match",
    acrosses,
    downs,
    dictionary: words.filter((w) => scores[w] >= scoreCutoff),
    scores,
  });
}

export { scores, words };
