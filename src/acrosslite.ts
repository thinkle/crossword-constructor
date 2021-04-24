import type { Word } from "./puzzleStore";

/* Format documented here:
https://www.litsoft.com/across/docs/AcrossTextFormat.pdf
 */
export function createPuzzleFile(
  letters: string[],
  x: number,
  y: number,
  clues: {across:string[],down:string[]},  
  title: string | null,
  author: string | null
) {
  let grid = "";
  for (let row = 0; row < y; row++) {
    grid += "\t";
    for (let col = 0; col < x; col++) {
      let idx = row * x + col;
      grid += letters[idx].replace(/[^A-Z.]/, "X");
    }
    grid += "\n";
  }

  return `
<ACROSS PUZZLE V2>
<TITLE>
  Puzzle Constructed on ${title || new Date().toLocaleDateString()}
<AUTHOR>
  Created by ${author || "Tom"}
<COPYRIGHT>
  ${author||"Tom"} ${new Date().getFullYear()}
<SIZE>
  ${x}x${y}
<GRID>
${grid}<ACROSS>
${clues.across.map((i) => (i || "No clue").replace(/\n/g, " ")).join("\n\t")}  
<DOWN>
${clues.down.map((i) => (i || "No clue").replace(/\n/g, " ")).join("\n\t")}  
`
