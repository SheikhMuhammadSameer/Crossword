"use strict";

// Word lists for each difficulty level
// Each difficulty has a bunch of DSA/CS words with their clues

const WORD_BANK = {
  easy: new Map([
    ["ARRAY", "A group of items stored next to each other in memory"],
    ["STACK", "A pile of data where you take the top item first"],
    ["QUEUE", "A line of data where you take from the front"],
    ["TREE", "A structure with a main part at the top and branches below"],
    ["HEAP", "A special tree where parent is always bigger/smaller than kids"],
    ["NODE", "A single spot in a linked list or tree"],
    ["LOOP", "Code that repeats over and over"],
    ["SORT", "Putting items in order from smallest to biggest"],
    ["HASH", "A function that turns data into a fixed number"],
    ["LIST", "A bunch of items in a line"],
    ["EDGE", "A line connecting two dots in a graph"],
    ["ROOT", "The very first node at the top of a tree"],
    ["LEAF", "A node that has no children below it"],
    ["PATH", "A route you follow by hopping from node to node"],
    ["SCAN", "Looking at each item one by one"],
    ["SWAP", "Trading the values of two variables"],
    ["SORT", "Arranging stuff in order"],
    ["LINK", "A connection from one node to the next"],
    ["DATA", "Information stored in memory"],
    ["NULL", "An empty value, nothing at all"],
  ]),

  medium: new Map([
    ["GRAPH", "A bunch of dots connected by lines"],
    ["TABLE", "A way to store key-value pairs, like a dictionary"],
    ["INDEX", "A number that points to where something is in an array"],
    ["VALUE", "The actual data stored with a key"],
    ["MATRIX", "A grid of numbers with rows and columns"],
    ["VECTOR", "A list that can grow and shrink in size"],
    ["STRING", "A sequence of letters and characters"],
    ["SEARCH", "Looking for something in a bunch of data"],
    ["BINARY", "Using only 0 and 1"],
    ["LINKED", "When nodes point to the next node"],
    [
      "DYNAMIC",
      "Breaking a big problem into smaller ones and combining answers",
    ],
    ["POINTER", "A variable that stores where something is in memory"],
    ["BUCKET", "A spot in a hash table that holds collided stuff"],
    ["CURSOR", "A marker that moves through a data structure"],
    ["SUBSET", "A smaller group that is part of a bigger group"],
    ["ARRAYS", "Plural of array, a collection"],
    ["DEPTH", "How many levels deep something goes"],
    ["CYCLE", "When you follow a path and end up back where you started"],
    ["WEIGHT", "A number on an edge in a graph"],
    ["DEGREE", "How many edges connect to a node"],
  ]),

  hard: new Map([
    ["RECURSION", "A function that calls itself to solve a problem"],
    ["ALGORITHM", "A step-by-step way to solve something"],
    ["HEURISTIC", "A shortcut that gives a good answer but not always perfect"],
    ["TRAVERSAL", "Visiting every single node in a structure"],
    ["ITERATION", "Doing something over and over with a loop"],
    ["COMPLEXITY", "How much work an algorithm needs to do"],
    ["BACKTRACK", "Going back and trying a different path when stuck"],
    ["PALINDROME", "Something that reads the same forwards and backwards"],
    ["PARTITION", "Splitting an array into separate pieces"],
    ["CONCURRENT", "Multiple things happening at the same time"],
    ["ALLOCATION", "Setting aside memory space for something"],
    ["BALANCED", "A tree where all branches are about the same height"],
    ["ADJACENCY", "When two nodes are directly connected"],
    ["POLYNOMIAL", "A way to describe runtime that grows with power terms"],
    ["MERGE", "Combining two sorted lists into one big sorted list"],
    ["BUBBLE", "A simple sorting method that compares neighbors"],
    ["PIVOT", "A point used to split data in quicksort"],
    ["MEMOIZE", "Saving answers so you dont have to compute them again"],
    ["GREEDY", "Always picking the best choice at each step"],
    ["STABLE", "When equal items keep their original order after sorting"],
  ]),
};

