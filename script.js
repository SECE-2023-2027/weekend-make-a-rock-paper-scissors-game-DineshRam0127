// Game state
const gameState = {
    player: {
        score: 0,
        choice: null
    },
    computer: {
        score: 0,
        choice: null
    },
    isPlaying: false,
    round: 0
};

// DOM elements
const choices = document.querySelectorAll('.choice');
const userScoreEl = document.getElementById('user-score');
const compScoreEl = document.getElementById('comp-score');
const resultTextEl = document.getElementById('result-text');
const actionMessageEl = document.getElementById('action-message');
const battleAreaEl = document.getElementById('battle-area');
const playerBattleIconEl = document.getElementById('player-battle-icon');
const computerBattleIconEl = document.getElementById('computer-battle-icon');
const resetBtn = document.getElementById('reset-btn');

// Choice emojis and names
const choiceData = {
    rock: { emoji: '🪨', name: 'Rock' },
    paper: { emoji: '📄', name: 'Paper' },
    scissors: { emoji: '✂️', name: 'Scissors' }
};

// Game rules
const rules = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

// Sound effects (using Web Audio API for better performance)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Initialize game
function initGame() {
    gameState.player.score = 0;
    gameState.computer.score = 0;
    gameState.round = 0;
    updateScores();
    resetDisplay();
    addEventListeners();
}

// Add event listeners
function addEventListeners() {
    choices.forEach(choice => {
        choice.addEventListener('click', handlePlayerChoice);
        choice.addEventListener('mouseenter', () => playSound(440, 0.1, 'sine'));
    });
    
    resetBtn.addEventListener('click', resetGame);
}

// Handle player choice
function handlePlayerChoice(e) {
    if (gameState.isPlaying) return;
    
    const choice = e.currentTarget.dataset.choice;
    playGame(choice);
}

// Main game logic
function playGame(playerChoice) {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.round++;
    
    // Clear previous effects
    clearEffects();
    
    // Get computer choice
    const computerChoice = getComputerChoice();
    
    // Store choices
    gameState.player.choice = playerChoice;
    gameState.computer.choice = computerChoice;
    
    // Show battle animation
    showBattle(playerChoice, computerChoice);
    
    // Determine winner after animation
    setTimeout(() => {
        const result = determineWinner(playerChoice, computerChoice);
        updateGame(result, playerChoice, computerChoice);
        gameState.isPlaying = false;
    }, 1500);
}

// Get random computer choice
function getComputerChoice() {
    const choices = Object.keys(choiceData);
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// Show battle animation
function showBattle(playerChoice, computerChoice) {
    battleAreaEl.style.display = 'block';
    
    // Set battle icons
    playerBattleIconEl.textContent = choiceData[playerChoice].emoji;
    computerBattleIconEl.textContent = choiceData[computerChoice].emoji;
    
    // Update action message
    actionMessageEl.textContent = 'Battle in progress...';
    
    // Play battle sound
    playSound(220, 0.3, 'square');
    
    // Add battle animation classes
    playerBattleIconEl.classList.add('battle-icon');
    computerBattleIconEl.classList.add('battle-icon');
}

// Determine winner
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }
    
    if (rules[playerChoice] === computerChoice) {
        return 'player';
    }
    
    return 'computer';
}

