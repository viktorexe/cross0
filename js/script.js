class TicTacToe {
    constructor() {
        this.initialize();
        this.setupEventListeners();
    }

    initialize() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = null;
        this.difficulty = null;
        this.isGameActive = false;
        this.gameStarted = false;

        // DOM Elements
        this.cells = document.querySelectorAll('.cell');
        this.playerIndicator = document.getElementById('playerIndicator');
        this.gameBoard = document.getElementById('gameBoard');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.resetButton = document.getElementById('resetGame');
        this.modal = document.getElementById('gameModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalButton = document.getElementById('modalButton');
        this.turnLine = document.querySelector('.turn-line');
        this.winLine = document.querySelector('.win-line');
    }

    setupEventListeners() {
        document.getElementById('twoPlayer').addEventListener('click', () => this.startTwoPlayerGame());
        document.getElementById('vsAI').addEventListener('click', () => this.startAIGame());
        
        document.querySelectorAll('.difficulty-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.difficulty = button.dataset.difficulty;
                this.startGame();
                this.difficultySelect.classList.add('hidden');
            });
        });

        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.resetButton.addEventListener('click', () => this.resetGame());
        this.modalButton.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.resetGame();
        });
    }

    startTwoPlayerGame() {
        this.gameMode = '2player';
        this.startGame();
    }

    startAIGame() {
        this.gameMode = 'ai';
        this.difficultySelect.classList.remove('hidden');
    }

    startGame() {
        this.gameStarted = true;
        this.isGameActive = true;
        this.gameBoard.classList.remove('hidden');
        this.resetButton.classList.remove('hidden');
        this.resetGame();
        this.updateTurnIndicator();
    }

    handleCellClick(cell) {
        if (!this.isGameActive || this.board[cell.dataset.index] !== '') return;

        this.makeMove(cell.dataset.index);

        if (this.gameMode === 'ai' && this.isGameActive) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].dataset.symbol = this.currentPlayer;
        this.cells[index].style.animation = 'symbolAppear 0.3s ease-out';

        if (this.checkWin()) {
            this.handleWin();
            return;
        }

        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        this.switchPlayer();
    }

    makeAIMove() {
        const index = this.getBestMove();
        if (index !== null) {
            this.makeMove(index);
        }
    }

    getBestMove() {
        switch(this.difficulty) {
            case 'easy':
                return this.getRandomMove();
            case 'medium':
                return Math.random() < 0.5 ? this.getRandomMove() : this.getOptimalMove();
            case 'hard':
                return this.getOptimalMove();
            default:
                return this.getRandomMove();
        }
    }

    getRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    getOptimalMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
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
        if (this.checkWinForPlayer('O')) return 1;
        if (this.checkWinForPlayer('X')) return -1;
        if (this.checkDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
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
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winPatterns.some(pattern => {
            if (pattern.every(index => this.board[index] === this.currentPlayer)) {
                this.drawWinLine(pattern);
                return true;
            }
            return false;
        });
    }

    checkWinForPlayer(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => 
            pattern.every(index => this.board[index] === player)
        );
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.isGameActive = false;
        setTimeout(() => {
            this.showModal('🎉 Winner!', `Player ${this.currentPlayer} wins!`);
        }, 1000);
    }

    handleDraw() {
        this.isGameActive = false;
        this.showModal('🤝 Draw!', "It's a draw!");
    }

    drawWinLine(pattern) {
        const cell1 = this.cells[pattern[0]].getBoundingClientRect();
        const cell2 = this.cells[pattern[2]].getBoundingClientRect();
        const board = document.querySelector('.board').getBoundingClientRect();

        const angle = Math.atan2(
            cell2.top - cell1.top,
            cell2.left - cell1.left
        ) * 180 / Math.PI;

        const length = Math.sqrt(
            Math.pow(cell2.left - cell1.left, 2) + 
            Math.pow(cell2.top - cell1.top, 2)
        );

        this.winLine.style.width = `${length}px`;
        this.winLine.style.left = `${cell1.left - board.left + cell1.width/2}px`;
        this.winLine.style.top = `${cell1.top - board.top + cell1.height/2}px`;
        this.winLine.style.transform = `rotate(${angle}deg)`;
        this.winLine.style.opacity = '1';
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        this.playerIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
        this.turnLine.style.width = '100%';
        this.turnLine.style.width = '0';
        setTimeout(() => {
            this.turnLine.style.width = '100%';
        }, 50);
    }

    showModal(title, message) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modal.classList.remove('hidden');
    }

    resetGame() {
        if (!this.gameStarted) return;
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        
        this.cells.forEach(cell => {
            cell.removeAttribute('data-symbol');
            cell.style.animation = 'none';
        });
        
        this.winLine.style.opacity = '0';
        this.updateTurnIndicator();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
