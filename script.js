
// Variables to control game state
let gameRunning = false;
let dropMaker;
let gameTimer;
let score = 0;
let timeLeft = 30;

// Get HTML elements
const startBtn = document.getElementById("start-btn");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const gameMessage = document.getElementById("game-message");

// Possible winning messages
const winningMessages = [
    "Amazing! You're a Water Drop Champion!",
    "Great job! You saved the water!",
    "You won! Every drop counts!",
    "Fantastic work! You're a water hero!"
];

// Possible losing messages
const losingMessages = [
    "Good try! Give it another shot!",
    "Keep practicing! Every drop counts!",
    "Almost there! Try again!",
    "Don't give up! You can do it!"
];

// Start button event listener
startBtn.addEventListener("click", startGame);


// Function to start the game
function startGame() {

    // Prevent multiple games from running
    if (gameRunning) return;

    gameRunning = true;

    // Reset score and timer
    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;

    // Clear any old drops
    document.querySelectorAll(".water-drop").forEach(drop => {
        drop.remove();
    });

    // Hide previous game message
    gameMessage.style.display = "none";
    gameMessage.textContent = "";

    // Disable start button while playing
    startBtn.disabled = true;
    startBtn.textContent = "Playing...";

    // Create a new drop every 500 milliseconds
    dropMaker = setInterval(createDrop, 500);

    // Create the first drop immediately
    createDrop();

    // Countdown timer
    gameTimer = setInterval(() => {

        timeLeft--;

        // Update timer display
        timeDisplay.textContent = timeLeft;

        // End game when timer reaches zero
        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}


// Function to create falling drops
function createDrop() {

    // Create a new div
    const drop = document.createElement("div");
    drop.className = "water-drop";

    // Give drops different sizes
    const initialSize = 60;
    const sizeMultiplier = Math.random() * 0.8 + 0.5;
    const size = initialSize * sizeMultiplier;

    drop.style.width = size + "px";
    drop.style.height = size + "px";

    // Get width and height of game area
    const gameWidth = gameContainer.offsetWidth;
    const gameHeight = gameContainer.clientHeight;

    // Random horizontal position
    const xPosition = Math.random() * Math.max(0, gameWidth - size);
    drop.style.left = xPosition + "px";

    // Make 20% of drops bad
    const isBadDrop = Math.random() < 0.2;

    if (isBadDrop) {
        drop.classList.add("bad-drop");
        drop.setAttribute("aria-label", "Bad drop");
    } else {
        drop.setAttribute("aria-label", "Good drop");
    }

    // Drops fall for 4 seconds
    drop.style.animationDuration = "4s";

    // Set animation distance based on container height
    // The extra distance lets the drop fully leave the screen
    const animationName = "fall-" + Date.now() + "-" +
                          Math.floor(Math.random() * 10000);

    const style = document.createElement("style");

    style.textContent = `
        @keyframes ${animationName} {
            from {
                transform: translateY(-100%);
            }
            to {
                transform: translateY(${gameHeight}px);
            }
        }
    `;

    document.head.appendChild(style);
    drop.style.animationName = animationName;

    // Add drop to game area
    gameContainer.appendChild(drop);

    // Detect when a drop is clicked
    drop.addEventListener("pointerdown", () => {

        // Only count points while game is active
        if (!gameRunning) return;

        if (isBadDrop) {
            // Bad drops remove one point
            score--;
        } else {
            // Good drops add one point
            score++;
        }

        // Update score display
        scoreDisplay.textContent = score;

        // Remove clicked drop
        drop.remove();
        style.remove();
    });

    // Remove missed drops
    drop.addEventListener("animationend", () => {
        drop.remove();
        style.remove();
    });
}


// Function to end the game
function endGame() {

    // Stop game
    gameRunning = false;

    // Stop creating drops
    clearInterval(dropMaker);

    // Stop countdown timer
    clearInterval(gameTimer);

    // Remove remaining drops
    document.querySelectorAll(".water-drop").forEach(drop => {
        drop.remove();
    });

    // Choose a random message
    let message;

    if (score >= 20) {

        // Pick a random winning message
        const randomIndex = Math.floor(
            Math.random() * winningMessages.length
        );

        message = winningMessages[randomIndex];

    } else {

        // Pick a random losing message
        const randomIndex = Math.floor(
            Math.random() * losingMessages.length
        );

        message = losingMessages[randomIndex];
    }

    // Display final score and message
    gameMessage.textContent = message + " Final Score: " + score;

    gameMessage.style.display = "block";

    // Enable button to play again
    startBtn.disabled = false;
    startBtn.textContent = "Play Again";
}
