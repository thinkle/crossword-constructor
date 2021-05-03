import { scores, words } from "./wordlist";

export function findMatches(word: string) {
  let matcher = new RegExp("^" + word.replace(/[?]/g, ".") + "$", "i");
  let matches = words.filter((w) => w.match(matcher));
  matches.sort((a, b) => scores[b] - scores[a]);
  return matches;
}
export { scores, words };
