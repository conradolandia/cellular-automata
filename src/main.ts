import './app.css';

const BOARD_ROWS = 64;
const BOARD_COLS = BOARD_ROWS;

type Cell = number;
type Board = Cell[][];

function createBoard(): Board {
  const board: Board = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    board.push(new Array<Cell>(BOARD_COLS).fill(0));
  }
  return board;
}

let currentBoard: Board = createBoard();
let nextBoard: Board = createBoard();

function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

function countNbors(board: Board, nbors: number[], r0: number, c0: number) {
  nbors.fill(0);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr != 0 || dc != 0) {
        const r = mod(r0 + dr, BOARD_ROWS);
        const c = mod(c0 + dc, BOARD_COLS);
        nbors[board[r][c]]++;
      }
    }
  }
}

// Automaton

interface State {
  default: number;
  color: string;
  transitions: {
    [key: string]: number;
  };
}

type Automaton = State[];

export const Seeds: Automaton = [
  {
    transitions: { '62': 1 },
    default: 0,
    color: '#181818',
  },
  {
    transitions: {},
    default: 0,
    color: '#ff6060',
  },
];

export const GoL: Automaton = [
  {
    transitions: { '53': 1 },
    default: 0,
    color: '#181818',
  },
  {
    transitions: { '62': 1, '53': 1 },
    default: 0,
    color: '#ff6060',
  },
];

export const BB: Automaton = [
  {
    transitions: {
      '026': 1,
      '125': 1,
      '224': 1,
      '323': 1,
      '422': 1,
      '521': 1,
      '620': 1,
    },
    default: 0,
    color: '#181818',
  },
  {
    transitions: {},
    default: 2,
    color: '#ff6060',
  },
  {
    transitions: {},
    default: 0,
    color: '#aaffaa',
  },
];

// NextBaord

const computeNextBoard = (
  automaton: Automaton,
  current: Board,
  next: Board
) => {
  const nbors = new Array(automaton.length).fill(0);
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      countNbors(current, nbors, r, c);
      const state = automaton[current[r][c]];
      next[r][c] = state.transitions[nbors.join('')];
      if (next[r][c] === undefined) next[r][c] = state['default'];
    }
  }
};

// renderBoard

const renderBoard = (
  ctx: CanvasRenderingContext2D,
  automaton: Automaton,
  board: Board
) => {
  const CELL_WIDTH = ctx.canvas.width / BOARD_COLS;
  const CELL_HEIGHT = ctx.canvas.height / BOARD_ROWS;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const x = c * CELL_WIDTH;
      const y = r * CELL_HEIGHT;
      ctx.fillStyle = automaton[board[r][c]].color;
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    }
  }
};

export const initialize = () => {
  const automata = [
    [`Game of life`, GoL],
    [`Seeds`, Seeds],
    [`Brian's Brain`, BB],
  ];

  let automaton = 2;
  localStorage.setItem('automaton', String(automaton));

  const canvasId = 'appCanvas';

  const appCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (appCanvas === null) {
    throw new Error(`Can't find element ${canvasId}`);
  }

  appCanvas.width = 800;
  appCanvas.height = 800;

  const ctx = appCanvas.getContext('2d');
  if (ctx === null) {
    throw new Error(`Can't initializa 2d context`);
  }

  const nextId = 'next';
  const nextBtn = document.getElementById(nextId) as HTMLButtonElement;

  appCanvas.addEventListener('click', e => {
    const CELL_WIDTH = appCanvas.width / BOARD_COLS;
    const CELL_HEIGHT = appCanvas.height / BOARD_ROWS;
    const row = Math.floor(e.offsetY / CELL_HEIGHT);
    const col = Math.floor(e.offsetX / CELL_WIDTH);
    const state = document.getElementsByName('state');
    for (let i = 0; i < state.length; i++) {
      if ((state[i] as HTMLInputElement).checked) {
        currentBoard[row][col] = i;
        renderBoard(ctx, currentAutomaton, currentBoard);
        return;
      }
    }
  });

  const activeAutomaton = (automaton: number, returnObject: boolean = true) => {
    return !returnObject
      ? (automata[automaton][0] as string)
      : (automata[automaton][1] as Automaton);
  };

  const currentAutomaton = activeAutomaton(automaton) as Automaton;
  const currentAutomatonName = activeAutomaton(automaton, false) as string;

  const automataList: string[] = [];
  automata.forEach(automaton => automataList.push(automaton[0] as string));

  let output: string = '';
  automataList.forEach((value, index) => {
    const checked = index === automaton ? 'checked' : '';
    output += `<div class=${value === currentAutomatonName ? true : false}>
<input type="radio" id=${index} name="current" value=${value} ${checked} />
<label for=${index}>${value}</label>
</div>
`;
  });

  const list = document.getElementById('list');
  if (list !== null) list.innerHTML = `${output}`;

  nextBtn.addEventListener('click', () => {
    computeNextBoard(currentAutomaton, currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
    renderBoard(ctx, currentAutomaton, currentBoard);
  });

  renderBoard(ctx, currentAutomaton, currentBoard);
};

import App from './App.svelte';

const app = new App({
  target: document.getElementById('app'),
});

export default app;
initialize();
