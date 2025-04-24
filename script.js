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
        // Game mode buttons
        ['twoPlayer', 'vsAI'].forEach(id => {
            const button = document.getElementById(id);
            this.addTouchClickHandler(button, () => {
                if (id === 'twoPlayer') this.startTwoPlayerGame();
                else this.startAIGame();
            });
        });
    
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(button => {
            this.addTouchClickHandler(button, () => {
                this.difficulty = button.dataset.difficulty;
                this.startGame();
                this.difficultySelect.classList.add('hidden');
            });
        });
    
        // Cell interactions
        this.cells.forEach(cell => {
            // Combined touch/click handler for cells
            this.addTouchClickHandler(cell, () => this.handleCellClick(cell));
    
            // Hover effects (only for non-touch devices)
            if (window.matchMedia('(hover: hover)').matches) {
                cell.addEventListener('mouseenter', () => {
                    if (!cell.dataset.symbol && this.isGameActive) {
                        cell.dataset.hover = this.currentPlayer;
                    }
                });
                
                cell.addEventListener('mouseleave', () => {
                    delete cell.dataset.hover;
                });
            }
        });
    
        // Reset button
        this.addTouchClickHandler(this.resetButton, () => this.resetGame());
    
        // Modal button
        this.addTouchClickHandler(this.modalButton, () => this.restartGame());
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
    addTouchClickHandler(element, handler) {
        let touchStartTime;
        let touchStartX;
        let touchStartY;
        
        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
    
        element.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Check if it's a tap (quick touch without much movement)
            const touchDuration = touchEndTime - touchStartTime;
            const touchDistance = Math.sqrt(
                Math.pow(touchEndX - touchStartX, 2) + 
                Math.pow(touchEndY - touchStartY, 2)
            );
    
            if (touchDuration < 300 && touchDistance < 20) {
                e.preventDefault();
                handler();
            }
        });
    
        // Keep click handler for desktop
        element.addEventListener('click', (e) => {
            // Only handle click if it's not a touch device or if it's a mouse click
            if (!('ontouchstart' in window) || e.pointerType === 'mouse') {
                handler();
            }
        });
    }
    // Update handleCellClick to be more responsive
    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (!this.isGameActive || this.board[index] !== '') return;

        // Immediate visual feedback
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 100);

        this.makeMove(index);

        if (this.gameMode === 'ai' && this.isGameActive) {
            // Reduced delay for AI move
            setTimeout(() => this.makeAIMove(), 300);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        cell.setAttribute('data-symbol', this.currentPlayer);
        
        // Add pop-in animation
        cell.style.animation = 'symbolAppear 0.3s ease-out';
        
        if (this.checkWin()) {
            this.winningCombination = this.getWinningCombination();
            this.handleWin();
            return;
        }
    
        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }
    
        this.switchPlayer();
    }
    
    getWinningCombination() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
    
        for (let pattern of winPatterns) {
            if (pattern.every(index => this.board[index] === this.currentPlayer)) {
                return pattern;
            }
        }
        return null;
    }
    

    makeAIMove() {
        const index = this.getBestMove();
        if (index !== null) {
            this.makeMove(index);
        }
    }
    createFireworks() {
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#4CAF50', '#3498db'];
        const fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks-container';
        document.body.appendChild(fireworksContainer);
    
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.setProperty('--x', `${Math.random() * 100}vw`);
                firework.style.setProperty('--initialY', '100vh');
                firework.style.setProperty('--finalY', `${Math.random() * 50}vh`);
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                fireworksContainer.appendChild(firework);
            }, i * 50);
        }
    
        setTimeout(() => {
            document.body.removeChild(fireworksContainer);
        }, 3000);
    }
    
    createStarBurst(x, y) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = x + 'px';
        container.style.top = y + 'px';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
    
        for (let i = 0; i < 12; i++) {
            const star = document.createElement('div');
            star.className = 'star-burst';
            star.style.transform = `rotate(${i * 30}deg)`;
            container.appendChild(star);
        }
    
        setTimeout(() => {
            document.body.removeChild(container);
        }, 1000);
    }
    
    showTrophy() {
        const trophy = document.createElement('div');
        trophy.className = 'trophy';
        trophy.textContent = '🏆';
        document.body.appendChild(trophy);
    
        setTimeout(() => {
            document.body.removeChild(trophy);
        }, 2000);
    }
    
    handleWin() {
        this.isGameActive = false;
        
        // Animate winning cells with delay
        if (this.winningCombination) {
            this.winningCombination.forEach((index, i) => {
                setTimeout(() => {
                    const cell = this.cells[index];
                    cell.classList.add('winner');
                    
                    // Create star burst effect at cell position
                    const rect = cell.getBoundingClientRect();
                    this.createStarBurst(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2
                    );
                }, i * 200);
            });
        }
    
        // Create multiple effects
        setTimeout(() => {
            this.createFireworks();
            this.showTrophy();
        }, 500);
    
        // Show winning modal with delay
        setTimeout(() => {
            this.showModal('🎉 Winner!', `Player ${this.currentPlayer} wins!`);
        }, 2000);
    }
    
    showModal(title, message) {
        if (!this.gameStarted) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <button class="premium-button">
                    <span>Play Again</span>
                </button>
            </div>
        `;
        
        // Add animation classes
        modal.classList.add('modal-animate');
        
        document.body.appendChild(modal);
        
        const button = modal.querySelector('button');
        button.addEventListener('click', () => {
            modal.classList.add('modal-exit');
            setTimeout(() => {
                document.body.removeChild(modal);
                this.resetGame();
            }, 500);
        });
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
        
        // Animate winning cells
        if (this.winningCombination) {
            this.winningCombination.forEach(index => {
                const cell = this.cells[index];
                cell.classList.add('winner');
            });
        }
    
        // Create confetti effect
        this.createConfetti();
    
        // Show winning modal with delay
        setTimeout(() => {
            this.showModal('🎉 Winner!', `Player ${this.currentPlayer} wins!`);
        }, 1500);
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
        this.playerIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
        
        // Add animation class
        this.playerIndicator.parentElement.classList.add('animate');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.playerIndicator.parentElement.classList.remove('animate');
        }, 500);
    
        // Update turn line
        this.turnLine.style.width = '0';
        setTimeout(() => {
            this.turnLine.style.width = '100%';
        }, 50);
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
        if (!this.gameStarted) return;
        
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modal.classList.remove('hidden');
        this.isGameActive = false; // Ensure game is inactive when modal is shown
    }
    

    resetGame() {
        if (!this.gameStarted) return;
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.winningCombination = null;
        
        this.cells.forEach(cell => {
            cell.removeAttribute('data-symbol');
            cell.removeAttribute('data-hover');
            cell.classList.remove('winner');
            cell.style.animation = 'none';
            cell.offsetHeight; // Trigger reflow
            cell.style.animation = null;
        });
        
        this.winLine.style.opacity = '0';
        this.modal.classList.add('hidden');
        this.updateTurnIndicator();
    }
    
    restartGame() {
        this.resetGame();
        this.isGameActive = true;
        this.updateTurnIndicator();
        
        // Hide modal
        this.modal.classList.add('hidden');
    }
    
    createConfetti() {
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#4CAF50', '#3498db'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
    
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(confetti);
        }
    
        setTimeout(() => {
            document.body.removeChild(container);
        }, 3000);
    }
    
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
