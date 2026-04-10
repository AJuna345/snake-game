var WIDTH = 26, HEIGHT = 26; // Width and height of the game board
var EMPTY = 0, SNAKE = 1, FOOD = 2;
var LEFT  = 0, RIGHT = 1, UP = 2, DOWN  = 3;
var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN  = 40;
var canvas, ctx, keystate, frames, score, gameOver; 
var speed = 7; // Default speed (Normal)
var scoreMultiplier = 1; // Increase scores with higher difficulty levels/speeds

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
    canvas = document.createElement("canvas");
    canvas.width = WIDTH * 20;
    canvas.height = HEIGHT * 20;
    ctx = canvas.getContext("2d");
    
    var gameSection = document.getElementById("game-section");
    var gameOverDiv = document.getElementById("gameOverScreen");
    gameSection.insertBefore(canvas, gameOverDiv);
    
    ctx.font = "bold 14px Arial";
    frames = 0;
    keystate = {};

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

    initGame();
    playGame();
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
}

function playGame() {
    if (!gameOver) {
        update();
        draw();
    }
    
    window.requestAnimationFrame(playGame);
}

function update() {
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
            saveHighScore(score);

            document.getElementById("finalScore").innerText = score; 
            document.getElementById("gameOverScreen").classList.remove("hidden"); 
            
            const announcer = document.getElementById("game-announcer");
            if (announcer) {
                announcer.textContent = "Game over! Your final score is " + score;
            }
            return; 
        }

        if (grid.get(x, y) === FOOD) {
            score+=scoreMultiplier;
            setFood();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }

        grid.set(SNAKE, x, y);
        snake.insert(x, y);
    }
}

function saveHighScore(latestScore) {
    const name = document.getElementById('playerName').value.trim() || "Anonymous";
    let highScores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    highScores.push({ name: name, score: latestScore });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10);
    localStorage.setItem('snakeLeaderboard', JSON.stringify(highScores));
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

document.getElementById("restartBtn").addEventListener("click", function() {
    document.getElementById("gameOverScreen").classList.add("hidden"); 
    initGame(); 
});

const nameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveNameBtn');
const greeting = document.getElementById('greetingMessage');
const speedSelect = document.getElementById('speedSelect');

// Load saved speed settings
if (speedSelect) {
    const savedSpeed = localStorage.getItem('snakeSpeed');
    if (savedSpeed) {
        speedSelect.value = savedSpeed;
        speed = parseInt(savedSpeed);
    }
    speedSelect.addEventListener('change', (event) => {
        speed = parseInt(event.target.value);
        localStorage.setItem('snakeSpeed', speed);
    });

    speedMultiplier = 10 - speed + 1;
}

// Load saved name
const savedName = localStorage.getItem('snakePlayerName');
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
            localStorage.setItem('snakePlayerName', playerName);
            greeting.textContent = `Name saved as ${playerName}!`;
            if (playerName.toLowerCase() === "garfield") {
                unlockGarfieldTheme();
            }
        }
    });
}

const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
    const savedTheme = localStorage.getItem('snakeTheme') || 'classic';
    themeSelect.value = savedTheme;
    document.body.className = `theme-${savedTheme}`;
    setTimeout(updateThemeColors, 50);

    themeSelect.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        document.body.className = `theme-${selectedTheme}`;
        localStorage.setItem('snakeTheme', selectedTheme);
        setTimeout(() => {
            updateThemeColors(); 
            if (canvas && ctx && !gameOver) draw();
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
    localStorage.setItem('snakeTheme', 'garfield');
    setTimeout(() => {
        updateThemeColors();
        if (canvas && ctx && !gameOver) draw();
    }, 50);
}

document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById("startBtn");
    if (startBtn) {
        startBtn.addEventListener("click", function() {
            document.getElementById("startScreen").classList.add("hidden");
            document.getElementById("game-section").classList.remove("hidden");
            main(); 
        });
    }
});
