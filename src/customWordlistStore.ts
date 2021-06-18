import {writable, get} from 'svelte/store';
import type {Writable} from 'svelte/store';
import { words, scores, customListName, importWordList } from "./wordlist";

export const scoredList : Writable<[string,number][]> = writable([])
export const nextWord : Writable<[string,number]> = writable(['',50]);

export function loadList() {
  let customListText = localStorage.getItem(customListName);
  scoredList.set(
    customListText &&
    customListText
      .split("\n")
      .map((l) => [l.split(";")[0], Number(l.split(";")[1])]);
  );
  nextWord.set(["", 50]);
}

export function addWord (word, score) {
  scoredList.update(
    ($scoredList) => {
      let existingWord = $scoredList.find((i)=>i[0]==word);
      if (existingWord) {
        existingWord[1] = score;
      } else {
        $scoredList.push([word,score])
      }
      return $scoredList
    }
  );
  activate();
  saveList();
}

export function addNextWord() {
  let $nextWord = get(nextWord);
  scoredList.update(
    ($scoredList)=>[...$scoredList, $nextWord];
  nextWord.set(["", 50]);
}

export function getListAsString() {
  return get(scoredList).map((l) => l.join(";")).join("\n");
}

export function saveList() {
  localStorage.setItem(customListName, getListAsString());
}
export function activate() {
  importWordList(getListAsString());
}
loadList();