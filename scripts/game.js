import {
    getPlayerName,
    savePlayerName,
    getTheme,
    saveTheme,
    getSpeed,
    saveSpeed,
    saveHighScore
} from './storage.js';

// 1. Setup Constants and Variables
var WIDTH = 26, HEIGHT = 26; // Width and height of the game board
var EMPTY = 0, SNAKE = 1, FOOD = 2;
var LEFT  = 0, RIGHT = 1, UP = 2, DOWN  = 3;
var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN  = 40;
var canvas, ctx, keystate, frames, score, gameOver; 
var speed = 7; // Default speed (Normal)
var foodScore = 1; // Increase scores with higher difficulty levels/speeds
var gameStarted = false;
var animationStarted = false;

// Cached Theme Colors
var snakeColor = "#28a745";
var canvasBg = "#ffffff";
var textColor = "#333333";

function updateThemeColors() {
    const computedStyle = getComputedStyle(document.body);
    snakeColor = computedStyle.getPropertyValue('--snake-color').trim() || "#28a745";
    canvasBg = computedStyle.getPropertyValue('--canvas-bg').trim() || "#ffffff";
    textColor = computedStyle.getPropertyValue('--text-color').trim() || "#333333";
}

var grid = {
    width: null, height: null, _grid: null,
    init: function(d, c, r) {
        this.width = c; this.height = r; this._grid = [];
        for (var x = 0; x < c; x++) {
            this._grid.push([]);
            for (var y = 0; y < r; y++) { this._grid[x].push(d); }
        }
    },
    set: function(val, x, y) { this._grid[x][y] = val; },
    get: function(x, y) { return this._grid[x][y]; }
};

var snake = {
    direction: null, last: null, _queue: null,
    init: function(d, x, y) {
        this.direction = d; this._queue = []; this.insert(x, y);
    },
    insert: function(x, y) {
        this._queue.unshift({x: x, y: y});
        this.last = this._queue[0];
    },
    remove: function() { return this._queue.pop(); }
};

function setFood() {
    var empty = [];
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) { empty.push({x: x, y: y}); }
        }
    }
    if (empty.length === 0) return; 
    var randpos = empty[Math.floor(Math.random() * empty.length)];
    grid.set(FOOD, randpos.x, randpos.y);
}

function main() {
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = WIDTH * 20;
        canvas.height = HEIGHT * 20;
        ctx = canvas.getContext("2d");
        
        var gameSection = document.getElementById("game-section");
        var gameOverDiv = document.getElementById("gameOverScreen");
        gameSection.insertBefore(canvas, gameOverDiv);
        
        ctx.font = "bold 14px Arial";
    }

    frames = 0;
    keystate = {};

    if (!gameStarted) {
        document.addEventListener("keydown", function(evt) {
            if (document.activeElement.tagName === "INPUT") return;
            if([KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN].indexOf(evt.keyCode) > -1) {
                evt.preventDefault();
            }
            keystate[evt.keyCode] = true;
        });
        
        document.addEventListener("keyup", function(evt) {
            delete keystate[evt.keyCode];
        });

        gameStarted = true;
    }

    initGame();

    if (!animationStarted) {
        animationStarted = true;
        setTimeout(playGame, 500); // Give the player one second before a new game starts
    }
}

