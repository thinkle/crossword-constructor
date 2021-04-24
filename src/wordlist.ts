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
