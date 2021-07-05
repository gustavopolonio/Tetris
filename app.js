document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  const restartButton = document.querySelector("#restart-button");
  const width = 10;
  let nextRandom = 0;
  let timerId = 0;
  let score = 0;
  const completedLineAudio = new Audio("./audios/completedLine.wav");
  const gameOverAudio = new Audio("./audios/gameOver.wav");
  const tetraminoFreezeAudio = new Audio("./audios/tetraminoFreeze.wav");

  // The Tetraminoes
  const lTetramino = [
    [1, 2, width + 1, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, 1 + width, width * 2, 1 + width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ];

  const zTetramino = [
    [1, 2, width, width + 1],
    [0, width, width + 1, width * 2 + 1],
    [1, 2, width, width + 1],
    [0, width, width + 1, width * 2 + 1]
  ];

  const tTetramino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ];

  const oTetramino = [
    [1, 2, 1 + width, width + 2],
    [1, 2, 1 + width, width + 2],
    [1, 2, 1 + width, width + 2],
    [1, 2, 1 + width, width + 2]
  ];

  const iTetramino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ];

  const theTetraminos = [lTetramino, zTetramino, tTetramino, oTetramino, iTetramino];

  let currentPosition = 3;
  let currentRotation = 0;

  // Select a random Tetramino and its first rotation
  let random = Math.floor(Math.random() * theTetraminos.length);
  let current = theTetraminos[random][currentRotation];

  const collors = ["blue", "yellow", "red", "orange", "pink"];
  let currentCollor = Math.floor(Math.random() * collors.length);
  let nextCollor = Math.floor(Math.random() * collors.length);

  // draw the first rotation in the random Tetramino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add("tetramino");
      squares[currentPosition + index].classList.add(`${collors[currentCollor]}`);
    })
  }
  draw();

  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove("tetramino");
      squares[currentPosition + index].classList.remove(`${collors[currentCollor]}`);
    })
  }

  // Move down function
  function moveDown() {
    freeze()

    if (newTetramino) {
      return;
    }

    undraw();

    currentPosition += width;
    draw();
  }

  let newTetramino = false;
  // Freeze function
  function freeze() {
    newTetramino = false;
    if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
      current.forEach(index => squares[currentPosition + index].classList.add("taken"))
      // Start a new tetramino
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetraminos.length)
      currentPosition = 3;
      currentRotation = 0;
      const rotationNext = 0;
      current = theTetraminos[random][rotationNext];
      currentCollor = nextCollor;
      score += 13;
      scoreDisplay.innerHTML = score;
      addScore();
      draw();
      nextCollor = Math.floor(Math.random() * collors.length);
      displayShape();
      gameOver();
      newTetramino = true;
      tetraminoFreezeAudio.play();
    }
  }

  function moveLeft() {
    undraw()
    const isALeftEdge = current.some(index => (index + currentPosition) % width === 0);

    if (!isALeftEdge ) { currentPosition -= 1 }

    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) { 
      currentPosition += 1 
    }

    draw()
  }

  function moveRight() {
    undraw()
    const isARightEdge = current.some(index => (index + currentPosition) % width === width - 1);

    if (!isARightEdge) { currentPosition += 1 }

    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) { 
      currentPosition -= 1 
    }

    draw()
  }

  // Verify if is a left or right edge, and if there is tetraminos around
  function rotate() {
    undraw()

    currentRotation++
    if (currentRotation === current.length) {
      currentRotation = 0
    }
    current = theTetraminos[random][currentRotation]

    const rightEdge = current.some(index => (index + currentPosition) % width === width - 1);
    const leftEdge = current.some(index => (index + currentPosition) % width === 0);
   
    // Don't let Tetramino break when rotate in a edge
    if (rightEdge && leftEdge) {
      if (currentRotation === 0) {
        currentRotation = current.length - 1;
      } else {
        currentRotation--
      }

      current = theTetraminos[random][currentRotation]
    }

    //  Don't let an Tetramino get inside another when rotate
    if (current.some(index => squares[index + currentPosition].classList.contains('taken'))) {
      if (currentRotation === 0) {
        currentRotation = current.length - 1;
      } else {
        currentRotation--
      }

      current = theTetraminos[random][currentRotation]
    }

    draw()
  }

  // See if is mobile or web
  const isMobile = window.matchMedia('(max-width: 450px)').matches;
  const commandsController = document.querySelector(".commands-controller");
  const leftButton = document.getElementById("leftButton");
  const rightButton = document.getElementById("rightButton");
  const downButton = document.getElementById("downButton");
  const rotateButton = document.getElementById("rotateButton");

  let upNextTetraminos = [];
  let displayIndex = 0;

  if (isMobile) {
    // Show up Next tetramino in mini grid
    const displayWidth = 4;
    displayIndex = 0;

    // The tetraminos without rotations
    upNextTetraminos = [
      [1, 2, 1 + displayWidth, 1 + 2 * displayWidth],
      [1 + displayWidth, 2 + displayWidth, displayWidth * 2, 1 + displayWidth * 2],
      [1 + displayWidth, displayWidth * 2, 1 + displayWidth * 2, 2 + displayWidth * 2],
      [1 + displayWidth, 2 + displayWidth, 1 + displayWidth * 2, 2 + displayWidth * 2],
      [1, 1 + displayWidth, 1 + 2 * displayWidth, 1 + 3 * displayWidth]
    ]
  } else {
    commandsController.remove();

    const displayWidth = 6
    displayIndex = 6

    upNextTetraminos = [
      [2, 3, 2 + displayWidth, 2 + 2 * displayWidth],
      [2 + displayWidth, 3 + displayWidth, 1 + displayWidth * 2, 2 + displayWidth * 2],
      [2 + displayWidth, 1 + displayWidth * 2, 2 + displayWidth * 2, 3 + displayWidth * 2],
      [2 + displayWidth, 3 + displayWidth, 2 + displayWidth * 2, 3 + displayWidth * 2],
      [2, 2 + displayWidth, 2 + 2 * displayWidth, 2 + 3 * displayWidth]
    ]
  }

  const displaySquares = document.querySelectorAll(".mini-grid div")

  // Display the shape in mini grid
  function displayShape() {
    // Remove any trace of a tatramino form the entire grid
    displaySquares.forEach(square => {
      square.classList.remove("tetramino")
      square.classList.remove(`${collors[currentCollor]}`)
    })

    upNextTetraminos[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add("tetramino");
      displaySquares[displayIndex + index].classList.add(`${collors[nextCollor]}`)
    })
  }

  nextRandom = Math.floor(Math.random() * theTetraminos.length)
  displayShape()

  if (isMobile) {
    function control() {
      leftButton.addEventListener("click", moveLeft);
      rightButton.addEventListener("click", moveRight);
      downButton.addEventListener("click", moveDown);
      rotateButton.addEventListener("click", rotate);
    }
  } else {
    // Assign functions to keycodes
    function control(event) {
      if (event.keyCode === 37) {
        moveLeft()
      } else if (event.keyCode === 39) {
        moveRight()
      } else if (event.keyCode === 38 || event.keyCode === 32 || event.keyCode === 13) {
        rotate()
      } else if (event.keyCode === 40) {
        moveDown()
      }
    }
  }

  // Button Play/Pause
  startBtn.addEventListener("mousedown", () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
      document.removeEventListener("keydown", control)
    } else {
      if (isMobile) {
        document.addEventListener("click", control)
      } else {
        document.addEventListener("keydown", control)
      }

      setTimeToMoveDown();
    }
  })

  let timeMoveDown = 700;

  function setTimeToMoveDown() {

    if (score <= 450) { 
      timeMoveDown = 500;
    } else if (450 < score && score <= 1000) { 
      timeMoveDown = 400;
    } else if (1000 < score && score <= 1700) { 
      timeMoveDown = 300;
    } else if (1700 < score && score <= 2700) { 
      timeMoveDown = 200;
    } else {
      timeMoveDown = 160;
    }

    timerId = setInterval(moveDown, timeMoveDown);
  }

  function addScore() {

    for (var i = 0; i < 199; i += width) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

      if (row.every(index => squares[index].classList.contains("taken"))) {
        score += 97;
        scoreDisplay.innerHTML = score;
        completedLineAudio.play();
        row.forEach(index => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetramino");
          squares[index].classList.remove("blue", "yellow", "red", "orange", "pink");
        })
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }

    clearInterval(timerId);
    setTimeToMoveDown();
  }


  function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      clearInterval(timerId)
      document.removeEventListener("keydown", control);
      score -= 13;
      scoreDisplay.innerHTML = score + " - GAME OVER";
      gameOverAudio.play();
      startBtn.setAttribute("disabled", "true")
      startBtn.classList.add("disabled")
    }
  }

  restartButton.addEventListener("click", () => {
    window.location.reload();
  })

})