function initGame() {
    gameOver = false; 
    score = 0;
    updateThemeColors(); 
    grid.init(EMPTY, WIDTH, HEIGHT);
    var sp = {x: Math.floor(WIDTH/2), y: HEIGHT-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    setFood();

    const announcer = document.getElementById("game-announcer");
    if (announcer) {
        announcer.textContent = "Game started. Current score: 0";
    }

    if (document.getElementById("gameOverScreen")) {
        document.getElementById("gameOverScreen").classList.add("hidden");
    }

    draw();
}

function playGame() {
    if (!gameOver) {
        update();
        draw();
    }
    window.requestAnimationFrame(playGame);
}

function update() {
    if (speed >= 10) // Easy Mode
      foodScore = 1;
    else if (speed >= 7) // Normal Mode
      foodScore = 2;
    else if (speed >= 4) // Hard Mode
      foodScore = 3;
    else if (speed >= 2) // Insane Mode
      foodScore = 5;

    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) snake.direction = LEFT;
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT) snake.direction = RIGHT;
    if (keystate[KEY_UP] && snake.direction !== DOWN) snake.direction = UP;
    if (keystate[KEY_DOWN] && snake.direction !== UP) snake.direction = DOWN;

    // Move the snake every N (speed) frames
    if (frames % speed === 0) {
        var x = snake.last.x;
        var y = snake.last.y;

        switch (snake.direction) {
            case LEFT: x--; break;
            case RIGHT: x++; break;
            case UP: y--; break;
            case DOWN: y++; break;
        }

        // Game Over Check
        if (x < 0 || x >= grid.width || y < 0 || y >= grid.height || grid.get(x, y) === SNAKE) {
            gameOver = true; 

            const currentName = document.getElementById('playerName').value.trim() || "Anonymous";
            saveHighScore(currentName, score);

            document.getElementById("finalScore").innerText = score; 
            document.getElementById("gameOverScreen").classList.remove("hidden"); 
            
            const announcer = document.getElementById("game-announcer");
            if (announcer) {
                announcer.textContent = "Game over! Your final score is " + score;
            }
            return; 
        }

        if (grid.get(x, y) === FOOD) {
            score += foodScore;
            setFood();

            const announcer = document.getElementById("game-announcer");
            if (announcer) {
                announcer.textContent = "Current score: " + score;
            }
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }

        grid.set(SNAKE, x, y);
        snake.insert(x, y);
    }
}

// Draw the Game Board (grid)
function draw() {
    var tw = canvas.width / grid.width;
    var th = canvas.height / grid.height;

    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            // Draw a filled rectangle with the color of the grid value (empty, snake, or food)
            switch (grid.get(x, y)) {
                case EMPTY: ctx.fillStyle = canvasBg; break;
                case SNAKE: ctx.fillStyle = snakeColor; break;
                case FOOD: ctx.fillStyle = "#ff4444"; break; 
            }
            ctx.fillRect(x * tw, y * th, tw, th);
        }
    }

    // Draw the player score on top of everything else on the game board
    ctx.fillStyle = textColor;
    ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
}

const nameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveNameBtn');
const greeting = document.getElementById('greetingMessage');
const speedSelect = document.getElementById('speedSelect');

// Load saved speed settings
if (speedSelect) {
    const savedSpeed = getSpeed();
    speedSelect.value = savedSpeed;
    speed = parseInt(savedSpeed);

    speedSelect.addEventListener('change', (event) => {
        speed = parseInt(event.target.value);
        saveSpeed(speed);
    });
}

// Load saved name
const savedName = getPlayerName();
if (savedName) {
    nameInput.value = savedName;
    greeting.textContent = `Welcome back, ${savedName}!`;
    if (savedName.toLowerCase() === "garfield") {
        unlockGarfieldTheme();
    }
}

if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        if (playerName !== "") {
            savePlayerName(playerName);
            greeting.textContent = `Name saved as ${playerName}!`;
            if (playerName.toLowerCase() === "garfield") {
                unlockGarfieldTheme();
            }
        }
    });
}

const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
    const savedTheme = getTheme();
    themeSelect.value = savedTheme;
    document.body.className = `theme-${savedTheme}`;
    setTimeout(updateThemeColors, 50);

    themeSelect.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        document.body.className = `theme-${selectedTheme}`;
        saveTheme(selectedTheme);
        setTimeout(() => {
            updateThemeColors(); 
            if (canvas && ctx) draw();
        }, 50);
    });
}

function unlockGarfieldTheme() {
    const themeSelect = document.getElementById('themeSelect');
    let garfieldOption = themeSelect.querySelector('option[value="garfield"]');
    if (!garfieldOption) {
        garfieldOption = document.createElement('option');
        garfieldOption.value = 'garfield';
        garfieldOption.textContent = 'Garfield (Monday Mode)';
        themeSelect.appendChild(garfieldOption);
    }
    themeSelect.value = 'garfield';
    document.body.className = 'theme-garfield';
    saveTheme('garfield');
    setTimeout(() => {
        updateThemeColors();
        if (canvas && ctx) draw();
    }, 50);
}

document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");

    console.log("Hint: If you hate Mondays, try Garfield as your name.");

    if (startBtn) {
        startBtn.addEventListener("click", function() {
            document.getElementById("startScreen").classList.add("hidden");
            document.getElementById("game-section").classList.remove("hidden");
            main(); 
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", function() {
            document.getElementById("gameOverScreen").classList.add("hidden"); 
            initGame(); 
        });
    }
});
