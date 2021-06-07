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

type puzzle = {
  x?: number;
  y?: number;
  title?: string;
  author?: string;
  letters?: string[];
  circles?: boolean[];
  clues: {
    across: string[];
    down: string[];
  };
};

export function readPuzzleFile(s) {
  enum NextLine {
    Title, Across, Down, Rebus, Author, Copyright, Size, Grid
  }
  let nextUp : null | NextLine;
  let puzzle : puzzle = { letters : [], circles : [],
  clues : {
    across : [],
    down : []
  }}
  for (let l of s.split('\n')) {
    if (nextUp == NextLine.Author) {
      puzzle.author = l.replace(/(^\s*|\s*$)/g,'');
      nextUp = null;
    } else if (nextUp == NextLine.Title) {
      puzzle.title = l.replace(/(^\s*|\s*$)/g, "");
      nextUp = null;
    } else if (nextUp == NextLine.Size) {
      let size = l.replace(/(^\s*|\s*$)/g, "");
      let x,y = l.split('x');
      puzzle.x = Number(x);
      puzzle.y = Number(y);
      nextUp = null;
    } 
    if (l.search(/<TITLE>/)) {
      nextUp = NextLine.Title;
    } else if (l.search(/<AUTHOR>/)) {
      nextUp = NextLine.Author
    } else if (l.search(/<ACROSS>/)) {
      nextUp = NextLine.Across
    } else if (l.search(/<DOWN>/)) {
      nextUp = NextLine.Down
    } else if (l.search(/<SIZE>/)) {
      nextUp = NextLine.Size
    } else if (l.search(/<GRID>/)) {
      nextUp = NextLine.Grid
    } else if (l.search(/<.*>/)) {
      nextUp = null;
      console.log('unhandled tag',l)
    } else if (nextUp==NextLine.Grid) {
      let newLetters = l.replace(/\s*/g,'');
      puzzle.letters = [...puzzle.letters,newLetters.split('')]
    } else if (nextUp==NextLine.Across) {
      puzzle.clues.across.push(l.replace(/(^\s*|\s*$)/g, "");)
    } else if (nextUp==NextLine.Down) {
      puzzle.clues.across.push(l.replace(/(^\s*|\s*$)/g, "");)
    }
  }
  for (let i = 0; i<puzzle.letters.length; i++) {
    let letter = puzzle.letters[i];
    if (letter.match(/[a-z]/)) {
      puzzle.letters[i] = letter.toUpperCase();
      puzzle.circles[i] = true;
    }
  }
}