// Update game state and display
function updateGame(result, playerChoice, computerChoice) {
    const playerName = choiceData[playerChoice].name;
    const computerName = choiceData[computerChoice].name;
    
    // Update scores and display result
    switch (result) {
        case 'player':
            gameState.player.score++;
            resultTextEl.textContent = `${playerName} beats ${computerName}! You win this round!`;
            actionMessageEl.textContent = 'Victory! Choose your next weapon!';
            addEffect(playerChoice, 'win');
            playSound(523, 0.5, 'sine'); // C note for win
            break;
            
        case 'computer':
            gameState.computer.score++;
            resultTextEl.textContent = `${computerName} beats ${playerName}! Computer wins this round!`;
            actionMessageEl.textContent = 'Defeat! Fight back with your next choice!';
            addEffect(playerChoice, 'lose');
            playSound(196, 0.5, 'sawtooth'); // G note for lose
            break;
            
        case 'draw':
            resultTextEl.textContent = `Both chose ${playerName}! It's a draw!`;
            actionMessageEl.textContent = 'Tie! Try again to break the deadlock!';
            addEffect(playerChoice, 'draw');
            playSound(330, 0.3, 'triangle'); // E note for draw
            break;
    }
    
    // Update score display
    updateScores();
    
    // Hide battle area after delay
    setTimeout(() => {
        battleAreaEl.style.display = 'none';
    }, 2000);
    
    // Check for game end (optional: first to 10 wins)
    checkGameEnd();
}

// Add visual effects to choices
function addEffect(choice, effectType) {
    const choiceEl = document.getElementById(choice);
    const effectClass = `${effectType}-effect`;
    
    choiceEl.classList.add(effectClass);
    
    setTimeout(() => {
        choiceEl.classList.remove(effectClass);
    }, 1000);
}

// Clear all effects
function clearEffects() {
    choices.forEach(choice => {
        choice.classList.remove('win-effect', 'lose-effect', 'draw-effect');
    });
}

// Update score display
function updateScores() {
    userScoreEl.textContent = gameState.player.score;
    compScoreEl.textContent = gameState.computer.score;
    
    // Add score update animation
    userScoreEl.style.transform = 'scale(1.2)';
    compScoreEl.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
        userScoreEl.style.transform = 'scale(1)';
        compScoreEl.style.transform = 'scale(1)';
    }, 200);
}

// Check for game end (optional feature)
function checkGameEnd() {
    const winningScore = 10;
    
    if (gameState.player.score >= winningScore) {
        setTimeout(() => {
            resultTextEl.textContent = `🎉 Congratulations! You won the game ${gameState.player.score}-${gameState.computer.score}! 🎉`;
            actionMessageEl.textContent = 'You are the ultimate champion! Start a new game?';
            playSound(659, 0.8, 'sine'); // E note for game win
        }, 2000);
    } else if (gameState.computer.score >= winningScore) {
        setTimeout(() => {
            resultTextEl.textContent = `💔 Game Over! Computer won ${gameState.computer.score}-${gameState.player.score}! 💔`;
            actionMessageEl.textContent = 'Better luck next time! Start a new game?';
            playSound(165, 0.8, 'sawtooth'); // Low note for game loss
        }, 2000);
    }
}

// Reset game
function resetGame() {
    gameState.player.score = 0;
    gameState.computer.score = 0;
    gameState.round = 0;
    gameState.isPlaying = false;
    
    updateScores();
    resetDisplay();
    clearEffects();
    
    playSound(440, 0.2, 'sine'); // Reset sound
}

// Reset display
function resetDisplay() {
    resultTextEl.textContent = 'Choose your weapon to start the battle!';
    actionMessageEl.textContent = 'Ready to dominate? Pick your weapon!';
    battleAreaEl.style.display = 'none';
}

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (gameState.isPlaying) return;
    
    switch(e.key.toLowerCase()) {
        case 'r':
            playGame('rock');
            break;
        case 'p':
            playGame('paper');
            break;
        case 's':
            playGame('scissors');
            break;
        case 'n':
            resetGame();
            break;
    }
});

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Add keyboard instructions
    setTimeout(() => {
        if (gameState.round === 0) {
            actionMessageEl.textContent = 'Click to play or use keys: R (Rock), P (Paper), S (Scissors), N (New Game)';
        }
    }, 5000);
});

// Handle audio context for mobile devices
document.addEventListener('touchstart', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });

// Add smooth scrolling for better UX
function smoothScroll() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Performance optimization: Debounce rapid clicks
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to game function
const debouncedPlayGame = debounce(playGame, 300);