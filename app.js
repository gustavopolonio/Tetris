document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid")
    let squares = Array.from(document.querySelectorAll(".grid div"))
    const scoreDisplay = document.querySelector("#score")
    const startBtn = document.querySelector("#start-button")
    const width = 10
    let nextRandom = 0
    let timerId
    let score = 0

    // The Tetraminoes
    const lTetramino = [
        [1, 2, width + 1, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, 1 + width, width * 2, 1 + width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]

    const zTetramino = [
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
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

    // Make tetramino move down every second
    // timerId = setInterval(moveDown, 300)

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
    document.addEventListener("keyup", control)

    // Move down function
    function moveDown() {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    const rotationNext = 0
    // Freeze function
    function freeze() {
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
        }
    }

    function moveLeft() {
        undraw()
        const isALeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if (!isALeftEdge) { currentPosition -= 1 }

        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) { currentPosition += 1 }

        draw()
    }

    function moveRight() {
        undraw()
        const isARightEdge = current.some(index => (currentPosition + index) % width === width - 1)

        if (!isARightEdge) { currentPosition += 1 }

        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) { currentPosition -= 1 }

        draw()
    }

    function rotate() {
        undraw()
        currentRotation++
        if (currentRotation === current.length) {
            currentRotation = 0
        }
        current = theTetraminos[random][currentRotation]
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

    // Button Play/Pause
    startBtn.addEventListener("click", () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            timerId = setInterval(moveDown, 300)
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
            scoreDisplay.innerHTML = "GAME OVER"
        }
    }

})

