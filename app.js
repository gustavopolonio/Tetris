document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid")
  let squares = Array.from(document.querySelectorAll(".grid div"))
  console.log(squares)
  const scoreDisplay = document.querySelector("#score")
  const startBtn = document.querySelector("#start-button")
  const restartButton = document.querySelector("#restart-button");
  const width = 10
  let nextRandom = 0
  let timerId = 0;
  let score = 0

  // The Tetraminoes
  const lTetramino = [
    [1, 2, width + 1, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, 1 + width, width * 2, 1 + width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ]

  const zTetramino = [
    [1, 2, width, width + 1],
    [0, width, width + 1, width * 2 + 1],
    [1, 2, width, width + 1],
    [0, width, width + 1, width * 2 + 1]
  ]

  const tTetramino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ]

  const oTetramino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ]

  const iTetramino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ]

  const theTetraminos = [lTetramino, zTetramino, tTetramino, oTetramino, iTetramino]

  let currentPosition = 3
  let currentRotation = 0

  // Select a random Tetramino and its first rotation
  let random = Math.floor(Math.random() * theTetraminos.length)
  let current = theTetraminos[random][currentRotation]

  // draw the first rotation in the random Tetramino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add("tetramino")
    })
  }
  draw()

  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove("tetramino")
    })
  }

  // Move down function
  function moveDown() {
    freeze()

    if (newTetramino) {
      return;
    }

    undraw()

    currentPosition += width
    draw()
  }

  const rotationNext = 0
  let newTetramino = false;
  // Freeze function
  function freeze() {
    newTetramino = false;
    if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
      current.forEach(index => squares[currentPosition + index].classList.add("taken"))
      // Start a new tetramino
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetraminos.length)
      currentPosition = 3
      current = theTetraminos[random][rotationNext]
      draw()
      displayShape()
      addScore()
      gameOver()
      newTetramino = true;
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
      currentRotation--
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

  // Show up Next tetramino in mini grid
  const displaySquares = document.querySelectorAll(".mini-grid div")
  const displayWidth = 5
  let displayIndex = 1

  // The tetraminos without rotations
  const upNextTetraminos = [
    [1, 2, 1 + displayWidth, 1 + 2 * displayWidth],
    [1 + displayWidth, 2 + displayWidth, 2 * displayWidth, 1 + 2 * displayWidth],
    [1, displayWidth, 1 + displayWidth, 2 + displayWidth],
    [0, 1, displayWidth, 1 + displayWidth],
    [1, 1 + displayWidth, 1 + 2 * displayWidth, 1 + 3 * displayWidth]
  ]

  // Display the shape in mini grid
  function displayShape() {
    // Remove any trace of a tatramino form the entire grid
    displaySquares.forEach(square => {
      square.classList.remove("tetramino")
    })
    upNextTetraminos[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add("tetramino")
    })
  }

  nextRandom = Math.floor(Math.random() * theTetraminos.length)
  displayShape()

  // Assign functions to keycodes
  function control(event) {
    if (event.keyCode === 37) {
      moveLeft()
    } else if (event.keyCode === 39) {
      moveRight()
    } else if (event.keyCode === 38) {
      rotate()
    } else if (event.keyCode === 40) {
      moveDown()
    }
  }

  // Button Play/Pause
  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
      document.removeEventListener("keyup", control)
    } else {
      timerId = setInterval(moveDown, 250)
      document.addEventListener("keyup", control)
    }
  })

  function addScore() {
    for (var i = 0; i < 199; i += width) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

      if (row.every(index => squares[index].classList.contains("taken"))) {
        score += 10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove("taken")
          squares[index].classList.remove("tetramino")
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
  }

  function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      clearInterval(timerId)
      document.removeEventListener("keyup", control);
      scoreDisplay.innerHTML = "GAME OVER"

    }
  }

  restartButton.addEventListener("click", () => {
    window.location.reload();
  })

})

