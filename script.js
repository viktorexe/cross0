class TicTacToe {
    constructor() {
        this.initialize();
        this.setupEventListeners();
        this.initTheme();
    }

    initialize() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = null;
        this.difficulty = null;
        this.isGameActive = false;
        this.gameStarted = false;
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
        this.themeToggle = document.getElementById('themeToggle');
        this.contactButton = document.getElementById('contactButton');
        this.contactModal = document.getElementById('contactModal');
        this.closeContactModal = document.getElementById('closeContactModal');
    }

    setupEventListeners() {
        ['twoPlayer', 'vsAI'].forEach(id => {
            const button = document.getElementById(id);
            this.addTouchClickHandler(button, () => {
                if (id === 'twoPlayer') this.startTwoPlayerGame();
                else this.startAIGame();
            });
        });
        document.querySelectorAll('.difficulty-btn').forEach(button => {
            this.addTouchClickHandler(button, () => {
                this.difficulty = button.dataset.difficulty;
                this.startGame();
                this.difficultySelect.classList.add('hidden');
            });
        });
        this.cells.forEach(cell => {
            this.addTouchClickHandler(cell, () => this.handleCellClick(cell));
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
        this.addTouchClickHandler(this.resetButton, () => this.resetGame());
        this.addTouchClickHandler(this.modalButton, () => this.restartGame());
        this.addTouchClickHandler(this.themeToggle, () => this.toggleTheme());
        this.addTouchClickHandler(this.contactButton, () => this.openContactModal());
        document.getElementById('closeContactModal').addEventListener('click', () => {
            this.closeContactModal();
        });
        this.contactModal.addEventListener('click', (e) => {
            if (e.target === this.contactModal) {
                this.closeContactModal();
            }
        });
    }
    openContactModal() {
        this.contactModal.classList.remove('hidden');
        this.contactModal.classList.add('visible');
    }
    closeContactModal() {
        this.contactModal.classList.remove('visible');
        setTimeout(() => {
            this.contactModal.classList.add('hidden');
        }, 300);
    }
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        this.updateThemeToggleIcon();
    }
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeToggleIcon();
        document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
    updateThemeToggleIcon() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const sunIcon = this.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.themeToggle.querySelector('.moon-icon');
        if (currentTheme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }
    startTwoPlayerGame() {
        this.gameMode = '2player';
        this.startGame();
    }
    startAIGame() {
        this.gameMode = 'ai';
        this.difficultySelect.classList.remove('hidden');
        this.difficultySelect.classList.add('visible');
    }
    startGame() {
        this.gameStarted = true;
        this.isGameActive = true;
        this.gameBoard.classList.remove('hidden');
        this.gameBoard.classList.add('visible');
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
            element.classList.add('active');
        }, { passive: true });
        element.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            element.classList.remove('active');
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
        element.addEventListener('click', (e) => {
            if (!('ontouchstart' in window) || e.pointerType === 'mouse') {
                handler();
            }
        });
    }
    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (!this.isGameActive || this.board[index] !== '') return;
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 100);
        this.makeMove(index);
        if (this.gameMode === 'ai' && this.isGameActive) {
            setTimeout(() => this.makeAIMove(), 300);
        }
    }
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        cell.setAttribute('data-symbol', this.currentPlayer);
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
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
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
    createConfetti() {
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#4CAF50', '#3498db'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '1000';
        document.body.appendChild(confettiContainer);
        const confettiPieces = 100;
        for (let i = 0; i < confettiPieces; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-20px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.opacity = Math.random() + 0.5;
            confetti.style.animation = `confettiDrop ${Math.random() * 3 + 2}s ease-in forwards`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confettiContainer.appendChild(confetti);
        }
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
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
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
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
        if (this.winningCombination) {
            this.drawWinLine(this.winningCombination);
            this.winningCombination.forEach((index, i) => {
                setTimeout(() => {
                    this.cells[index].classList.add('winner');
                }, i * 200);
            });
        }
        setTimeout(() => {
            this.createConfetti();
        }, 300);
        setTimeout(() => {
            this.showModal('🎉 Winner!', `Player ${this.currentPlayer} wins!`);
        }, 1500);
    }
    handleDraw() {
        this.isGameActive = false;
        this.showModal('🤝 Draw!', "It's a draw!");
    }
    drawWinLine(pattern) {
        const board = document.querySelector('.board');
        const boardRect = board.getBoundingClientRect();
        const cell1 = this.cells[pattern[0]].getBoundingClientRect();
        const cell2 = this.cells[pattern[2]].getBoundingClientRect();
        const x1 = cell1.left + cell1.width / 2 - boardRect.left;
        const y1 = cell1.top + cell1.height / 2 - boardRect.top;
        const x2 = cell2.left + cell2.width / 2 - boardRect.left;
        const y2 = cell2.top + cell2.height / 2 - boardRect.top;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const winLine = document.querySelector('.win-line');
        Object.assign(winLine.style, {
            width: `${length}px`,
            left: `${x1}px`,
            top: `${y1}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 50%'
        });
        setTimeout(() => {
            winLine.style.opacity = '1';
        }, 100);
    }
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.playerIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
        this.playerIndicator.parentElement.classList.add('animate');
        setTimeout(() => {
            this.playerIndicator.parentElement.classList.remove('animate');
        }, 500);
        this.turnLine.style.width = '0';
        setTimeout(() => {
            this.turnLine.style.width = '100%';
        }, 50);
    }
    updateTurnIndicator() {
        this.playerIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
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
        this.modal.classList.add('visible');
        this.isGameActive = false;
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
            cell.offsetHeight;
            cell.style.animation = null;
        });
        this.winLine.style.opacity = '0';
        this.modal.classList.remove('visible');
        this.modal.classList.add('hidden');
        this.updateTurnIndicator();
    }
    restartGame() {
        this.resetGame();
        this.isGameActive = true;
        this.updateTurnIndicator();
    }
}
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes confettiDrop {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
    // Stats modal logic
    const statsButton = document.getElementById('statsButton');
    const statsModal = document.getElementById('statsModal');
    const closeStatsModal = document.getElementById('closeStatsModal');
    const statsList = document.getElementById('statsList');

    function getStats() {
        const stats = JSON.parse(localStorage.getItem('tictactoe_stats') || '{}');
        return {
            gamesPlayed: stats.gamesPlayed || 0,
            playerXWins: stats.playerXWins || 0,
            playerOWins: stats.playerOWins || 0,
            draws: stats.draws || 0
        };
    }
    function setStats(newStats) {
        localStorage.setItem('tictactoe_stats', JSON.stringify(newStats));
    }
    function renderStats() {
        const stats = getStats();
        if (stats.gamesPlayed === 0) {
            statsList.innerHTML = '';
            const msg = document.createElement('div');
            msg.textContent = 'Play at least one game to see your stats!';
            msg.style.margin = '1.5rem 0';
            msg.style.fontSize = '1.1rem';
            msg.style.color = 'var(--text-color)';
            statsList.parentNode.insertBefore(msg, statsList);
            statsList.style.display = 'none';
        } else {
            // Remove any previous message
            if (statsList.previousSibling && statsList.previousSibling.textContent === 'Play at least one game to see your stats!') {
                statsList.parentNode.removeChild(statsList.previousSibling);
            }
            statsList.style.display = '';
            statsList.innerHTML = `
                <li><strong>Games Played:</strong> ${stats.gamesPlayed}</li>
                <li><strong>X Wins:</strong> ${stats.playerXWins}</li>
                <li><strong>O Wins:</strong> ${stats.playerOWins}</li>
                <li><strong>Draws:</strong> ${stats.draws}</li>
            `;
        }
    }
    statsButton.addEventListener('click', () => {
        renderStats();
        statsModal.classList.add('visible');
    });
    closeStatsModal.addEventListener('click', () => {
        statsModal.classList.remove('visible');
    });
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) {
            statsModal.classList.remove('visible');
        }
    });
    // Prevent horizontal scroll via JS (fallback)
    window.addEventListener('resize', () => {
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
    });
    // Save stats on game end
    const origHandleWin = TicTacToe.prototype.handleWin;
    TicTacToe.prototype.handleWin = function() {
        const stats = getStats();
        stats.gamesPlayed++;
        if (this.currentPlayer === 'X') stats.playerXWins++;
        else stats.playerOWins++;
        setStats(stats);
        origHandleWin.apply(this, arguments);
    };
    const origHandleDraw = TicTacToe.prototype.handleDraw;
    TicTacToe.prototype.handleDraw = function() {
        const stats = getStats();
        stats.gamesPlayed++;
        stats.draws++;
        setStats(stats);
        origHandleDraw.apply(this, arguments);
    };
});