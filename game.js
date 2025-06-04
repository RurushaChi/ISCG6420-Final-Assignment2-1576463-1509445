window.addEventListener('DOMContentLoaded', () => {
     /* Character Sprite sheet image  */
    const characterSpriteSheet = new Image();
    characterSpriteSheet.src = "./images/kraken_anim.png";
    characterSpriteSheet.onload = load;

    /*  Background image tilemap set  */
    const backgroundImage = new Image();
    backgroundImage.src = "./images/dark_water.jpg";
    backgroundImage.onload = load;

     /* Audio files */
    const sounds = {
        collectSuccess: new Audio('./musics/collect_success.mp3'),
        collectFail: new Audio('./musics/collect_fail.mp3'),
        gameStart: new Audio('./musics/game_start.mp3'),
        endGame: new Audio('./musics/end_game.mp3')
    };

    /*  Volume control variables */
    let masterVolume = 0.5;  /* Default 50% volume */

    /*  Set initial volume for all sounds */
    function updateAllVolumes() {
        Object.values(sounds).forEach(sound => {
            sound.volume = masterVolume;
        });
    }

    /*  Initialize volume */
    updateAllVolumes();

    /*  Specify the number of elements to load before initialization */
    const awaitLoadCount = 3;
    let loadCount = 0;

    /*  time tracking */
    let lastTimeStamp = 0;
    let tick = 0;
    let lastToySpawn = 0;
    const toySpawnInterval = 3000;  /* 3 seconds between spawns */

     /* canvas and context, not const as we don't set the value until document ready */
    let canvas;
    let ctx;

    /*  game objects */
    let character;
    let toys = [];
    let gameRunning = false;
    let gameTime = 60;  /* seconds */
    let timeLeft = 60;
    let score = 0;
    let gameTimer;

    /*  run when the website has finished loading */
    window.addEventListener("load", () => {
        load();
    });

    /*  call this function after each loadable element has finished loading. */
    /*  Once all elements are loaded, loadCount threshold will be met to init. */
    function load() {
        loadCount++;
        if (loadCount >= awaitLoadCount) {
            init();
        }
    }

     /* initialise canvas and game elements */
    function init() {
        canvas = document.getElementById('ex3canvas');
        ctx = canvas.getContext('2d');

        character = Character(
            characterSpriteSheet,
            [49, 41],

            [  /* main character set */
                [  /* walk up track */
                    [0, 41], [49, 246], [98, 246], [147, 246], [196, 246]
                ],
                [  /* walk down track  */
                    [0, 328], [49, 328], [98, 328], [147, 328], [196, 328]
                ],
                [  /* walk left track */
                    [0, 123], [49, 123], [98, 123], [147, 123], [196, 123]
                ],
                [  /* walk right track  */
                    [0, 82], [49, 82], [98, 82], [147, 82], [196, 82]
                ],
            ],
            1
        );
        character.init();

        document.addEventListener("keydown", doKeyDown);
        document.addEventListener("keyup", doKeyUp);

       /*   Initialize volume control */
        initVolumeControl();

       /*   Initialize UI */
        updateUI();
        
        window.requestAnimationFrame(run);
    }

    /*  Volume control initialization */
    function initVolumeControl() {
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeDisplay = document.getElementById('volumeDisplay');

        volumeSlider.addEventListener('input', function() {
            masterVolume = this.value / 100;  /* Convert to 0-1 range */
            volumeDisplay.textContent = this.value + '%';
            updateAllVolumes();
        });

        /*  Set initial display */
        volumeDisplay.textContent = volumeSlider.value + '%';
    }

     /* Game loop function */
    function run(timeStamp) {
        tick = (timeStamp - lastTimeStamp);
        lastTimeStamp = timeStamp;

        if (gameRunning) {
            update(tick);
        }
        draw();

        window.requestAnimationFrame(run);
    }

    function update(tick) {
        character.update(tick);
        
         /* Update toys */
        toys.forEach(toy => toy.update(tick));
        
         /* Note: Removed the filter that was removing stage 4 toys */
         /* Toys now cycle through all stages including stage 4 (relocate) */
        
         /* Spawn new toys based on time interval instead of random chance */
        if (gameRunning && (lastTimeStamp - lastToySpawn) > toySpawnInterval) {
            spawnToy();
            lastToySpawn = lastTimeStamp;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        
        /*  Draw toys */
        toys.forEach(toy => toy.draw(ctx));
        
        character.draw(ctx);
    }

    function doKeyDown(e) {
        e.preventDefault();
        if (character != undefined) { 
            if (e.key === ' ' || e.key === 'Spacebar') {
                attemptCollect();
            } else {
                character.doKeyInput(e.key, true); 
            }
        }
    }

    function doKeyUp(e) {
        e.preventDefault();
        if (character != undefined) { character.doKeyInput(e.key, false); }
    }

    /*  Game functions */
    window.startGame = function() {
        if (!gameRunning) {
            gameRunning = true;
            score = 0;
            gameTime = parseInt(document.getElementById('gameDuration').value);
            timeLeft = gameTime;
            toys = [];
            lastToySpawn = 0; // Reset spawn timer
            
             /* Reset character position and movement */
            character.position = [canvas.width / 2, canvas.height / 2];
            character.direction = [0, 0];  /* Stop all movement */
            character.lastAction = ""; /*  Reset last action */
            character.animationFrame = 0;  /* Reset animation frame */
            
            /*  Play sound with current volume */
            sounds.gameStart.volume = masterVolume;
            sounds.gameStart.play().catch(e => console.log('Audio play failed:', e));
            
            gameTimer = setInterval(() => {
                timeLeft--;
                updateUI();
                
                if (timeLeft <= 0) {
                    endGame(true); // Pass true to indicate natural end (not restart)
                }
            }, 1000);
            
            updateUI();
            document.getElementById('gameMessage').textContent = 'Game Started! Collect the toys!';
        }
    }

    window.restartGame = function() {
        endGame(false);  /* Pass false to indicate restart (no end sound) */
        setTimeout(() => {
            startGame();
        }, 100);
    }

    function endGame(playEndSound = true) {
        gameRunning = false;
        clearInterval(gameTimer);
        
        if (playEndSound) {
            sounds.endGame.volume = masterVolume;
            sounds.endGame.play().catch(e => console.log('Audio play failed:', e));
            document.getElementById('gameMessage').textContent = `Game Over! Final Score: ${score}`;
        }
    }

    function updateUI() {
        document.getElementById('scoreDisplay').textContent = score;
        document.getElementById('timeDisplay').textContent = timeLeft + 's';
    }

    function spawnToy() {
        const toy = Toy(
            Math.random() * canvas.width, /*  Random x position at top */
            0,  /* Start at top */
            Math.random() * canvas.width,  /* Random destination x */
            Math.random() * (canvas.height - 100) + 50 /*  Random destination y */
        );
        toys.push(toy);
    }

    function attemptCollect() {
        if (!gameRunning) return;
        
        let collected = false;
        const collectDistance = 60;  /* Increased collection distance */
        
        for (let i = toys.length - 1; i >= 0; i--) {
            const toy = toys[i];
            const dx = character.position[0] - toy.x;
            const dy = character.position[1] - toy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
             /* Allow collection in stages 2 and 3 (floating and sinking) */
            if (distance < collectDistance && (toy.stage === 2 || toy.stage === 3)) {
                 /* Successfully collected */
                toys.splice(i, 1);
                score++;
                collected = true;
                sounds.collectSuccess.volume = masterVolume;
                sounds.collectSuccess.play().catch(e => console.log('Audio play failed:', e));
                updateUI();
                break;
            }
        }
        
        if (!collected) {
            sounds.collectFail.volume = masterVolume;
            sounds.collectFail.play().catch(e => console.log('Audio play failed:', e));
        }
    }

     /* Toy object */
    function Toy(startX, startY, destX, destY) {
        return {
            x: startX,
            y: startY,
            destX: destX,
            destY: destY,
            radius: 20,
            opacity: 1,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            stage: 1,  /* 1: moving, 2: floating, 3: sinking, 4: relocate */
            stageTime: 0,
            speed: 0.15,  /* Slightly faster movement */

            update(tick) {
                this.stageTime += tick;

                switch (this.stage) {
                    case 1:  /* Moving to destination */
                        const dx = this.destX - this.x;
                        const dy = this.destY - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 2) {
                            this.x += (dx / distance) * this.speed * tick;
                            this.y += (dy / distance) * this.speed * tick;
                        } else {
                            this.stage = 2;
                            this.stageTime = 0;
                        }
                        break;
                        
                    case 2:  /* Floating */
                        if (this.stageTime > 5000) {  /* 5 seconds */
                            this.stage = 3;
                            this.stageTime = 0;
                        }
                        break;
                        
                    case 3:  /* Sinking */
                        const sinkProgress = this.stageTime / 5000;  /* 5 seconds to sink */
                        this.radius = 20 * (1 - sinkProgress * 0.7);  /* Shrink to 30% of original */
                        this.opacity = 1 - sinkProgress * 0.8;  /* Fade to 20% opacity */
                        
                        if (this.stageTime > 5000) {
                            this.stage = 4;  /* Move to stage 4 (relocate) */
                            this.stageTime = 0;
                        }
                        break;
                        
                    case 4:  /* Disappear and relocate */
                        /*  Don't draw during this stage (handled in draw method) */
                        /*  Relocate to random position on canvas edge after brief pause */
                        if (this.stageTime > 500) {  /* Brief 0.5 second pause */
                            this.relocateToEdge();
                            this.stage = 1;  /* Restart lifecycle */
                            this.stageTime = 0;
                        }
                        break;
                }
            },

            relocateToEdge() {
                 /* Reset toy properties */
                this.radius = 20;
                this.opacity = 1;
                this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
                
                 /* Choose random edge (top, right, bottom, left) */
                const edge = Math.floor(Math.random() * 4);
                
                switch (edge) {
                    case 0: /*  Top edge */
                        this.x = Math.random() * canvas.width;
                        this.y = 0;
                        break;
                    case 1:  /* Right edge  */ 
                        this.x = canvas.width;
                        this.y = Math.random() * canvas.height;
                        break;
                    case 2:  /* Bottom edge */
                        this.x = Math.random() * canvas.width;
                        this.y = canvas.height;
                        break;
                    case 3:  /* Left edge */
                        this.x = 0;
                        this.y = Math.random() * canvas.height;
                        break;
                }
                
                 /* Set new random destination */
                this.destX = Math.random() * canvas.width;
                this.destY = Math.random() * (canvas.height - 100) + 50;
            },

            draw(context) {
                if (this.stage === 4) return;  /* Don't draw during stage 4 */
                
                context.save();
                context.globalAlpha = this.opacity;
                
                /*  Create radial gradient for reflective surface */
                const gradient = context.createRadialGradient(
                    this.x, this.y - this.radius/3, 0,
                    this.x, this.y, this.radius
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.3, this.color);
                gradient.addColorStop(1, this.darkenColor(this.color));
                
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                context.fillStyle = gradient;
                context.fill();
                
                context.restore();
            },

            darkenColor(color) {
                /*  Simple color darkening for gradient effect */
                return color.replace(/60%/, '30%');
            }
        };
    }

     /* Create and return a new Character object. */
     /* Param: spritesheet = Image object */
     /* Param: spriteSize = Array of 2 numbers [width, height] */
     /* Param: spriteFrames = 3D array[Tracks[Frames[Frame X, Y]]] */
     /* Param: spriteScale = Number to scale sprite size -> canvas size */
    function Character(spritesheet, spriteSize, spriteFrames, spriteScale) {
        return {
            spriteSheet: spritesheet,        /* image containing the sprites */
            spriteFrameSize: spriteSize,     /* dimensions of the sprites in the spritesheet */
            spriteFrames: spriteFrames,      /* 3d array. X = animation track, Y = animation frame, Z = X & Y of frame */
            spriteScale: spriteScale,        /* amount to scale sprites by (numbers except 1 will be linearly interpolated) */
            spriteCanvasSize: spriteSize,    /* Calculated size after scale. temp value set, overwritten in init */

            animationTrack: 0,               /* current animation frame set to use */
            animationFrame: 0,               /* current frame in animation to draw */
            frameTime: 125,                  /* milliseconds to wait between animation frame updates */
            timeSinceLastFrame: 0,           /* track time since the last frame update was performed */
            lastAction: "",                  /* Last user input action performed */

            position: [400, 255],            /* position of the character (X, Y) - centered */
            direction: [0, 0],               /*  X and Y axis movement amount */
            velocity: 0.2,                   /* rate of position change for each axis */

             /* Initialise variables that cannot be calculated during object creation. */
            init() {
                 /* Apply scale multiplier to sprite frame dimensions */
                this.spriteCanvasSize = [
                    this.spriteFrameSize[0] * this.spriteScale,
                    this.spriteFrameSize[1] * this.spriteScale
                ];
            },

             /* Handle actions for the character to perform. */
            action(action) {
                console.log(`action: ${action}. Animation Frame ${this.animationFrame}`);
                 /* ignore duplicate actions. */
                if (action === this.lastAction) return;

                /*  Handle each action type as cases. */
                switch (action) {
                    case "moveLeft":
                        this.animationTrack = 2;
                        this.animationFrame = 0;
                        this.direction[0] = -this.velocity;
                        break;
                    case "moveRight":
                        this.animationTrack = 3;
                        this.animationFrame = 0;
                        this.direction[0] = this.velocity;
                        break;
                    case "moveUp":
                        this.animationTrack = 0;
                        this.animationFrame = 0;
                        this.direction[1] = -this.velocity;
                        break;
                    case "moveDown":
                        this.animationTrack = 1;
                        this.animationFrame = 0;
                        this.direction[1] = this.velocity;
                        break;
                    case "noMoveHorizontal":
                        this.direction[0] = 0;
                        this.animationFrame = 0;
                        break;
                    case "noMoveVertical":
                        this.direction[1] = 0;
                        this.animationFrame = 0;
                        break;
                    default:
                        this.direction = [0, 0];
                        break;
                }

                 /* keep track of last action to avoid reinitialising the current action. */
                this.lastAction = action;
            },

            update(tick) {
               /*   increase time keeper by last update delta */
                this.timeSinceLastFrame += tick;
                 /* check if time since last frame meets threshold for new frame */
                if (this.timeSinceLastFrame >= this.frameTime) {
                     /* reset frame time keeper */
                    this.timeSinceLastFrame = 0;

                    /*  update frame to next frame on the track. */ 
                    /*  Modulo wraps the frames from last frame to first. */
                    if (this.direction[0] !== 0 || this.direction[1] !== 0) {
                        this.animationFrame = (this.animationFrame + 1) % this.spriteFrames[this.animationTrack].length;
                    }
                }

                 /* Calculate how much movement to perform based on how long */
                 /* it has been since the last position update. */
                let newX = this.position[0] + this.direction[0] * tick;
                let newY = this.position[1] + this.direction[1] * tick;

                 /* Boundary checking - keep character inside canvas */
                if (newX < 0) newX = 0;
                if (newX > canvas.width - this.spriteCanvasSize[0]) newX = canvas.width - this.spriteCanvasSize[0];
                if (newY < 0) newY = 0;
                if (newY > canvas.height - this.spriteCanvasSize[1]) newY = canvas.height - this.spriteCanvasSize[1];

                this.position[0] = newX;
                this.position[1] = newY;
            },

             /* Draw character elements using the passed context (canvas). */
            draw(context) {
                 /* Draw image to canvas. */
                context.drawImage(
                    this.spriteSheet,
                    this.spriteFrames[this.animationTrack][this.animationFrame][0],
                    this.spriteFrames[this.animationTrack][this.animationFrame][1],
                    this.spriteFrameSize[0],
                    this.spriteFrameSize[1],
                    this.position[0],
                    this.position[1],
                    this.spriteCanvasSize[0],
                    this.spriteCanvasSize[1]
                );
            },

             /* Handle input from keyboard for the character. */
            doKeyInput(e, isKeydown = true) {
                if (!gameRunning) return; /*  Only allow movement when game is running */
                
                switch (e) {
                    case "w":
                    case "ArrowUp":   /* Supports both W and Up Arrow */
                        if (isKeydown) this.action("moveUp");
                        else this.action("noMoveVertical");
                        break;
                    case "a":
                    case "ArrowLeft":  /* Supports both A and Left Arrow */ 
                        if (isKeydown) this.action("moveLeft");
                        else this.action("noMoveHorizontal");
                        break;
                    case "s":
                    case "ArrowDown":   /* Supports both S and Down Arrow */
                        if (isKeydown) this.action("moveDown");
                        else this.action("noMoveVertical");
                        break;
                    case "d":
                    case "ArrowRight":   /* Supports both D and Right Arrow */
                        if (isKeydown) this.action("moveRight");
                        else this.action("noMoveHorizontal");
                        break;
                    default:
                        if (!isKeydown) this.action("stop");
                        break;
                }
            }
        };
    }

     /* Initialize event listeners for buttons */
    document.getElementById('startBtn').addEventListener('click', window.startGame);
    document.getElementById('restartBtn').addEventListener('click', window.restartGame);
});