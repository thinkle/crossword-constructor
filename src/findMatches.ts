import scoredFile from "./crossword_wordlist.txt";
let lines = scoredFile.split("\n");

export const scores = {};
export const words = [];

for (let line of lines) {
  let [word, score] = line.split(";");
  word = word.replace(" ", "").toUpperCase();
  words.push(word);
  scores[word] = Number(score);
}

export function findMatches(word: string) {
  let matcher = new RegExp("^" + word.replace(/[?]/g, ".") + "$", "i");
  let matches = words.filter((w) => w.match(matcher));
  matches.sort((a, b) => scores[b] - scores[a]);
  return matches;
}
