class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = null;
        this.difficulty = null;
        this.isGameActive = false;
        this.winningCombination = null;
        this.isAnimating = false;

        this.initializeElements();
        this.setupEventListeners();
        this.setupModalEvents();
    }

    initializeElements() {
        this.cells = document.querySelectorAll('.cell');
        this.playerTurn = document.getElementById('current-player');
        this.gameBoard = document.querySelector('.game-board');
        this.difficultySelector = document.querySelector('.difficulty-selector');
        this.resetButton = document.getElementById('reset-game');
        this.twoPlayerBtn = document.getElementById('twoPlayer');
        this.multiplayerBtn = document.getElementById('multiplayer');
        this.modal = document.querySelector('.custom-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalButton = document.getElementById('modal-button');
        this.winLine = document.querySelector('.win-line');
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
                
                // Remove active class from all buttons
                document.querySelectorAll('.difficulty-selector button')
                    .forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
            });
        });
    }

    setupModalEvents() {
        this.modalButton.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.resetGame();
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add('hidden');
                this.resetGame();
            }
        });
    }
    startTwoPlayerGame() {
        this.gameMode = '2player';
        this.difficultySelector.classList.add('hidden');
        this.startGame();
        this.showToast('2 Player Mode Started!');
    }

    startMultiplayerGame() {
        this.gameMode = 'ai';
        this.difficultySelector.classList.remove('hidden');
        this.showToast('Select AI Difficulty');
    }

    startGame() {
        this.gameBoard.classList.remove('hidden');
        this.isGameActive = true;
        this.resetGame();
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (this.board[index] || !this.isGameActive || this.isAnimating) return;

        this.makeMove(index);

        if (this.gameMode === 'ai' && this.isGameActive) {
            this.isAnimating = true;
            setTimeout(() => {
                this.makeAIMove();
                this.isAnimating = false;
            }, 500);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 2000);
        }, 100);
    }
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        cell.setAttribute('data-symbol', this.currentPlayer);
        
        if (this.checkWin()) {
            this.animateWin();
            setTimeout(() => {
                this.showModal('🎉 Winner!', `Player ${this.currentPlayer} wins!`);
            }, 1000);
            this.isGameActive = false;
            return;
        }

        if (this.checkDraw()) {
            this.showModal('🤝 Draw!', "It's a draw!");
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

        for (let pattern of winPatterns) {
            if (pattern.every(index => this.board[index] === this.currentPlayer)) {
                this.winningCombination = pattern;
                return true;
            }
        }
        return false;
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

    animateWin() {
        if (!this.winningCombination) return;
        
        this.winningCombination.forEach(index => {
            this.cells[index].classList.add('winner');
        });
        
        this.drawWinLine(this.winningCombination);
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

    showModal(title, message) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modal.classList.remove('hidden');
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.winningCombination = null;
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.removeAttribute('data-symbol');
            cell.classList.remove('winner');
        });
        this.winLine.style.opacity = '0';
        this.playerTurn.textContent = `Player ${this.currentPlayer}'s Turn`;
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
