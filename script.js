// Milestone messages
const milestones = [
  { score: 5, message: "Great start!" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "Keep going!" },
  { score: 20, message: "Amazing!" },
  { score: 30, message: "Water Hero!" }
];
let reachedMilestones = new Set();
// Variables to control game state

let gameRunning = false;
let dropMaker;
let score = 0;
let timeLeft = 30;
let timerInterval;

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const winScoreDisplay = document.getElementById("win-score");
const gameContainer = document.getElementById("game-container");
let feedbackTimeout;

const resetBtn = document.getElementById("reset-btn");
const waterCan = document.getElementById("water-can");
const confettiContainer = document.getElementById("confetti-container");
const levelSelect = document.getElementById("level");

let levelSettings = {
  easy:    { dropInterval: 1200, badRate: 0.15, obstacleRate: 0.05, canBonus: 7, winScore: 15 },
  medium:  { dropInterval: 900,  badRate: 0.25, obstacleRate: 0.10, canBonus: 5, winScore: 20 },
  hard:    { dropInterval: 700,  badRate: 0.35, obstacleRate: 0.15, canBonus: 4, winScore: 30 },
  extreme: { dropInterval: 500,  badRate: 0.5,  obstacleRate: 0.20, canBonus: 3, winScore: 40 }
};
let currentLevel = 'easy';
let currentSettings = levelSettings[currentLevel];

levelSelect.addEventListener('change', function() {
  currentLevel = levelSelect.value;
  currentSettings = levelSettings[currentLevel];
  winScoreDisplay.textContent = currentSettings.winScore;
  resetGame();
});

resetBtn.addEventListener("click", resetGame);

function resetGame() {
  endGame();
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  feedbackMsg.textContent = "";
  clearDrops();
}

// Feedback message
const feedbackMsg = document.createElement("div");
feedbackMsg.id = "feedback-msg";
feedbackMsg.style.position = "absolute";
feedbackMsg.style.top = "10px";
feedbackMsg.style.left = "50%";
feedbackMsg.style.transform = "translateX(-50%)";
feedbackMsg.style.fontSize = "2rem";
feedbackMsg.style.fontWeight = "bold";
feedbackMsg.style.zIndex = "1000";
feedbackMsg.style.pointerEvents = "none";
gameContainer.appendChild(feedbackMsg);

document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  winScoreDisplay.textContent = currentSettings.winScore;
  feedbackMsg.textContent = "";
  clearDrops();
  dropMaker = setInterval(createDrop, currentSettings.dropInterval);
  timerInterval = setInterval(updateTimer, 1000);
  showCanInterval = setInterval(() => {
    if (gameRunning) showCan();
  }, 5000);
}
// Set initial win score display
winScoreDisplay.textContent = levelSettings.easy.winScore;

function updateTimer() {
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(showCanInterval);
  showFeedback(`Game Over! Final Score: ${score}`, '#2E9DF7');
  clearDrops();
  // Celebrate win if score >= winScore for level
  if (score >= currentSettings.winScore) {
    launchConfetti();
  }
  waterCan.style.display = "none";
}

function clearDrops() {
  while (gameContainer.firstChild) {
    gameContainer.removeChild(gameContainer.firstChild);
  }
  gameContainer.appendChild(feedbackMsg);
  gameContainer.appendChild(waterCan);
  gameContainer.appendChild(confettiContainer);
}

function createDrop() {
  const drop = document.createElement("div");
  const isBad = Math.random() < currentSettings.badRate;
  // Add obstacle drop (e.g., rock) with obstacleRate chance
  const isObstacle = !isBad && Math.random() < currentSettings.obstacleRate;
  if (isObstacle) {
    drop.className = "obstacle-drop";
    drop.style.background = "linear-gradient(180deg, #888 60%, #333 100%)";
    drop.style.border = "2px solid #333";
  } else {
    drop.className = isBad ? "bad-drop" : "water-drop";
  }
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = "4s";
  gameContainer.appendChild(drop);
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
  drop.addEventListener("pointerdown", function(e) {
    if (!gameRunning) return;
    if (isObstacle) {
      score -= 10;
      showFeedback("Ouch! Obstacle! -10", '#F16061');
    } else if (isBad) {
      score -= 5;
      showFeedback("Oh no! Bad drop! -5", '#F5402C');
    } else {
      score += 1;
      showFeedback("Nice! +1", '#4FCB53');
    }
    scoreDisplay.textContent = score;
    drop.remove();
    e.stopPropagation();
  });
}
// Interactive can logic
let showCanInterval;
function showCan() {
  waterCan.style.display = "block";
  setTimeout(() => {
    if (gameRunning) waterCan.style.display = "none";
  }, 2000);
}

waterCan.addEventListener("pointerdown", function(e) {
  if (!gameRunning) return;
  score += currentSettings.canBonus;
  scoreDisplay.textContent = score;
  showFeedback(`Bonus! +${currentSettings.canBonus}`, '#FFC907');
  waterCan.style.display = "none";
  e.stopPropagation();
});
// Confetti effect
function launchConfetti() {
  confettiContainer.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "absolute";
    confetti.style.width = "8px";
    confetti.style.height = "16px";
    confetti.style.background = `hsl(${Math.random()*360},90%,60%)`;
    confetti.style.left = Math.random()*100 + "%";
    confetti.style.top = "-20px";
    confetti.style.opacity = 0.8;
    confetti.style.borderRadius = "4px";
    confetti.style.zIndex = 10001;
    confettiContainer.appendChild(confetti);
    // Animate confetti
    setTimeout(() => {
      confetti.style.transition = "top 1.2s cubic-bezier(.5,1.8,.5,1), opacity 1.2s";
      confetti.style.top = (Math.random()*80+20) + "%";
      confetti.style.opacity = 0;
    }, 10);
    setTimeout(() => confetti.remove(), 1400);
  }
}

function showFeedback(msg, color) {
  feedbackMsg.textContent = msg;
  feedbackMsg.style.color = color;
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    feedbackMsg.textContent = "";
  }, 1000);
}