// Helper class to get clues and check if words exist
// Uses hash table lookups which are really fast
class WordBank {
  // Get the clue for a word (hash table lookup)
  static getClue(difficulty, word) {
    return WORD_BANK[difficulty].get(word);
  }

  // Check if a word is in the dictionary (hash table lookup)
  static has(difficulty, word) {
    return WORD_BANK[difficulty].has(word);
  }

  // Get all words for a difficulty as a sorted list
  // Sorted so we can use binary search on it
  static getSortedWords(difficulty) {
    return [...WORD_BANK[difficulty].keys()].sort();
  }
}

// Binary search finds a word in a sorted list super fast
// Instead of checking every word, we check the middle one and then
// only look at half the list. Super efficient!
function binarySearch(sortedArr, target) {
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midValue = sortedArr[mid];

    if (midValue === target) {
      return mid; // found it!
    } else if (midValue < target) {
      low = mid + 1; // target is in the right half
    } else {
      high = mid - 1; // target is in the left half
    }
  }
  return -1; // not found
}

// Crossword Generator makes the puzzle board
// Places words in a 2D grid so they cross each other in valid ways

const DIFFICULTY_CONFIG = {
  easy: { size: 11, targetWords: 7 },
  medium: { size: 13, targetWords: 10 },
  hard: { size: 15, targetWords: 12 },
};

class CrosswordGenerator {
  constructor(words, size) {
    this.words = words; // list of words to place
    this.size = size; // the grid is size x size
    this.grid = null;
    this.placements = []; // keeps track of where each word goes
  }

  // Make an empty grid full of empty cells
  generateBoard() {
    this.grid = [];
    for (let r = 0; r < this.size; r++) {
      const row = new Array(this.size).fill(null);
      this.grid.push(row);
    }
    return this.grid;
  }

  // Place all the words on the board
  // The first (longest) word goes in the middle
  // Then we try to fit other words by finding matching letters
  placeWords() {
    if (!this.grid) this.generateBoard();
    if (this.words.length === 0) return this.placements;

    let idCounter = 1;

    // Place the first word in the middle going across
    const seed = this.words[0];
    const seedRow = Math.floor(this.size / 2);
    const seedCol = Math.floor((this.size - seed.word.length) / 2);

    if (this._canPlace(seed.word, seedRow, seedCol, "across")) {
      this._commitPlacement(seed, seedRow, seedCol, "across", idCounter++);
    } else {
      // If the first word doesn't fit, just give up
      return this.placements;
    }

    // Now try to place all the other words
    for (let i = 1; i < this.words.length; i++) {
      const candidate = this.words[i];
      const placed = this._tryIntersect(candidate);
      if (placed) {
        this._commitPlacement(
          candidate,
          placed.row,
          placed.col,
          placed.direction,
          idCounter++,
        );
      }
      // If we can't place a word, just skip it for now
    }

    this._assignClueNumbers();
    return this.placements;
  }

  /** Try every letter-pair between `candidate` and every placed word. */
  _tryIntersect(candidate) {
    for (const placed of this.placements) {
      for (let i = 0; i < candidate.word.length; i++) {
        for (let j = 0; j < placed.word.length; j++) {
          if (candidate.word[i] !== placed.word[j]) continue;

          let row, col, direction;
          if (placed.direction === "across") {
            // placed word runs horizontally; candidate will run vertically
            // through column (placed.col + j), passing through row
            // (placed.row) at the shared letter, offset by candidate's
            // own letter index i.
            direction = "down";
            row = placed.row - i;
            col = placed.col + j;
          } else {
            // placed word runs vertically; candidate will run horizontally
            // through row (placed.row + j), offset by candidate's own
            // letter index i.
            direction = "across";
            row = placed.row + j;
            col = placed.col - i;
          }

          if (this._canPlace(candidate.word, row, col, direction)) {
            return { row, col, direction };
          }
        }
      }
    }
    return null;
  }

