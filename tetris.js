const canvas = document.getElementById("game_space");
const context = canvas.getContext("2d");
const grid = 32;
const tetrominoSeq = [];
let score = 0;

const updateScore = () => {
  score += 10;
};

const color = {
  I: "cyan",
  O: "yellow",
  T: "purple",
  S: "green",
  Z: "red",
  J: "blue",
  L: "orange",
};

const tetrominos = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  };

const playfield = Array.from({ length: 20 }, () => Array(10).fill(0));



function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function genSequence() {
  const sequence = ["I", "J", "L", "O", "S", "T", "Z"];

  for (let i = 0; i < sequence.length; i++) {
    const random = getRandomNum(0, sequence.length - 1);
    const name = sequence[random];
    tetrominoSeq.push(name);
    sequence.splice(random, 1);
  }
}




function getNextTetronimo() {
  while (tetrominoSeq.length === 0) {
    genSequence();
  }

  const name = tetrominoSeq.pop();
  const matrix = tetrominos[name];
  const col = Math.floor((playfield[0].length - matrix[0].length) / 2);
  const row = name === "I" ? -1 : -2;

  return {
    name,
    matrix,
    row,
    col,
  };

}

function rotate(matrix) {
  const len = matrix.length;
  const rotated = [];

  for (let i = 0; i < len; i++) {
    rotated[i] = [];
    for (let j = 0; j < len; j++) {
      rotated[i][j] = matrix[len - 1 - j][i];
    }
  }

  return rotated;
}

function isValidMove(matrix, rowOfCell, colOfCell) {
  let row = 0;
  let col = 0;

  while (row < matrix.length) {
    if (matrix[row][col]) {
      const newRow = rowOfCell + row;
      const newCol = colOfCell + col;

      if (
        newCol < 0 ||
        newCol >= playfield[0].length ||
        newRow >= playfield.length ||
        playfield[newRow][newCol]
      ) {
        return false;
      }
    }

    col++;
    if (col >= matrix[row].length) {
      col = 0;
      row++;
    }
  }

  return true;
}

function placeTetro() {
  let row = 0;

  while (row < tetro.matrix.length) {
    for (let col = 0; col < tetro.matrix[row].length; col++) {
      if (tetro.matrix[row][col]) {
        if (tetro.row + row < 0) {
          return gameOver();
        }
        playfield[tetro.row + row][tetro.col + col] = tetro.name;
      }
    }
    row++;
  }

  let currentRow = playfield.length - 1;
  while (currentRow >= 0) {
    if (playfield[currentRow].every((cell) => !!cell)) {
      for (let i = currentRow; i >= 0; i--) {
        for (let j = 0; j < playfield[i].length; j++) {
          playfield[i][j] = playfield[i - 1][j];
        }
      }
      updateScore();
    } else {
      currentRow--;
    }
  }

  tetro = getNextTetronimo();
}

function gameOver() {
  cancelAnimationFrame(aniFrame);
  context.fillStyle = "black";
  context.globalAlpha = 0.75;
  context.fillText(0, canvas.height / 2 - 30, canvas.width, 60);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;
  context.fillStyle = "white";
  context.font = "38px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  gameEnd = true;
}

function pause() {
  if (!pauseStatus) {
    cancelAnimationFrame(aniFrame);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 0.75;
    context.globalAlpha = 1;
    context.fillStyle = "white";
    context.font = "38px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Pause", canvas.width / 2, canvas.height / 2);
  }
  pauseStatus = true;
}

let row = -2;
while (row < 20) {
  playfield[row] = [];

  let col = 0;
  while (col < 10) {
    playfield[row][col] = 0;
    col++;
  }

  row++;
}

function play() {
  if (!pauseStatus) {
    return;
  }

  aniFrame = requestAnimationFrame(runtime);

  while (gameEnd) {
    gameEnd = false;
    aniFrame = null;
    runtime();
  }

  pauseStatus = false;
}

let pauseStatus = true;
let gameEnd = false;
let count = 0;
let tetro = getNextTetronimo();
let aniFrame = null;

function runtime() {
  aniFrame = requestAnimationFrame(runtime);
  context.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("score_count").innerHTML = score;
  if (gameEnd) {
    return;
  }
  if (pauseStatus) {
    return;
  }

  let row = 0;
  while (row < 20) {
    let col = 0;
    while (col < 10) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = color[name];
        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
      col++;
    }
    row++;
  }

  if (tetro) {
    if (++count > 35) {
      tetro.row++;
      count = 0;
      if (!isValidMove(tetro.matrix, tetro.row, tetro.col)) {
        tetro.row--;
        placeTetro();
      }
    }
    context.fillStyle = color[tetro.name];

    let tetroRow = 0;
    while (tetroRow < tetro.matrix.length) {
      let tetroCol = 0;
      while (tetroCol < tetro.matrix[tetroRow].length) {
        if (tetro.matrix[tetroRow][tetroCol]) {
          context.fillRect(
            (tetro.col + tetroCol) * grid,
            (tetro.row + tetroRow) * grid,
            grid - 1,
            grid - 1
          );
        }
        tetroCol++;
      }
      tetroRow++;
    }
  }
}

function hardDrop() {
  var row = tetro.row + 1;
  while (isValidMove(tetro.matrix, row, tetro.col)) {
    row++;
  }
  if (!isValidMove(tetro.matrix, row, tetro.col)) {
    tetro.row = row - 1;

    placeTetro();
    return;
  }
  tetro.row = row;
}
document.addEventListener("keydown", function (e) {
  switch (e.which) {
    case 37:
    case 39:
      const column = e.which === 37 ? tetro.col - 1 : tetro.col + 1;
      if (isValidMove(tetro.matrix, tetro.row, column)) {
        tetro.col = column;
      }
      break;

    case 38:
      const matrix = rotate(tetro.matrix);
      if (isValidMove(matrix, tetro.row, tetro.col)) {
        tetro.matrix = matrix;
      }
      break;

    case 40:
      const row = tetro.row + 1;
      if (!isValidMove(tetro.matrix, row, tetro.col)) {
        tetro.row = row - 1;
        placeTetro();
        return;
      }
      tetro.row = row;
      break;

    case 32:
      if (!gameEnd && !pauseStatus) {
        hardDrop();
      }
      break;

    case 80:
      if (!gameEnd && !pauseStatus) {
        pause();
      }
      break;

    case 27:
      gameOver();
      break;
  }
});
