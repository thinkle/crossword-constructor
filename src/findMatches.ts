import { scores, words } from "./wordlist";

export function findMatches(word: string, cutoff: number | null) {
  console.log("findMatches!", word, cutoff);
  let matcher = new RegExp("^" + word.replace(/[?]/g, ".") + "$", "i");
  let matches = words.filter((w) => w.match(matcher));
  matches.sort((a, b) => scores[b] - scores[a]);
  if (cutoff !== null) {
    matches = matches.filter((a) => scores[a] > cutoff);
  }
  return matches;
}
export { scores, words };
