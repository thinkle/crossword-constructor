import scoredFile from "./crossword_wordlist.txt";
export const customListName = "customListName";
let lines = scoredFile.split("\n");
export const scores = {};
export const words = [];

export function importWordList(lines) {
  for (let line of lines) {
    let [word, score] = line.split(";");
    word = word.replace(" ", "").toUpperCase();
    words.push(word);
    scores[word] = Number(score);
  }
}

importWordList(lines);
if (localStorage.getItem(customListName)) {
  let customList = localStorage.getItem(customListName).split("\n");
  importWordList(customList);
}
