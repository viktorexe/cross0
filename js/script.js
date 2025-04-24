class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = null;
        this.difficulty = null;
        this.isGameActive = false;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.cells = document.querySelectorAll('.cell');
        this.playerTurn = document.getElementById('current-player');
        this.gameBoard = document.querySelector('.game-board');
        this.difficultySelector = document.querySelector('.difficulty-selector');
        this.resetButton = document.getElementById('reset-game');
        this.twoPlayerBtn = document.getElementById('twoPlayer');
        this.multiplayerBtn = document.getElementById('multiplayer');
    }

    setupEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.resetButton.addEventListener('click', () => this.resetGame());
        this.twoPlayerBtn.addEventListener('click', () => this.startTwoPlayerGame());
        this.multiplayerBtn.addEventListener('click', () => this.startMultiplayerGame());

        document.querySelectorAll('.difficulty-selector button').forEach(button => {
            button.addEventListener('click', () => {
                this.difficulty = button.dataset.difficulty;
                this.startGame();
            });
        });
    }

    startTwoPlayerGame() {
        this.gameMode = '2player';
        this.difficultySelector.classList.add('hidden');
        this.startGame();
    }

    startMultiplayerGame() {
        this.gameMode = 'ai';
        this.difficultySelector.classList.remove('hidden');
    }

    startGame() {
        this.gameBoard.classList.remove('hidden');
        this.isGameActive = true;
        this.resetGame();
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (this.board[index] || !this.isGameActive) return;

        this.makeMove(index);

        if (this.gameMode === 'ai' && this.isGameActive) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        
        if (this.checkWin()) {
            alert(`Player ${this.currentPlayer} wins!`);
            this.isGameActive = false;
            return;
        }

        if (this.checkDraw()) {
            alert("It's a draw!");
            this.isGameActive = false;
            return;
        }

        this.switchPlayer();
    }

    makeAIMove() {
        let index;
        switch(this.difficulty) {
            case 'easy':
                index = this.getRandomEmptyCell();
                break;
            case 'medium':
                index = Math.random() < 0.5 ? this.getBestMove() : this.getRandomEmptyCell();
                break;
            case 'hard':
                index = this.getBestMove();
                break;
            default:
                index = this.getRandomEmptyCell();
        }

        if (index !== null) {
            this.makeMove(index);
        }
    }

    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        if (this.checkWinForMinimax('O')) return 1;
        if (this.checkWinForMinimax('X')) return -1;
        if (this.checkDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    getRandomEmptyCell() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.playerTurn.textContent = `Player ${this.currentPlayer}'s Turn`;
        this.playerTurn.classList.add('switch-animation');
        setTimeout(() => this.playerTurn.classList.remove('switch-animation'), 500);
    }

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winPatterns.some(pattern => {
            return pattern.every(index => {
                return this.board[index] === this.currentPlayer;
            });
        });
    }

    checkWinForMinimax(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            return pattern.every(index => this.board[index] === player);
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.cells.forEach(cell => cell.textContent = '');
        this.playerTurn.textContent = `Player ${this.currentPlayer}'s Turn`;
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
