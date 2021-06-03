import type { Word } from "./puzzleStore";

/* Format documented here:
https://www.litsoft.com/across/docs/AcrossTextFormat.pdf
 */
export function createPuzzleFile(
  letters: string[],
  x: number,
  y: number,
  clues: { across: string[]; down: string[] },
  title: string | null,
  author: string | null,
  circles: boolean[] | null
) {
  let grid = "";
  for (let row = 0; row < y; row++) {
    grid += "\t";
    for (let col = 0; col < x; col++) {
      let idx = row * x + col;
      if (circles && circles[idx]) {
        grid += letters[idx].replace(/[^A-Z1-9.]/, "X").toLowerCase();
      } else {
        grid += letters[idx].replace(/[^A-Z1-9.]/, "X");
      }
    }
    grid += "\n";
  }

  return `
<ACROSS PUZZLE V2>
<TITLE>
   ${title || `Puzzle Constructed on ${new Date().toLocaleDateString()}`}
<AUTHOR>
  ${author || "Tom Hinkle"}
<COPYRIGHT>
  ${author || "Tom Hinkle"} ${new Date().getFullYear()}
<SIZE>
  ${x}x${y}
<GRID>
${grid}<REBUS>
MARK;
<ACROSS>
${clues.across
  .map((i) => (i || "No clue").replace(/\s/g, " ").replace(/\s$/, ""))
  .join("\n\t")}  
<DOWN>
${clues.down
  .map((i) => (i || "No clue").replace(/\s/g, " ").replace(/\s$/, ""))
  .join("\n\t")}  
`;
}

export function readPuzzleFile(s) {}
