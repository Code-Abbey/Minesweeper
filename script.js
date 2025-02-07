class Minesweeper {
    constructor() {
        // Game settings
        this.size = 10; // Default grid size
        this.mines = 15; // Default number of mines
        this.minePositions = new Set();
        this.flags = new Set();
        this.tilesRevealed = 0;
        this.gameOver = false;

        // Get HTML elements
        this.homeScreen = document.getElementById("home-screen");
        this.aboutScreen = document.getElementById("about-screen");
        this.gameScreen = document.getElementById("game-screen");
        this.boardElement = document.getElementById("game-board");
        this.messageElement = document.getElementById("game-message");
        this.restartBtn = document.getElementById("restart-btn");
        this.scoreElement = document.getElementById("final-score");
        this.scoreValue = document.getElementById("score-value");

        // Load sound effects
        this.clickSound = new Audio("assets/sounds/camera-flash-204151.mp3");
        this.flagSound = new Audio("assets/sounds/coffee-maker-click-281299.mp3");
        this.explosionSound = new Audio("assets/sounds/explosion-sound-effect-2-241820.mp3");
        this.winSound = new Audio("assets/sounds/game-music-loop-3-144252.mp3");
        this.loseSound = new Audio("assets/sounds/game-music-loop-6-144641.mp3");

        // Event listeners for screen navigation
        document.getElementById("start-game-btn").addEventListener("click", () => this.showGameScreen());
        document.getElementById("about-btn").addEventListener("click", () => this.showAboutScreen());
        document.getElementById("back-to-home").addEventListener("click", () => this.showHomeScreen());
        this.restartBtn.addEventListener("click", () => this.startGame());
    }

    // Display home screen
    showHomeScreen() {
        this.homeScreen.classList.remove("hidden");
        this.aboutScreen.classList.add("hidden");
        this.gameScreen.classList.add("hidden");
    }

    // Display about screen
    showAboutScreen() {
        this.homeScreen.classList.add("hidden");
        this.aboutScreen.classList.remove("hidden");
    }

    // Display game screen and start a new game
    showGameScreen() {
        this.homeScreen.classList.add("hidden");
        this.aboutScreen.classList.add("hidden");
        this.gameScreen.classList.remove("hidden");
        this.startGame();
    }

    // Start a new game
    startGame() {
        // Get grid size and difficulty settings
        this.size = parseInt(document.getElementById("grid-size").value);
        let difficulty = document.getElementById("difficulty").value;
        this.mines = Math.floor(this.size * this.size * (difficulty === "easy" ? 0.1 : difficulty === "medium" ? 0.15 : 0.2));

        // Reset game state
        this.boardElement.innerHTML = "";
        this.minePositions.clear();
        this.flags.clear();
        this.tilesRevealed = 0;
        this.gameOver = false;
        this.messageElement.textContent = "";
        this.restartBtn.classList.add("hidden");
        this.scoreElement.classList.add("hidden");

        this.createBoard();
        this.placeMines();
    }

    // Create the game board
    createBoard() {
        this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        this.boardElement.innerHTML = "";
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 55px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.size}, 55px)`;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                tile.dataset.row = row;
                tile.dataset.col = col;

                tile.addEventListener("click", () => this.revealTile(row, col));
                tile.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    this.toggleFlag(row, col);
                });

                this.boardElement.appendChild(tile);
            }
        }
    }

    // Place mines randomly on the board
    placeMines() {
        while (this.minePositions.size < this.mines) {
            let row = Math.floor(Math.random() * this.size);
            let col = Math.floor(Math.random() * this.size);
            let position = `${row}-${col}`;
            if (!this.minePositions.has(position)) {
                this.minePositions.add(position);
            }
        }
    }

    // Reveal a tile
    revealTile(row, col) {
        if (this.gameOver || this.flags.has(`${row}-${col}`)) return;
        const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
        if (!tile || tile.classList.contains("revealed")) return;

        this.clickSound.play();

        if (this.minePositions.has(`${row}-${col}`)) {
            tile.classList.add("bomb");
            tile.textContent = "💣";
            this.explosionSound.play();
            setTimeout(() => this.loseSound.play(), 500);
            this.endGame(false);
        } else {
            let count = this.getAdjacentMineCount(row, col);
            tile.classList.add("revealed");
            tile.textContent = count > 0 ? count : "";
            this.tilesRevealed++;

            if (count === 0) {
                this.revealAdjacentTiles(row, col);
            }
            this.checkWin();
        }
    }

    // Count adjacent mines
    getAdjacentMineCount(row, col) {
        let count = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (this.minePositions.has(`${row + r}-${col + c}`)) count++;
            }
        }
        return count;
    }

    // Reveal adjacent empty tiles
    revealAdjacentTiles(row, col) {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                let newRow = row + r;
                let newCol = col + c;
                if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                    this.revealTile(newRow, newCol);
                }
            }
        }
    }

    // Toggle flag on a tile
    toggleFlag(row, col) {
        if (this.gameOver) return;
        const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
        if (!tile || tile.classList.contains("revealed")) return;

        let position = `${row}-${col}`;
        if (this.flags.has(position)) {
            this.flags.delete(position);
            tile.classList.remove("flagged");
            tile.textContent = "";
        } else {
            this.flags.add(position);
            tile.classList.add("flagged");
            tile.textContent = "🚩";
            this.flagSound.play();
        }
    }

    // Check if player has won
    checkWin() {
        if (this.tilesRevealed + this.mines === this.size * this.size) {
            this.winSound.play();
            this.endGame(true);
        }
    }

    // End the game
    endGame(win) {
        this.gameOver = true;
        this.messageElement.textContent = win ? "You Win!" : "Game Over!";
        this.restartBtn.classList.remove("hidden");

        // Display final score
        this.scoreValue.textContent = this.tilesRevealed;
        this.scoreElement.classList.remove("hidden");

        if (!win) {
            this.minePositions.forEach(pos => {
                let [row, col] = pos.split("-").map(Number);
                let mineTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                if (mineTile) {
                    mineTile.classList.add("bomb");
                    mineTile.textContent = "💣";
                }
            });
        }
    }
}

// Initialize the game
document.addEventListener("DOMContentLoaded", () => new Minesweeper());