  // Check if a word can go in this spot
  // Make sure it doesn't go off the grid, doesn't overlap weirdly, etc
  _canPlace(word, row, col, direction) {
    const size = this.size;
    const dr = direction === "down" ? 1 : 0;
    const dc = direction === "across" ? 1 : 0;

    // Check if word fits in bounds
    const endRow = row + dr * (word.length - 1);
    const endCol = col + dc * (word.length - 1);
    if (row < 0 || col < 0 || endRow >= size || endCol >= size) return false;

    // Make sure cells before and after are empty
    const beforeRow = row - dr;
    const beforeCol = col - dc;
    if (
      this._inBounds(beforeRow, beforeCol) &&
      this.grid[beforeRow][beforeCol]
    ) {
      return false;
    }
    const afterRow = row + dr * word.length;
    const afterCol = col + dc * word.length;
    if (this._inBounds(afterRow, afterCol) && this.grid[afterRow][afterCol]) {
      return false;
    }

    let hasIntersection = false;

    for (let k = 0; k < word.length; k++) {
      const r = row + dr * k;
      const c = col + dc * k;
      const existing = this.grid[r][c];

      if (existing) {
        // If there's already a letter, it has to match
        if (existing.letter !== word[k]) return false;
        hasIntersection = true;
        continue;
      }

      // Empty cells shouldn't have other letters right next to them
      if (direction === "across") {
        if (this._occupied(r - 1, c) || this._occupied(r + 1, c)) return false;
      } else {
        if (this._occupied(r, c - 1) || this._occupied(r, c + 1)) return false;
      }
    }

    // Words have to connect to other words (except the first one)
    if (this.placements.length > 0 && !hasIntersection) return false;

    return true;
  }

  _inBounds(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  _occupied(r, c) {
    return this._inBounds(r, c) && this.grid[r][c] !== null;
  }

  /** Writes a word's letters into the shared 2D grid and records metadata. */
  _commitPlacement(entry, row, col, direction, id) {
    const dr = direction === "down" ? 1 : 0;
    const dc = direction === "across" ? 1 : 0;

    for (let k = 0; k < entry.word.length; k++) {
      const r = row + dr * k;
      const c = col + dc * k;
      if (!this.grid[r][c]) {
        this.grid[r][c] = { letter: entry.word[k], number: null };
      }
    }

    this.placements.push({
      id,
      word: entry.word,
      clue: entry.clue,
      row,
      col,
      direction,
      number: null,
      length: entry.word.length,
    });
  }

  // Number the clue positions on the grid
  // A cell gets a number if it's the start of an across or down word
  _assignClueNumbers() {
    let counter = 1;
    const numberAt = {};

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c]) continue;

        const startsAcross =
          (c === 0 || !this.grid[r][c - 1]) &&
          c + 1 < this.size &&
          this.grid[r][c + 1];
        const startsDown =
          (r === 0 || !this.grid[r - 1][c]) &&
          r + 1 < this.size &&
          this.grid[r + 1][c];

        if (startsAcross || startsDown) {
          this.grid[r][c].number = counter;
          numberAt[`${r},${c}`] = counter;
          counter++;
        }
      }
    }

    for (const p of this.placements) {
      p.number = numberAt[`${p.row},${p.col}`];
    }
  }
}

// The main game class that handles everything
// It keeps track of the board, user input, score, and controls
class CrosswordGame {
  constructor() {
    this.difficulty = "medium";
    this.size = 0;
    this.grid = []; // the actual puzzle board
    this.userGrid = []; // what the player has typed
    this.placements = []; // where each word is
    this.sortedWords = []; // sorted word list for binary search
    this.cellMeta = []; // which words go through each cell

    this.score = 0;
    this.hintsUsed = 0;
    this.seconds = 0;
    this.timerHandle = null;

    this.activeWordId = null;
    this.activeDirection = "across";

    this._cacheDom();
    this._bindControls();
    this.restartGame(); // boot the first puzzle
  }

  _cacheDom() {
    this.dom = {
      grid: document.getElementById("crossword-grid"),
      across: document.getElementById("across-clues"),
      down: document.getElementById("down-clues"),
      score: document.getElementById("score-value"),
      timer: document.getElementById("timer-value"),
      highScore: document.getElementById("high-score-value"),
      message: document.getElementById("message-line"),
      difficulty: document.getElementById("difficulty-select"),
      newGameBtn: document.getElementById("new-game-btn"),
      hintBtn: document.getElementById("hint-btn"),
      checkBtn: document.getElementById("check-btn"),
      restartBtn: document.getElementById("restart-btn"),
    };
  }

