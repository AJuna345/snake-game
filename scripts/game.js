// 1. Setup Constants and Variables
var COLS = 26, ROWS = 26,
    EMPTY = 0, SNAKE = 1, FRUIT = 2,
    LEFT  = 0, UP    = 1, RIGHT = 2, DOWN  = 3,
    KEY_LEFT  = 37, KEY_UP    = 38, KEY_RIGHT = 39, KEY_DOWN  = 40,
    canvas, ctx, keystate, frames, score, isGameOver; 

// Cached Theme Colors
var currentSnakeColor = "#28a745";
var currentCanvasBg = "#ffffff";
var currentTextColor = "#333333";

function updateThemeColors() {
    const computedStyle = getComputedStyle(document.body);
    currentSnakeColor = computedStyle.getPropertyValue('--snake-color').trim() || "#28a745";
    currentCanvasBg = computedStyle.getPropertyValue('--canvas-bg').trim() || "#ffffff";
    currentTextColor = computedStyle.getPropertyValue('--text-color').trim() || "#333333";
}

// 2. The Grid System
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

// 3. The Snake Object
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

// 4. Food Generator
function setFood() {
    var empty = [];
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) { empty.push({x: x, y: y}); }
        }
    }
    if (empty.length === 0) return; 
    var randpos = empty[Math.floor(Math.random() * empty.length)];
    grid.set(FRUIT, randpos.x, randpos.y);
}

// 5. Main Setup
function main() {
    // Create the canvas element ONLY after the start button is pushed
    canvas = document.createElement("canvas");
    canvas.width = COLS * 20;
    canvas.height = ROWS * 20;
    ctx = canvas.getContext("2d");
    
    // Insert canvas directly above the Game Over screen
    var gameSection = document.getElementById("game-section");
    var gameOverDiv = document.getElementById("gameOverScreen");
    gameSection.insertBefore(canvas, gameOverDiv);
    
    ctx.font = "bold 14px Arial";
    frames = 0;
    keystate = {};

    document.addEventListener("keydown", function(evt) {
        if (document.activeElement.tagName === "INPUT") return;

        if([37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
            evt.preventDefault();
        }
        keystate[evt.keyCode] = true;
    });
    
    document.addEventListener("keyup", function(evt) {
        delete keystate[evt.keyCode];
    });

    init();
    loop();
}

// 6. Game Initialization
function init() {
    isGameOver = false; 
    score = 0;
    updateThemeColors(); 
    grid.init(EMPTY, COLS, ROWS);
    var sp = {x: Math.floor(COLS/2), y: ROWS-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    setFood();
}

// 7. The Game Loop
function loop() {
    if (!isGameOver) {
        update();
        draw();
    }
    window.requestAnimationFrame(loop);
}

// 8. Update Logic
function update() {
    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) snake.direction = LEFT;
    if (keystate[KEY_UP] && snake.direction !== DOWN) snake.direction = UP;
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT) snake.direction = RIGHT;
    if (keystate[KEY_DOWN] && snake.direction !== UP) snake.direction = DOWN;

    if (frames % 7 === 0) {
        var nx = snake.last.x;
        var ny = snake.last.y;

        switch (snake.direction) {
            case LEFT: nx--; break;
            case UP: ny--; break;
            case RIGHT: nx++; break;
            case DOWN: ny++; break;
        }

        if (0 > nx || nx > grid.width-1 || 0 > ny || ny > grid.height-1 || grid.get(nx, ny) === SNAKE) {
            isGameOver = true; 
            document.getElementById("finalScore").innerText = score; 
            document.getElementById("gameOverScreen").classList.remove("hidden"); 
            
            // Screen reader accessibility announcement
            const announcer = document.getElementById("game-announcer");
            if (announcer) {
                announcer.textContent = "Game over! Your final score is " + score;
            }
            
            return; 
        }

        if (grid.get(nx, ny) === FRUIT) {
            score++;
            setFood();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }

        grid.set(SNAKE, nx, ny);
        snake.insert(nx, ny);
    }
}

// 9. Draw Everything
function draw() {
    var tw = canvas.width / grid.width;
    var th = canvas.height / grid.height;

    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            switch (grid.get(x, y)) {
                case EMPTY: ctx.fillStyle = currentCanvasBg; break;
                case SNAKE: ctx.fillStyle = currentSnakeColor; break;
                case FRUIT: ctx.fillStyle = "#ff4444"; break; 
            }
            ctx.fillRect(x * tw, y * th, tw, th);
        }
    }

    ctx.fillStyle = currentTextColor;
    ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
}

// Event Listeners for Game Restart
document.getElementById("restartBtn").addEventListener("click", function() {
    document.getElementById("gameOverScreen").classList.add("hidden"); 
    init(); 
});

// 10. LocalStorage Logic (Theme and Name Saver)
const nameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveNameBtn');
const greeting = document.getElementById('greetingMessage');

const savedName = localStorage.getItem('snakePlayerName');
if (savedName) {
    nameInput.value = savedName;
    greeting.textContent = `Welcome back, ${savedName}!`;
}

if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const currentName = nameInput.value.trim();
        if (currentName !== "") {
            localStorage.setItem('snakePlayerName', currentName);
            greeting.textContent = `Name saved as ${currentName}!`;
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
            if (canvas && ctx) draw();
        }, 50);
    });
}

// 11. Start Game Logic
document.getElementById("startBtn").addEventListener("click", function() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("game-section").classList.remove("hidden");
    main();
});
