document.addEventListener("DOMContentLoaded", function () {
    //initializse canvas
    const canvas = document.getElementById("carnivalCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // loading all images
    const startBackgroundImage = new Image();
    startBackgroundImage.src = "StartBackground.png"; //credits for pic: https://m.media-amazon.com/images/I/71M5yQxdusL._AC_SL1005_.jpg
    startBackgroundImage.onload = function () {
        ctx.drawImage(startBackgroundImage, 0, 0, canvas.width, canvas.height)
    }
    const defaultBackgroundImage = new Image(); // from https://static.vecteezy.com/system/resources/previews/019/493/840/original/abstract-geometric-background-of-squares-grey-pixel-background-with-empty-space-illustration-vector.jpg
    defaultBackgroundImage.src = "background.png";
    const gameplayBackground = new Image();
    gameplayBackground.src = "gameplayBackground.png";

    // load all sounds (from https://mixkit.co/free-sound-effects/game/)
    let isMuted = false;
    const reloadSound = new Audio("reload-sound.mp3");
    const buttonClickSound = new Audio("buttonClick-sound.wav");
    const shootSoundInstance = new Audio("shoot-sound.mp3");

    // initialise game variables
    let playerName = "";
    let totalShotsTaken = 0;
    let targetsHit = 0;
    let reloads = 0;
    let gameSessions = [];
    let gameState = "startMenu";
    let score = 0;
    let combo = 0;
    let highestCombo = 0;
    let currentDifficulty = "Easy";
    let defaultTime = 1200;
    let timeLeft = defaultTime; // Initial time in milliseconds

    // all helper functions
    const deleteAllDomElements = () => {
        // Select all buttons in the document
        const allButtons = document.querySelectorAll("button");
        const allImgs = document.querySelectorAll("img");

        // Remove each button from the DOM
        allButtons.forEach(button => {
            button.parentNode.removeChild(button);
        });

        allImgs.forEach(img => {
            img.parentNode.removeChild(img);
        });

        const playerNameInput = document.getElementById("playerNameInput");
        if (playerNameInput) {
            playerNameInput.parentNode.removeChild(playerNameInput);
        }
    };

    function getSmallerCanvasSide() {
        const minCanvasHeight = 650;
        const minCanvasWidth = 1397;

        if (canvas.width > minCanvasWidth && canvas.height > minCanvasHeight) {
            return minCanvasHeight + 450;
        }
        else if (canvas.width < canvas.height) {
            return canvas.width + 450;
        }
        else {
            return canvas.height + 450;
        }
    }

    function createText(style, font, textAlign, text, posX, posY) {
        ctx.fillStyle = style;
        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.fillText(text, posX, posY);
    }

    const removeLevelButtons = () => {
        const levelButtons = document.querySelectorAll("img[id^='easyButton'], img[id^='mediumButton'], img[id^='hardButton']");
        levelButtons.forEach(button => {
            button.parentNode.removeChild(button);
        });
    };

    function createMuteButton() {
        const muteButton = document.createElement("img");
        muteButton.id = "muteButton";
        muteButton.style.position = "fixed";
        muteButton.style.bottom = "10px";
        muteButton.style.left = "10px";
        muteButton.style.width = "40px";
        muteButton.style.height = "auto";
        muteButton.style.cursor = "pointer";
        muteButton.src = isMuted ? "muteOn.png" : "muteOff.png"; // credits for pic: https://img.freepik.com/premium-vector/voiced-silent-icon-with-pixel-art-style_475147-305.jpg
        muteButton.addEventListener("click", toggleMute);
        document.body.appendChild(muteButton);
        console.log("added button");
    }

    function toggleMute() {
        isMuted = !isMuted;
        muteButton.src = isMuted ? "muteOn.png" : "muteOff.png";
        if (isMuted) {
            reloadSound.volume = 0;
            buttonClickSound.volume = 0;
            shootSoundInstance.volume = 0;
        } else {
            reloadSound.volume = 1;
            buttonClickSound.volume = 1;
            shootSoundInstance.volume = 1;
        }
    }

    document.addEventListener("keydown", function (event) {
        if (event.key.toUpperCase() === "M") {
            toggleMute();
        }
    });

    createMuteButton();

    // background drawing
    function drawStartBackground() {
        ctx.drawImage(startBackgroundImage, 0, 0, canvas.width, canvas.height);
    }

    function drawGameplayBackground() {
        ctx.drawImage(gameplayBackground, 0, 0, canvas.width, canvas.height);
    }

    function drawDefaultBackground() {
        ctx.drawImage(defaultBackgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // level drawing and handling
    const startGame = () => {
        const playerNameInput = document.getElementById("playerNameInput");
        playerName = playerNameInput.value.trim(); // Trim whitespace from input
        if (playerName.length === 0) {
            alert("Please enter your name to start the game.");
        } else if (playerName.length >= 15) {
            alert("The player cannot be longer than 15 characters");
        } else {
            drawDefaultBackground();
            gameState = "selectLevel"; // Switch to level selection state

            // Remove the start button and input field from the DOM
            startButton.parentNode.removeChild(startButton);
            highScoresButton.parentNode.removeChild(highScoresButton);

            // Display level selection
            selectLevel();
        }

    };

    const selectLevel = () => {
        createMuteButton();
        deleteAllDomElements();

        const playerNameInput = document.getElementById("newPlayerNameInput");
        if (playerNameInput) {
            playerNameInput.parentNode.removeChild(playerNameInput);
        }
        drawDefaultBackground();
        createText("black", getSmallerCanvasSide() / 16.04 + "px Arial", "center", "Select a Level", canvas.width / 2, canvas.height / 3.003344)

        // Create buttons for each level
        const easyButton = document.createElement("img");
        easyButton.src = "Easy.png";
        easyButton.id = "easyButton";
        easyButton.style.position = "absolute";
        easyButton.style.top = "40%";
        easyButton.style.left = "50%";
        easyButton.style.width = canvas.width / 11 + "px";
        easyButton.style.height = canvas.height / 13 + "px";
        easyButton.style.transform = "translate(-50%, -50%)";
        easyButton.addEventListener("click", () => {
            //easyButton.parentNode.removeChild(easyButton);
            buttonClickSound.play();
            startShooterGame("easy");
            removeLevelButtons(); // Call function to remove level selection buttons
        });
        document.body.appendChild(easyButton);

        const mediumButton = document.createElement("img");
        mediumButton.src = "Medium.png";
        mediumButton.id = "mediumButton";
        mediumButton.style.position = "absolute";
        mediumButton.style.top = "50%";
        mediumButton.style.left = "50%";
        mediumButton.style.width = canvas.width / 11 + "px";
        mediumButton.style.height = canvas.height / 13 + "px";
        mediumButton.style.transform = "translate(-50%, -50%)";
        mediumButton.addEventListener("click", () => {
            buttonClickSound.play();
            startShooterGame("medium");
            removeLevelButtons(); // Call function to remove level selection buttons
        });
        document.body.appendChild(mediumButton);

        const hardButton = document.createElement("img");
        hardButton.src = "Hard.png";
        hardButton.id = "hardButton";
        hardButton.style.position = "absolute";
        hardButton.style.top = "60%";
        hardButton.style.left = "50%";
        hardButton.style.width = canvas.width / 11 + "px";
        hardButton.style.height = canvas.height / 13 + "px";
        hardButton.style.transform = "translate(-50%, -50%)";
        hardButton.addEventListener("click", () => {
            buttonClickSound.play();
            startShooterGame("hard");
            removeLevelButtons(); // Call function to remove level selection buttons
        });
        document.body.appendChild(hardButton);
    };

    const highScores = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDefaultBackground();

        // Remove all buttons from the DOM
        deleteAllDomElements();

        // Display the high scores title
        createText("black", getSmallerCanvasSide() / 30 + "px Arial", "center", "High Scores", canvas.width / 2, canvas.height / 3.277372);

        gameSessions.sort((a, b) => b.score - a.score); // Descending order

        // Display high scores
        let yPos = canvas.height / 2.573065; // Initial vertical position for displaying scores
        const scoreFontSize = 20;
        for (let i = 0; i < gameSessions.length; i++) {
            const session = gameSessions[i];
            const scoreText = `${session.playerName}: 
        Score - ${session.score},
        Total Shots - ${session.totalShotsTaken},
        Targets Hit - ${session.targetsHit},
        Reloads - ${session.reloads},
        Highest combo - ${session.highestCombo},
        Difficulty - ${session.difficulty}`;

            createText("black", getSmallerCanvasSide() / 55 + "px Arial", "center", scoreText, canvas.width / 2, yPos);
            yPos += scoreFontSize + 10; // Increase vertical position for the next score
        }

        // Display back button
        const backButton = document.createElement("button");
        backButton.textContent = "Back to Start Menu";
        backButton.id = "backButton";
        backButton.style.position = "absolute";
        backButton.style.top = "80%";
        backButton.style.left = "50%";
        backButton.style.transform = "translateX(-50%)";
        backButton.addEventListener("click", () => {
            buttonClickSound.play();
            backButton.parentNode.removeChild(backButton);
            gameState = "startMenu";
            displayStartMenu();
        });
        document.body.appendChild(backButton);
    };

    const displayStartMenu = () => {
        drawStartBackground();

        // Create input field for player's name
        const playerNameInput = document.createElement("input");
        playerNameInput.type = "text";
        playerNameInput.placeholder = "Enter your name";
        playerNameInput.id = "playerNameInput";
        playerNameInput.style.position = "absolute";
        playerNameInput.style.top = "57%";
        playerNameInput.style.left = "48%";
        playerNameInput.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(playerNameInput);

        // Create start button
        const startButton = document.createElement("img");
        startButton.src = "Start.png";
        startButton.id = "startButton";
        startButton.style.position = "absolute";
        startButton.style.top = "63%";
        startButton.style.left = "37.5%";
        startButton.style.transform = "translate(-50%, -50%)";
        startButton.style.cursor = "pointer";
        startButton.style.width = canvas.width / 13 + "px";
        startButton.style.height = canvas.height / 18 + "px";
        startButton.addEventListener("click", () => {
            startGame();
            buttonClickSound.play();
        });
        document.body.appendChild(startButton);

        // Define and append the highScoresButton
        const highScoresButton = document.createElement("img");
        highScoresButton.src = "Highscores.png";
        highScoresButton.id = "highScoresButton";
        highScoresButton.style.position = "absolute";
        highScoresButton.style.top = "63%";
        highScoresButton.style.left = "58.5%";
        highScoresButton.style.transform = "translate(-50%, -50%)";
        highScoresButton.style.width = canvas.width / 10 + "px";;
        highScoresButton.style.height = canvas.height / 18 + "px";
        highScoresButton.style.cursor = "pointer";
        highScoresButton.addEventListener("click", () => {
            buttonClickSound.play();
            gameState = "highScores";
            drawDefaultBackground();
            highScores();
            startButton.parentNode.removeChild(startButton);
            highScoresButton.parentNode.removeChild(highScoresButton);
        });
        document.body.appendChild(highScoresButton);

        createMuteButton();

        drawStartBackground();
    };

    // game code
    const startShooterGame = (level) => {
        createMuteButton();
        gameState = "playing"; // Set gamestate as playing
        currentDifficulty = level;

        // Initialise player variables
        var playerImg = new Image();
        playerImg.src = 'defaultCursor.png';

        var gunImg = new Image();
        gunImg.src = 'gun-in-hand.png';

        var player = {
            x: canvas.width - 50, // Adjusted to be 50px away from the right edge
            y: canvas.height - 50, // Adjusted to be 50px away from the bottom edge
        };

        // Initialise mouse position
        var mouseX = 0;
        var mouseY = 0;

        // Add mouse move event listener to update mouse position
        canvas.addEventListener("mousemove", function (event) {
            mouseX = event.clientX - canvas.getBoundingClientRect().left;
            mouseY = event.clientY - canvas.getBoundingClientRect().top;

            // Update player position to reflect the mouse within the bottom right corner
            player.x = mouseX - 10;
            player.y = mouseY - 15;
        });

        // Initialise bullets array
        var bullets = [];
        const maxBullets = 5; // Maximum number of bullets allowed
        var bulletsLeft = maxBullets; // Number of bullets left
        var reloading = false; // Flag to track reloading state
        var waitForShot = false; // Flag to track shooting state

        // Add click event listener to shoot
        canvas.addEventListener("click", function () {
            if (bulletsLeft > 0 && !reloading && gameState === "playing" && !waitForShot) {
                playShootSound();
            
                shoot();
                bulletsLeft--; // Reduce the number of bullets left
                waitForShot = true;
                setTimeout(() => {
                    waitForShot = false;
                }, 300);
            }
        });

        function playShootSound() {
            shootSoundInstance.currentTime = 0;
            shootSoundInstance.play();
        }

        // Function to shoot
        function shoot() {
            totalShotsTaken++;
            const bulletStartX = canvas.width / 1.131313; // top left of the gun
            const bulletStartY = canvas.height / 1.240331;
            //const angleToMouse = Math.atan2(mouseY - bulletStartY, mouseX - bulletStartX);
            var bullet = {
                x: bulletStartX,
                y: bulletStartY,
                width: canvas.width / 60.666666,
                height: canvas.height / 37.416666,
                speed: Math.max(0, Math.min(getSmallerCanvasSide() / 20, 150)), //Clamp the speed of the bullet between 0 and 100
                angle: Math.atan2(mouseY - (canvas.height / 1.240331), mouseX - (canvas.width / 1.131313)) // Calculate angle towards mouse position
            };
            bullets.push(bullet);
        }

        // Function to reload
        function reload() {
            if (!reloading && bulletsLeft < maxBullets) {
                reloads++;
                reloading = true;
                reloadSound.play()
                setTimeout(() => {
                    bulletsLeft = maxBullets;
                    reloading = false;
                }, 1000); // One-second delay for reloading
            }
        }

        // Keydown event listener for reloading
        document.addEventListener("keydown", function (event) {
            if (event.key.toUpperCase() === "R") {
                reload();
            }
        });

        // Initialise targets array
        var targets = [];
        var possibleTargets = new Array(); // Holds all targets that can be chosen

        // Read all targets and push them into the array
        const target1 = new Image(); target1.src = "target1.png";
        const target2 = new Image(); target2.src = "target2.png";
        const target3 = new Image(); target3.src = "target3.png";
        possibleTargets.push(target1);
        possibleTargets.push(target2);
        possibleTargets.push(target3);

        // Function to add new targets with varied movements based on level
        function addNewTargets() {

            // Adjust target movement and speed based on level
            let targetSpeed = 5;
            let numTargets = 7;
            if (level == "medium") {
                targetSpeed = 7;
                numTargets = 5;
            } else if (level == "hard") {
                targetSpeed = 9;
                numTargets = 3;
            }

            for (let i = 0; i < numTargets; i++) {

                const randomProbability = Math.random();
                let ranTarget;
                if (randomProbability < 0.5) { // 50% probability for target1
                    ranTarget = target1;
                } else if (randomProbability < 0.75) { // 25% probability for target 2
                    ranTarget = target2;
                } else { // 25% probability for target 3
                    ranTarget = target3;
                }

                let scoreAmount = 0;
                let randomAmplitudeY = 0;
                let freqY = 0;
                if (ranTarget === target1) {
                    scoreAmount = 10;
                    randomAmplitudeY = Math.random() * 250;
                    freqY = 0.015;
                } else if (ranTarget === target2) {
                    scoreAmount = 30;
                    randomAmplitudeY = Math.random() * 325;
                    if (randomAmplitudeY > 200) { //Slow down the target if it has a higher amplitude.
                        freqY = 0.01;
                    } else if (randomAmplitudeY > 150) {
                        freqY = 0.02;
                    } else {
                        freqY = 0.03;
                    }
                } else if (ranTarget === target3) {
                    scoreAmount = 50;
                    randomAmplitudeY = Math.random() * 395;
                    if (randomAmplitudeY > 200) {
                        { //Slow down the target if it has a higher amplitude.
                            freqY = 0.01;
                        }
                    } else if (randomAmplitudeY > 150) {
                        freqY = 0.02;
                    } else {
                        freqY = 0.03;
                    }
                }

                const targetX = Math.random() * (canvas.width - 155);
                const targetY = Math.random() * (canvas.height - 60);

                targets.push({
                    x: targetX,
                    y: targetY,
                    width: 0, //set inside of target updates
                    height: 0, //set inside of target updates
                    speedX: targetSpeed,
                    amplitudeY: randomAmplitudeY,
                    frequencyY: freqY,
                    direction: 1,
                    targetType: ranTarget,
                    score: scoreAmount
                });
            }
        }

        addNewTargets();

        let showReloadMessage = false; // Tracks whether the reload message is currently visible
        let reloadMessageFlashInterval = 0; // Counter to control flashing speed

        function handleTargets() {
            for (var i = 0; i < targets.length; i++) {

                // Calculate the target width and height in update to ensure it updates when player resizes
                let targetWidth = canvas.width / 9.706666;
                let targetHeight = canvas.height / 5.986666;
                if (level == "medium") {
                    targetWidth = canvas.width / 11.648;
                    targetHeight = canvas.height / 7.184;
                } else if (level == "hard") {
                    targetWidth = canvas.width / 13.236363;
                    targetHeight = canvas.height / 8.163636;
                }

                var target = targets[i];

                if (target.targetType === target3) {
                    targetWidth += 30;
                }

                //set the target's width and height
                target.width = targetWidth;
                target.height = targetHeight;

                target.x += target.speedX * target.direction;
                target.y = canvas.height - (Math.sin(target.x * target.frequencyY) * target.amplitudeY); // Calculate y position for wave motion

                // Reverse direction if target reaches canvas edges
                if (target.x <= 0 || target.x + target.width >= canvas.width) {
                    target.direction *= -1;
                }

                if (target.x - target.width > canvas.width) {
                    target.x = canvas.width / target.x + target.width;
                }

                ctx.drawImage(target.targetType, target.x, target.y / 2.55, target.width, target.height);
            }

            if (targets.length === 1) {
                addNewTargets();
            }
        }

        function handleCollisions() {
            let bulletsToRemove = [];
            let targetsToRemove = [];
            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                for (let j = 0; j < targets.length; j++) {
                    const target = targets[j];
                    if (bullet.x > target.x && bullet.x < target.x + target.width &&
                        bullet.y > target.y / 2.5 && bullet.y < target.y / 2.5 + target.height) {
                        // Collision detected, mark bullet and target for removal
                        bulletsToRemove.push(i);
                        targetsToRemove.push(j);
                        score += target.score; // Increase score on hit
                        targetsHit++; // Increase targets hit
                        combo++; // Increase the combo

                        // If combo is higher than the highest combo, set highest combo as combo.
                        if (combo > highestCombo) {
                            highestCombo = combo;
                        }

                        break; // Exit inner loop since bullet can only hit one target
                    }
                }
            }

            // Remove bullets and targets after collision detection loop
            for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
                bullets.splice(bulletsToRemove[i], 1);

                // If the combo is 4 or higher, start increasing bullets.
                if (combo >= 4) {
                    bulletsLeft++; // Increase the number of bullets left
                }
            }
            for (let i = targetsToRemove.length - 1; i >= 0; i--) {
                targets.splice(targetsToRemove[i], 1);
            }

        }

        const bulletImage = new Image();
        bulletImage.src = "bullet.png";

        function handleBullets() {
            // Update bullets
            for (var i = 0; i < bullets.length; i++) {
                var bullet = bullets[i];
                bullet.x += Math.cos(bullet.angle) * bullet.speed;
                bullet.y += Math.sin(bullet.angle) * bullet.speed;
                ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);

                // Remove bullets that go out of bounds
                if (
                    bullet.x < 0 ||
                    bullet.x > canvas.width ||
                    bullet.y < 0 ||
                    bullet.y > canvas.height
                ) {
                    bullets.splice(i, 1);
                    i--;
                    combo = 0;
                }
            }
        }

        function handleReloading() {
            // Draw number of bullets left
            if (!reloading) {
                createText("black", getSmallerCanvasSide() / 29.04 + "px Arial Bold", "center", "Bullets left: " + bulletsLeft, 120, 50);
            }
            if (reloading) {
                createText("black", "20px Arial", "center", "Reloading... ", 70, 30);
                // Reset the reload message status when reloading starts
                showReloadMessage = false;
            }

            // Check if reloading is needed
            if (bulletsLeft === 0 && !reloading) {
                reloadMessageFlashInterval++;
                if (reloadMessageFlashInterval >= 15) { // Adjust the value for slower flashing
                    showReloadMessage = !showReloadMessage; // Toggle reload message
                    reloadMessageFlashInterval = 0; // Reset the counter
                }
            }

            // Draw flashing reload message
            if (showReloadMessage) {
                createText("red", "30px Arial", "center", "Press R to Reload!", canvas.width / 2, canvas.height / 2);
            }

        }

        function handleGunRotation() {
            const dx = mouseX - (canvas.width / 1.114854); // X distance from gun center
            const dy = mouseY - (canvas.height / 1.192563); // Y distance from gun center
            let gunAngle = Math.atan2(dy, dx); // Angle between gun and mouse
            gunAngle += (Math.PI / 2) + 0.174533;

            ctx.save();
            // Translate and rotate the context to draw the rotated gunImg
            ctx.translate(canvas.width / 1.114854, canvas.height / 1.192563);
            ctx.rotate(gunAngle + 240);
            ctx.drawImage(gunImg, canvas.width / -9.706666, canvas.height / -8.552380, canvas.width / 4.853333, canvas.height / 4.276190); // Draw the gunImg at rotated position
            // Restore the canvas state
            ctx.restore();
        }

        // Function to update game state
        function update() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            drawGameplayBackground();

            // Draw player image
            ctx.drawImage(playerImg, player.x, player.y, canvas.width / 34.875, canvas.height / 22.45);

            handleBullets();

            handleCollisions();

            handleTargets();

            handleReloading();

            handleGunRotation();

            // Update score
            createText("black", "20px Arial", "center", "Score: " + score, canvas.width - 100, 30)

            // Update COMBO
            createText("black", "20px Arial", "center", "Combo: " + combo, canvas.width - 100, 60)
    
            // Update timer
            ctx.fillText("Time Left: " + Math.round(timeLeft / 60), canvas.width - 100, 90);
        }

        // Start the game loop
        const gameInterval = setInterval(() => {
            update();
            timeLeft--; // Decrease time left
            if (timeLeft <= 0) {
                gameState = "endGame";
                clearInterval(gameInterval); // Stop the game loop when time runs out
                endGame(); // End the game
                timeLeft = defaultTime;
            }
        }, 1000 / 60); // 60 frames per second

        // Hide cursor within the canvas
        canvas.style.cursor = "none";
    };

    function drawDisplayStats() {
        drawDefaultBackground();
        createText("black", getSmallerCanvasSide() / 16.04 + "px Arial", "center", "--Finish--", canvas.width / 2, canvas.height / 2.57306);
        createText("black", getSmallerCanvasSide() / 35 + "px Arial", "center", "Final Score: " + score, canvas.width / 2, canvas.height / 2.250626);
        createText("black", getSmallerCanvasSide() / 35 + "px Arial", "center", "Difficulty: " + currentDifficulty, canvas.width / 2, canvas.height / 2.045558);
        createText("black", getSmallerCanvasSide() / 35 + "px Arial", "center", "Total Shots Taken: " + totalShotsTaken, canvas.width / 2, canvas.height / 1.875949);
        createText("black", getSmallerCanvasSide() / 35 + "px Arial", "center", "Targets Hit: " + targetsHit, canvas.width / 2, canvas.height / 1.730250);
        createText("black", getSmallerCanvasSide() / 35 + "px Arial", "center", "Reloads: " + reloads, canvas.width / 2, canvas.height / 1.606440);
        createText("black", getSmallerCanvasSide() / 35 + "px Arial", "center", "Highest Combo: " + highestCombo, canvas.width / 2, canvas.height / 1.499165);

        const playAgainButton = new Image();
        playAgainButton.src = "PlayAgain.png";
        playAgainButton.style.position = "absolute";
        playAgainButton.style.top = canvas.height / 1.284692 + "px";
        playAgainButton.style.left = canvas.width / 2 + "px";
        playAgainButton.style.width = canvas.width / 6 + "px";
        playAgainButton.style.height = canvas.height / 13 + "px";
        playAgainButton.style.transform = "translate(-50%, -50%)";
        playAgainButton.style.cursor = "pointer";
        playAgainButton.addEventListener("click", () => {
            playAgainButton.parentNode.removeChild(playAgainButton);
            buttonClickSound.play();
            resetGame();
            gameState = "startMenu";
            displayStartMenu();
        });
        document.body.appendChild(playAgainButton);
    }

    function endGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Adds game session data 
        const gameSessionData = {
            playerName: playerName,
            score: score,
            totalShotsTaken: totalShotsTaken,
            targetsHit: targetsHit,
            reloads: reloads,
            highestCombo: highestCombo,
            difficulty: currentDifficulty
        };
        gameSessions.push(gameSessionData);

        // Display game stats
        drawDisplayStats();

        canvas.style.cursor = "auto"; // Restore cursor to normal
    }

    function resetGame() {
        totalShotsTaken = 0;
        startTime = Date.now();
        targetsHit = 0;
        reloads = 0;
        gameState = "startMenu";
        score = 0;
        timeLeft = defaultTime;
        bullets = [];
        targets = [];
        maxCombo = 0;
        combo = 0;
        deleteAllDomElements();
        canvas.style.cursor = "auto";
    }

    document.addEventListener("keydown", function (event) {
        if (gameState === "startMenu" && event.key === "Enter") {
            startGame();
        }
    });

    displayStartMenu();

    window.addEventListener("resize", resizeCanvas, false);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (gameState === "startMenu") {
            deleteAllDomElements();
            displayStartMenu();
        }
        else if (gameState === "highScores") {
            highScores();
        }
        else if (gameState === "selectLevel") {
            removeLevelButtons();
            selectLevel();
        }
        else if (gameState === "playing") {
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                ctx.drawImage(target.targetType, target.x, target.y - 600, target.width, target.height);
            }
        }
        else if (gameState === "endGame") {
            deleteAllDomElements();
            drawDisplayStats();
        }
    }
});