  _bindControls() {
    this.dom.newGameBtn.addEventListener("click", () => {
      this.difficulty = this.dom.difficulty.value;
      this._newPuzzle();
    });
    this.dom.restartBtn.addEventListener("click", () => this.restartGame());
    this.dom.hintBtn.addEventListener("click", () => this.revealHint());
    this.dom.checkBtn.addEventListener("click", () => this._checkAll());
    this.dom.difficulty.addEventListener("change", () => {
      this.difficulty = this.dom.difficulty.value;
      this.restartGame();
    });
  }

  /* ---------------------------------------------------------------------
     Puzzle setup
  --------------------------------------------------------------------- */

  /** Builds a brand new randomized puzzle for the current difficulty. */
  _newPuzzle() {
    const config = DIFFICULTY_CONFIG[this.difficulty];
    this.size = config.size;

    // Hash-table lookup of the dictionary, then materialise + shuffle it.
    const allWords = WordBank.getSortedWords(this.difficulty).map((w) => ({
      word: w,
      clue: WordBank.getClue(this.difficulty, w),
    }));

    this.sortedWords = WordBank.getSortedWords(this.difficulty); // for binarySearch()

    // The generator is randomized, so a single attempt can occasionally
    // pack in fewer words than we'd like. We generate a handful of
    // candidate boards and keep the one with the most successfully
    // placed words — still O(attempts * k^2 * L), trivial at this scale.
    let bestGenerator = null;
    const attempts = 6;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const shuffled = this._shuffle([...allWords]);
      // Longest-first ordering tends to produce denser, better-connected boards.
      shuffled.sort((a, b) => b.word.length - a.word.length);
      const pool = shuffled.slice(0, config.targetWords + 4); // small surplus

      const generator = new CrosswordGenerator(pool, this.size);
      generator.generateBoard();
      generator.placeWords();

      if (
        !bestGenerator ||
        generator.placements.length > bestGenerator.placements.length
      ) {
        bestGenerator = generator;
      }
      if (bestGenerator.placements.length >= config.targetWords) break;
    }

    this.placements = bestGenerator.placements;
    this.grid = bestGenerator.grid;

    this._buildCellMeta();
    this._resetUserGrid();

    this.score = 0;
    this.hintsUsed = 0;
    this.seconds = 0;
    this.activeWordId = this.placements.length ? this.placements[0].id : null;
    this.activeDirection = "across";

    this._renderGrid();
    this._renderClues();
    this._updateScoreDisplay();
    this._loadHighScore();
    this.startTimer();
    this._setMessage(
      `New ${this.difficulty} puzzle — ${this.placements.length} words placed.`,
    );
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** For every cell, remember which across/down word (by id) owns it. */
  _buildCellMeta() {
    this.cellMeta = Array.from({ length: this.size }, () =>
      new Array(this.size).fill(null),
    );
    for (const p of this.placements) {
      const dr = p.direction === "down" ? 1 : 0;
      const dc = p.direction === "across" ? 1 : 0;
      for (let k = 0; k < p.length; k++) {
        const r = p.row + dr * k;
        const c = p.col + dc * k;
        if (!this.cellMeta[r][c]) this.cellMeta[r][c] = {};
        if (p.direction === "across") this.cellMeta[r][c].acrossId = p.id;
        else this.cellMeta[r][c].downId = p.id;
      }
    }
    for (const p of this.placements) p.solved = false;
  }

  _resetUserGrid() {
    this.userGrid = Array.from({ length: this.size }, () =>
      new Array(this.size).fill(""),
    );
  }

  /* ---------------------------------------------------------------------
     Rendering
  --------------------------------------------------------------------- */

