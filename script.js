
// Variables to control game state
let gameRunning = false;
let dropMaker;
let gameTimer;
let score = 0;
let timeLeft = 30;
let goal = 20;
let settings;
let audioContext;

// Get HTML elements
const startBtn = document.getElementById("start-btn");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const goalDisplay = document.getElementById("goal");
const gameContainer = document.getElementById("game-container");
const gameMessage = document.getElementById("game-message");
const difficultySelect = document.getElementById("difficulty");
const progressBar = document.getElementById("progress-bar");
const milestoneMessage = document.getElementById("milestone-message");
const soundToggle = document.getElementById("sound-toggle");

// Difficulty settings
const difficulties = {
    easy: {
        time: 40,
        goal: 12,
        dropSpeed: 800,
        fallDuration: 5,
        badChance: 0.1
    },

    normal: {
        time: 30,
        goal: 20,
        dropSpeed: 500,
        fallDuration: 4,
        badChance: 0.2
    },

    hard: {
        time: 25,
        goal: 28,
        dropSpeed: 350,
        fallDuration: 3,
        badChance: 0.3
    }
};

// Winning messages
const winningMessages = [
    "Amazing! You're a Water Drop Champion!",
    "Great job! You saved the water!",
    "You won! Every drop counts!",
    "Fantastic work! You're a water hero!"
];

// Losing messages
const losingMessages = [
    "Good try! Give it another shot!",
    "Keep practicing! Every drop counts!",
    "Almost there! Try again!",
    "Don't give up! You can do it!"
];

// Milestone messages
const milestones = [
    { percent: 25, message: "Great start! Keep going!" },
    { percent: 50, message: "Halfway there!" },
    { percent: 75, message: "Almost at your goal!" },
    { percent: 100, message: "Goal reached! Keep collecting!" }
];

// Keep track of milestones already reached
let reachedMilestones = [];

// Update settings when difficulty changes
difficultySelect.addEventListener("change", updateDifficulty);

// Start button
startBtn.addEventListener("click", startGame);


// Update difficulty settings
function updateDifficulty() {

    if (gameRunning) return;

    const difficulty = difficultySelect.value;
    settings = difficulties[difficulty];

    goal = settings.goal;
    timeLeft = settings.time;

    goalDisplay.textContent = goal;
    timeDisplay.textContent = timeLeft;
}


// Start the game
function startGame() {

    if (gameRunning) return;

    // Reset game variables
    gameRunning = true;
    score = 0;
    reachedMilestones = [];

    updateGameSettings();

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;

    progressBar.style.width = "0%";
    milestoneMessage.textContent = "";

    // Remove old drops
    document.querySelectorAll(".water-drop").forEach(drop => {
        drop.remove();
    });

    // Hide previous message
    gameMessage.style.display = "none";
    gameMessage.textContent = "";

    // Disable settings during game
    startBtn.disabled = true;
    startBtn.textContent = "Playing...";
    difficultySelect.disabled = true;

    // Play starting sound
    playSound("start");

    // Create falling drops
    dropMaker = setInterval(createDrop, settings.dropSpeed);
    createDrop();

    // Start countdown
    gameTimer = setInterval(() => {

        timeLeft--;

        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}


// Load selected difficulty
function updateGameSettings() {

    settings = difficulties[difficultySelect.value];

    goal = settings.goal;
    timeLeft = settings.time;

    goalDisplay.textContent = goal;
}


// Create falling water drops
function createDrop() {

    if (!gameRunning) return;

    // Create drop
    const drop = document.createElement("div");
    drop.className = "water-drop";

    // Random size
    const initialSize = 60;
    const sizeMultiplier = Math.random() * 0.8 + 0.5;
    const size = initialSize * sizeMultiplier;

    drop.style.width = size + "px";
    drop.style.height = size + "px";

    // Random horizontal position
    const gameWidth = gameContainer.clientWidth;

    const xPosition = Math.random() *
        Math.max(0, gameWidth - size);

    drop.style.left = xPosition + "px";

    // Random chance of creating bad drop
    const isBadDrop = Math.random() < settings.badChance;

    if (isBadDrop) {
        drop.classList.add("bad-drop");
    }

    // Animation duration
    drop.style.animationDuration =
        settings.fallDuration + "s";

    // Calculate how far the drop should fall
    const gameHeight = gameContainer.clientHeight;

    drop.style.setProperty(
        "--fall-distance",
        gameHeight + "px"
    );

    // Add drop to game
    gameContainer.appendChild(drop);

    // Collect drop when clicked
    drop.addEventListener("pointerdown", () => {

        if (!gameRunning) return;

        if (isBadDrop) {
            score--;
            playSound("bad");
        } else {
            score++;
            playSound("collect");
        }

        // Update score
        scoreDisplay.textContent = score;

        // Update progress
        updateProgress();

        // Check milestones
        checkMilestones();

        // Remove collected drop
        drop.remove();
    });

    // Remove missed drops
    drop.addEventListener("animationend", () => {

        if (!drop.isConnected) return;

        if (gameRunning && !isBadDrop) {
            playSound("miss");
        }

        drop.remove();
    });
}


// Update progress bar
function updateProgress() {

    let percentage = (score / goal) * 100;

    // Keep progress between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));

    progressBar.style.width = percentage + "%";
}


// Check player milestones
function checkMilestones() {

    const percentage = (score / goal) * 100;

    milestones.forEach(milestone => {

        // Only display each milestone once
        if (
            percentage >= milestone.percent &&
            !reachedMilestones.includes(milestone.percent)
        ) {

            reachedMilestones.push(milestone.percent);

            milestoneMessage.textContent = milestone.message;

            playSound("milestone");
        }
    });
}


// Generate simple sound effects
function playSound(type) {

    if (!soundToggle.checked) return;

    try {
        // Create audio context when needed
        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        // Choose sound based on action
        if (type === "collect") {
            oscillator.frequency.value = 600;
        } else if (type === "bad") {
            oscillator.frequency.value = 180;
        } else if (type === "miss") {
            oscillator.frequency.value = 250;
        } else if (type === "milestone") {
            oscillator.frequency.value = 900;
        } else if (type === "win") {
            oscillator.frequency.value = 1000;
        } else if (type === "lose") {
            oscillator.frequency.value = 200;
        } else {
            oscillator.frequency.value = 450;
        }

        oscillator.type = "sine";

        const now = audioContext.currentTime;

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.15
        );

        oscillator.start(now);
        oscillator.stop(now + 0.15);

    } catch (error) {
        // Game still works if sound is unsupported
        console.log("Sound unavailable:", error);
    }
}


// End the game
function endGame() {

    gameRunning = false;

    // Stop timers
    clearInterval(dropMaker);
    clearInterval(gameTimer);

    // Remove remaining drops
    document.querySelectorAll(".water-drop").forEach(drop => {
        drop.remove();
    });

    let message;

    // Determine win or loss
    if (score >= goal) {

        const randomIndex = Math.floor(
            Math.random() * winningMessages.length
        );

        message = winningMessages[randomIndex];

        playSound("win");

    } else {

        const randomIndex = Math.floor(
            Math.random() * losingMessages.length
        );

        message = losingMessages[randomIndex];

        playSound("lose");
    }

    // Display final result
    gameMessage.textContent =
        message + " Final Score: " + score;

    gameMessage.style.display = "block";

    milestoneMessage.textContent = "Game Over!";

    // Allow replay
    startBtn.disabled = false;
    startBtn.textContent = "Play Again";

    difficultySelect.disabled = false;
}


// Set initial difficulty
updateDifficulty();
