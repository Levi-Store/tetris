const gameBoard = document.getElementById('game-board');
const width = 10; // Number of cells per row
const height = 20; // Number of rows
const grid = [];

// Tetromino shapes (rotations included)
const tetrominoes = [
  {
    shape: [
      [1, width + 1, width * 2 + 1, 2], // L shape (rotations)
      [width, width + 1, width + 2, width * 2 + 2],
      [1, width + 1, width * 2 + 1, width * 2],
      [width, width * 2, width * 2 + 1, width * 2 + 2],
    ],
    color: 'orange',
  },
  {
    shape: [
      [0, width, width + 1, width * 2 + 1], // Z shape
      [width + 1, width + 2, width * 2, width * 2 + 1],
      [0, width, width + 1, width * 2 + 1],
      [width + 1, width + 2, width * 2, width * 2 + 1],
    ],
    color: 'red',
  },
  {
    shape: [
      [1, width, width + 1, width + 2], // T shape
      [1, width + 1, width + 2, width * 2 + 1],
      [width, width + 1, width + 2, width * 2 + 1],
      [1, width, width + 1, width * 2 + 1],
    ],
    color: 'purple',
  },
  {
    shape: [
      [0, 1, width, width + 1], // O shape (square)
      [0, 1, width, width + 1],
      [0, 1, width, width + 1],
      [0, 1, width, width + 1],
    ],
    color: 'yellow',
  },
  {
    shape: [
      [1, width + 1, width * 2 + 1, width * 3 + 1], // I shape
      [width, width + 1, width + 2, width + 3],
      [1, width + 1, width * 2 + 1, width * 3 + 1],
      [width, width + 1, width + 2, width + 3],
    ],
    color: 'cyan',
  },
];

// Current Tetromino
let currentPosition = 4;
let currentRotation = 0;
let currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
let currentColor = currentTetromino.color;

// Create the grid
function createGrid() {
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gameBoard.appendChild(cell);
    grid.push(cell);
  }
  // Add "taken" cells for the bottom boundary
  for (let i = 0; i < width; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell', 'taken');
    gameBoard.appendChild(cell);
    grid.push(cell);
  }
}
createGrid();

// Draw the Tetromino
function draw() {
  currentTetromino.shape[currentRotation].forEach(index => {
    const cell = grid[currentPosition + index];
    cell.classList.add('filled');
    cell.style.backgroundColor = currentColor;
  });
}

// Undraw the Tetromino
function undraw() {
  currentTetromino.shape[currentRotation].forEach(index => {
    const cell = grid[currentPosition + index];
    cell.classList.remove('filled');
    cell.style.backgroundColor = '';
  });
}

// Move down
function moveDown() {
  undraw();
  currentPosition += width;
  if (
    currentTetromino.shape[currentRotation].some(index =>
      grid[currentPosition + index]?.classList.contains('taken')
    )
  ) {
    currentPosition -= width;
    freeze();
  }
  draw();
}

// Freeze the Tetromino
function freeze() {
  if (
    currentTetromino.shape[currentRotation].some(index =>
      grid[currentPosition + index + width]?.classList.contains('taken')
    )
  ) {
    currentTetromino.shape[currentRotation].forEach(index => {
      const cell = grid[currentPosition + index];
      cell.classList.add('taken');
      cell.classList.add('filled');
      cell.style.backgroundColor = currentColor;
    });
    checkRows();
    newTetromino();
  }
}

// Move left
function moveLeft() {
  undraw();
  const isAtLeftEdge = currentTetromino.shape[currentRotation].some(
    index => (currentPosition + index) % width === 0
  );
  if (!isAtLeftEdge) currentPosition -= 1;
  if (collision()) currentPosition += 1;
  draw();
}

// Move right
function moveRight() {
  undraw();
  const isAtRightEdge = currentTetromino.shape[currentRotation].some(
    index => (currentPosition + index) % width === width - 1
  );
  if (!isAtRightEdge) currentPosition += 1;
  if (collision()) currentPosition -= 1;
  draw();
}

// Rotate Tetromino
function rotate() {
  undraw();
  currentRotation = (currentRotation + 1) % currentTetromino.shape.length;
  if (collision()) currentRotation = (currentRotation - 1 + currentTetromino.shape.length) % currentTetromino.shape.length;
  draw();
}

// Check for collision
function collision() {
  return currentTetromino.shape[currentRotation].some(index =>
    grid[currentPosition + index]?.classList.contains('taken')
  );
}

// Check for completed rows
function checkRows() {
  for (let i = 0; i < grid.length; i += width) {
    const row = Array.from({ length: width }, (_, j) => i + j);
    if (row.every(index => grid[index].classList.contains('taken'))) {
      row.forEach(index => {
        grid[index].classList.remove('taken', 'filled');
        grid[index].style.backgroundColor = '';
      });
      const removed = grid.splice(i, width);
      grid.unshift(...removed.map(() => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        return cell;
      }));
      gameBoard.innerHTML = '';
      grid.forEach(cell => gameBoard.appendChild(cell));
    }
  }
}

// Spawn a new Tetromino
function newTetromino() {
  currentPosition = 4;
  currentRotation = 0;
  currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  currentColor = currentTetromino.color;
  if (collision()) {
    alert('Game Over');
    clearInterval(timerId);
  }
}

// Controls
function control(e) {
  if (e.key === 'a') moveLeft();
  if (e.key === 'd') moveRight();
  if (e.key === 'w') rotate();
  if (e.key === 's') moveDown();
}
document.addEventListener('keydown', control);

// Game loop
let timerId = setInterval(moveDown, 1000);

draw();