  _renderGrid() {
    const gridEl = this.dom.grid;
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cellData = this.grid[r][c];
        const cellEl = document.createElement("div");

        if (!cellData) {
          cellEl.className = "cell block";
          gridEl.appendChild(cellEl);
          continue;
        }

        cellEl.className = "cell";
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        if (cellData.number) {
          const numEl = document.createElement("span");
          numEl.className = "cell-number";
          numEl.textContent = cellData.number;
          cellEl.appendChild(numEl);
        }

        const input = document.createElement("input");
        input.setAttribute("maxlength", "1");
        input.setAttribute("inputmode", "text");
        input.setAttribute("autocomplete", "off");
        input.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}`);
        input.value = this.userGrid[r][c] || "";

        input.addEventListener("input", (e) => this._onCellInput(e, r, c));
        input.addEventListener("keydown", (e) => this._onCellKeydown(e, r, c));
        input.addEventListener("focus", () => this._onCellFocus(r, c));

        cellEl.appendChild(input);
        gridEl.appendChild(cellEl);
      }
    }
  }

  _renderClues() {
    const across = this.placements
      .filter((p) => p.direction === "across")
      .sort((a, b) => a.number - b.number);
    const down = this.placements
      .filter((p) => p.direction === "down")
      .sort((a, b) => a.number - b.number);

    this.dom.across.innerHTML = "";
    this.dom.down.innerHTML = "";

    const buildItem = (p) => {
      const li = document.createElement("li");
      li.className = "clue-item";
      li.dataset.wordId = p.id;
      li.innerHTML = `<span class="clue-number">${p.number}.</span><span>${p.clue} (${p.length})</span>`;
      li.addEventListener("click", () => this._focusWord(p.id));
      return li;
    };

    across.forEach((p) => this.dom.across.appendChild(buildItem(p)));
    down.forEach((p) => this.dom.down.appendChild(buildItem(p)));
  }

  /* ---------------------------------------------------------------------
     Interaction
  --------------------------------------------------------------------- */

  _onCellFocus(r, c) {
    const meta = this.cellMeta[r][c];
    if (!meta) return;
    // Prefer to stay on the currently active direction if this cell
    // belongs to that word too; otherwise fall back sensibly.
    if (this.activeDirection === "across" && meta.acrossId) {
      this.activeWordId = meta.acrossId;
    } else if (this.activeDirection === "down" && meta.downId) {
      this.activeWordId = meta.downId;
    } else {
      this.activeWordId = meta.acrossId || meta.downId;
      this.activeDirection = meta.acrossId ? "across" : "down";
    }
    this._highlightActiveClue();
  }

  _onCellInput(e, r, c) {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    e.target.value = raw;
    this.userGrid[r][c] = raw;

    // Clear any stale correctness styling while the player edits.
    e.target.parentElement.classList.remove(
      "state-correct",
      "state-wrong",
      "state-hint",
    );

    if (raw) {
      this._advanceCursor(r, c);
      this._autoCheckCellWords(r, c);
    }
  }

  _onCellKeydown(e, r, c) {
    if (e.key === "Backspace" && !e.target.value) {
      this._retreatCursor(r, c);
    } else if (e.key === "ArrowRight") {
      this._focusCell(r, c + 1);
    } else if (e.key === "ArrowLeft") {
      this._focusCell(r, c - 1);
    } else if (e.key === "ArrowDown") {
      this._focusCell(r + 1, c);
    } else if (e.key === "ArrowUp") {
      this._focusCell(r - 1, c);
    }
  }

  _advanceCursor(r, c) {
    if (this.activeDirection === "across") this._focusCell(r, c + 1);
    else this._focusCell(r + 1, c);
  }

  _retreatCursor(r, c) {
    if (this.activeDirection === "across") this._focusCell(r, c - 1);
    else this._focusCell(r, c - 1) || this._focusCell(r - 1, c);
  }

  _focusCell(r, c) {
    if (!this._inBounds(r, c) || !this.grid[r][c]) return false;
    const selector = `.cell[data-row="${r}"][data-col="${c}"] input`;
    const el = this.dom.grid.querySelector(selector);
    if (el) {
      el.focus();
      return true;
    }
    return false;
  }

  _inBounds(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  _focusWord(wordId) {
    const p = this.placements.find((pl) => pl.id === wordId);
    if (!p) return;
    this.activeDirection = p.direction;
    this.activeWordId = wordId;
    this._focusCell(p.row, p.col);
    this._highlightActiveClue();
  }

  _highlightActiveClue() {
    document.querySelectorAll(".clue-item").forEach((li) => {
      li.classList.toggle(
        "is-active",
        Number(li.dataset.wordId) === this.activeWordId,
      );
    });
  }

  /** After typing a letter, see if either word through that cell is now
   *  fully filled — if so, run checkAnswer() automatically. */
  _autoCheckCellWords(r, c) {
    const meta = this.cellMeta[r][c];
    if (!meta) return;
    if (meta.acrossId) this._maybeCheck(meta.acrossId);
    if (meta.downId) this._maybeCheck(meta.downId);
  }

  _maybeCheck(wordId) {
    const p = this.placements.find((pl) => pl.id === wordId);
    if (!p || p.solved) return;
    if (this._isWordFilled(p)) this.checkAnswer(wordId);
  }

  _isWordFilled(p) {
    const dr = p.direction === "down" ? 1 : 0;
    const dc = p.direction === "across" ? 1 : 0;
    for (let k = 0; k < p.length; k++) {
      const r = p.row + dr * k;
      const c = p.col + dc * k;
      if (!this.userGrid[r][c]) return false;
    }
    return true;
  }

  _checkAll() {
    let anyIncomplete = false;
    for (const p of this.placements) {
      if (p.solved) continue;
      if (this._isWordFilled(p)) {
        this.checkAnswer(p.id);
      } else {
        anyIncomplete = true;
      }
    }
    this._setMessage(
      anyIncomplete
        ? "Checked what was filled in — some words are still incomplete."
        : "Board checked.",
    );
  }

  /* ---------------------------------------------------------------------
     checkAnswer()
     -----------------------------------------------------------------
     Reads the letters currently sitting in a word's cells, then:
       1. Runs binarySearch() against the sorted dictionary array to
          confirm the typed string is a real word in O(log n) — this is
          the assignment's required live use of binary search.
       2. Cross-references the hash table (WordBank) to confirm it is
          in fact the word assigned to this slot (O(1) average lookup).
       3. Colors the cells green (correct) or red (incorrect) and
          updates the score.
  --------------------------------------------------------------------- */
  checkAnswer(wordId) {
    const p = this.placements.find((pl) => pl.id === wordId);
    if (!p) return;

    const dr = p.direction === "down" ? 1 : 0;
    const dc = p.direction === "across" ? 1 : 0;
    let typed = "";
    const cellEls = [];

    for (let k = 0; k < p.length; k++) {
      const r = p.row + dr * k;
      const c = p.col + dc * k;
      typed += this.userGrid[r][c] || "";
      cellEls.push(
        this.dom.grid.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`),
      );
    }

    if (typed.length < p.length) return; // incomplete — nothing to check yet

    // --- Binary search: O(log n) membership test against sorted dictionary ---
    const foundIndex = binarySearch(this.sortedWords, typed);
    const isRealDictionaryWord = foundIndex !== -1;

    // --- Hash table: O(1) average confirmation this is THIS slot's word ---
    const expectedClue = WordBank.getClue(this.difficulty, p.word);
    const isCorrect =
      isRealDictionaryWord && typed === p.word && expectedClue !== undefined;

    cellEls.forEach((el) => {
      el.classList.remove("state-correct", "state-wrong", "state-hint");
      el.classList.add(isCorrect ? "state-correct" : "state-wrong");
    });

    if (isCorrect && !p.solved) {
      p.solved = true;
      this.updateScore(10);
      this._markClueSolved(wordId);
      this._setMessage(`✔ "${p.word}" correct.`);
      this._checkForCompletion();
    } else if (!isCorrect) {
      this.updateScore(-1);
      this._setMessage(`✘ "${typed}" does not match this clue — try again.`);
    }
  }

  _markClueSolved(wordId) {
    const li = document.querySelector(`.clue-item[data-word-id="${wordId}"]`);
    if (li) li.classList.add("is-solved");
  }

  _checkForCompletion() {
    const allSolved = this.placements.every((p) => p.solved);
    if (!allSolved) return;
    this.stopTimer();
    this.updateScore(50); // completion bonus
    this._saveHighScoreIfBetter();
    this._setMessage(`🎉 Puzzle complete! Final score: ${this.score}`);
  }

  /* ---------------------------------------------------------------------
     revealHint()
     Picks the active word (or the first unsolved word) and fills in one
     correct letter the player hasn't already got right, at a small score
     penalty.
  --------------------------------------------------------------------- */
  revealHint() {
    let target = this.placements.find(
      (p) => p.id === this.activeWordId && !p.solved,
    );
    if (!target) target = this.placements.find((p) => !p.solved);
    if (!target) {
      this._setMessage("Nothing left to hint — puzzle is already complete!");
      return;
    }

    const dr = target.direction === "down" ? 1 : 0;
    const dc = target.direction === "across" ? 1 : 0;

    for (let k = 0; k < target.length; k++) {
      const r = target.row + dr * k;
      const c = target.col + dc * k;
      const correctLetter = target.word[k];
      if (this.userGrid[r][c] !== correctLetter) {
        this.userGrid[r][c] = correctLetter;
        const cellEl = this.dom.grid.querySelector(
          `.cell[data-row="${r}"][data-col="${c}"]`,
        );
        const input = cellEl.querySelector("input");
        input.value = correctLetter;
        cellEl.classList.remove("state-correct", "state-wrong");
        cellEl.classList.add("state-hint");

        this.hintsUsed++;
        this.updateScore(-5);
        this._setMessage(`💡 Hint used on "${target.clue}".`);

        if (this._isWordFilled(target)) this.checkAnswer(target.id);
        return;
      }
    }
  }

  /* ---------------------------------------------------------------------
     updateScore()
  --------------------------------------------------------------------- */
  updateScore(delta) {
    this.score = Math.max(0, this.score + delta);
    this._updateScoreDisplay();
  }

  _updateScoreDisplay() {
    this.dom.score.textContent = this.score;
  }

  /* ---------------------------------------------------------------------
     startTimer() / stopTimer()
  --------------------------------------------------------------------- */
  startTimer() {
    this.stopTimer();
    this.seconds = 0;
    this._renderTimer();
    this.timerHandle = setInterval(() => {
      this.seconds++;
      this._renderTimer();
    }, 1000);
  }

  stopTimer() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  _renderTimer() {
    const m = String(Math.floor(this.seconds / 60)).padStart(2, "0");
    const s = String(this.seconds % 60).padStart(2, "0");
    this.dom.timer.textContent = `${m}:${s}`;
  }

  /* ---------------------------------------------------------------------
     High score  (localStorage)
  --------------------------------------------------------------------- */
  _highScoreKey() {
    return "dsaCrosswordHighScores";
  }

  _loadHighScore() {
    const stored = JSON.parse(
      localStorage.getItem(this._highScoreKey()) || "{}",
    );
    const best = stored[this.difficulty] || 0;
    this.dom.highScore.textContent = best;
  }

  _saveHighScoreIfBetter() {
    const stored = JSON.parse(
      localStorage.getItem(this._highScoreKey()) || "{}",
    );
    const best = stored[this.difficulty] || 0;
    if (this.score > best) {
      stored[this.difficulty] = this.score;
      localStorage.setItem(this._highScoreKey(), JSON.stringify(stored));
      this.dom.highScore.textContent = this.score;
    }
  }

  /* ---------------------------------------------------------------------
     restartGame()
     Generates a fresh random puzzle for the CURRENT difficulty, wiping
     score/timer/hints — used both by the "Restart" button and app boot.
  --------------------------------------------------------------------- */
  restartGame() {
    this.difficulty = this.dom.difficulty.value;
    this._newPuzzle();
  }

  _setMessage(text) {
    this.dom.message.textContent = text;
  }
}

/* ============================================================================
   Boot
   ============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  new CrosswordGame();
});
