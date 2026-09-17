    // ========================================
    // GALAXIAN - CLASSIC ARCADE
    // FINAL GAME.JS
    // ========================================

    // ========================================
    // 1. VARIABLES & DATA TYPES
    // ========================================

    const GAME_WIDTH = 500;
    const GAME_HEIGHT = 600;
    const PLAYER_SPEED = 4;

    let score = 0;
    let lives = 3;
    let wave = 1;
    let gameState = "START";

    // ========================================
    // 2. VARIABEL GLOBAL GAME
    // ========================================

    let player = null;
    let aliens = [];
    let playerBullets = [];
    let alienBullets = [];

    let diveTimer = 240;

    let levelMessage = "";
    let levelMessageTimer = 0;

    // ========================================
    // 3. FORMATION MOVEMENT
    // ========================================

    let formationOffsetX = 0;
    let formationOffsetY = 0;

    let formationVelocityX = 1.2;
    let formationTargetY = 0;

    const FORMATION_LEFT = -45;
    const FORMATION_RIGHT = 45;
    const FORMATION_DROP = 18;

    // ========================================
    // 4. INPUT STATE
    // ========================================

    const inputState = {
        left: false,
        right: false,
        fire: false
    };

    // ========================================
    // 5. ALIEN STATES
    // ========================================

    const ALIEN_STATES = {
        FORMATION: "FORMATION",
        DIVE_OUT: "DIVE_OUT",
        DIVE_ATTACK: "DIVE_ATTACK"
    };

    // ========================================
    // 6. AUDIO ENGINE
    // ===============================ME_hEI=========

    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;

            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }

        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    function playSound(
        frequency,
        type,
        duration,
        volume = 0.1
    ) {
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;

            osc.frequency.setValueAtTime(
                frequency,
                audioCtx.currentTime
            );

            gain.gain.setValueAtTime(
                volume,
                audioCtx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioCtx.currentTime + duration
            );

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(
                audioCtx.currentTime + duration
            );
        } catch (error) {
            console.log("Audio error:", error);
        }
    }

    // ========================================
    // 7. DOM
    // ========================================

    const scoreDisplay =
        document.getElementById("score-display");

    const waveDisplay =
        document.getElementById("wave-display");

    const hiDisplay =
        document.getElementById("hi-display");

    const livesDisplay =
        document.getElementById("lives-display");

    const startBtn =
        document.getElementById("start-btn");

    const overlay =
        document.getElementById("overlay");

    const overlayTitle =
        overlay.querySelector("h1");

    const overlaySubtitle =
        overlay.querySelector("h2");

    const overlayDescription =
        overlay.querySelector("p");

    // ========================================
    // 8. CANVAS
    // ========================================

    const canvas =
        document.getElementById("gameCanvas");

    const ctx =
        canvas.getContext("2d");

    // ========================================
    // 9. HIGH SCORE
    // ========================================

    let highScore =
        parseInt(
            localStorage.getItem("galaxian_hi")
        ) || 0;

    // ========================================
    // 10. UPDATE HUD
    // ========================================

    function updateHUD() {

        scoreDisplay.textContent =
            "SCORE: " +
            String(score).padStart(4, "0");

        waveDisplay.textContent =
            "WAVE: " + wave;

        hiDisplay.textContent =
            "HI: " +
            String(highScore).padStart(4, "0");

        livesDisplay.textContent =
            "♥ " + lives;
    }

    // ========================================
    // 11. SAVE HIGH SCORE
    // ========================================

    function saveHighScore() {

        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                "galaxian_hi",
                highScore.toString()
            );

            updateHUD();
        }
    }

    // ========================================
    // 12. WAVE SETTINGS
    // ========================================

    function getPlayerFireCooldown() {

        return Math.max(
            6,
            18 - (wave - 1) * 2
        );
    }

    function getPlayerBulletSpeed() {

        return (
            -7 -
            Math.min(
                5,
                (wave - 1) * 0.8
            )
        );
    }

    function getAlienDiveInterval() {

        return Math.max(
            60,
            240 - (wave - 1) * 20
        );
    }

    function getAlienDiveProgressSpeed() {

        return (
            0.012 +
            Math.min(
                0.012,
                (wave - 1) * 0.0015
            )
        );
    }

    function getAlienAttackAcceleration() {

        return (
            0.008 +
            Math.min(
                0.012,
                (wave - 1) * 0.0012
            )
        );
    }

    function getAlienMaxHorizontalSpeed() {

        return (
            3 +
            Math.min(
                3,
                (wave - 1) * 0.3
            )
        );
    }

    // ========================================
    // 13. START GAME
    // ========================================

    function startGame() {

        initAudio();

        initGame();

        gameState = "PLAYING";

        levelMessage = "";
        levelMessageTimer = 0;

        inputState.left = false;
        inputState.right = false;
        inputState.fire = false;

        overlay.classList.add("hidden");

        canvas.classList.add("game-visible");

        playSound(
            400 + wave * 30,
            "triangle",
            0.1,
            0.05
        );

        console.log("GAME START");
    }

    // ========================================
    // 14. START BUTTON
    // ========================================

    startBtn.addEventListener(
        "click",
        startGame
    );

    // ========================================
    // 15. START OVERLAY
    // ========================================

    function showStartOverlay() {

        overlayTitle.textContent =
            "GALAXIAN";

        overlaySubtitle.textContent =
            "CLASSIC ARCADE";

        overlayDescription.textContent =
            "Tembak alien sebelum mereka mencapai Anda!";

        startBtn.textContent =
            "START GAME";

        overlay.classList.remove(
            "hidden"
        );
    }

    // ========================================
    // 16. GAME OVER OVERLAY
    // ========================================

    function showGameOverOverlay() {

        overlayTitle.textContent =
            "GAME OVER";

        overlaySubtitle.textContent =
            "SCORE: " +
            String(score).padStart(4, "0");

        overlayDescription.textContent =
            "Kamu mencapai WAVE " +
            wave +
            ".";

        startBtn.textContent =
            "PLAY AGAIN";

        overlay.classList.remove(
            "hidden"
        );
    }

    // ========================================
    // 17. END GAME
    // ========================================

    function endGame(reason = "") {

        gameState = "GAMEOVER";

        inputState.left = false;
        inputState.right = false;
        inputState.fire = false;

        saveHighScore();

        playSound(
            80,
            "square",
            0.5,
            0.15
        );

        showGameOverOverlay();

        if (reason) {
            console.log(reason);
        }
    }

    // ========================================
    // 18. KEYBOARD INPUT
    // ========================================

    window.addEventListener(
        "keydown",
        function (e) {

            if (
                e.key === "ArrowLeft" ||
                e.key === "a" ||
                e.key === "A"
            ) {
                inputState.left = true;
            }

            if (
                e.key === "ArrowRight" ||
                e.key === "d" ||
                e.key === "D"
            ) {
                inputState.right = true;
            }

            if (
                e.key === " " ||
                e.code === "Space"
            ) {
                inputState.fire = true;
                initAudio();
            }

            if (
                [
                    "Space",
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight"
                ].includes(e.code)
            ) {
                e.preventDefault();
            }
        }
    );

    window.addEventListener(
        "keyup",
        function (e) {

            if (
                e.key === "ArrowLeft" ||
                e.key === "a" ||
                e.key === "A"
            ) {
                inputState.left = false;
            }

            if (
                e.key === "ArrowRight" ||
                e.key === "d" ||
                e.key === "D"
            ) {
                inputState.right = false;
            }

            if (
                e.key === " " ||
                e.code === "Space"
            ) {
                inputState.fire = false;
            }
        }
    );

    // ========================================
    // 19. TOUCH / MOUSE INPUT
    // ========================================

    function setupTouchButton(
        buttonId,
        stateKey
    ) {

        const btn =
            document.getElementById(buttonId);

        if (!btn) return;

        btn.addEventListener(
            "pointerdown",
            function (e) {

                e.preventDefault();

                inputState[stateKey] = true;

                btn.classList.add("active");

                initAudio();

                if (btn.setPointerCapture) {
                    btn.setPointerCapture(
                        e.pointerId
                    );
                }
            }
        );

        btn.addEventListener(
            "pointerup",
            function (e) {

                e.preventDefault();

                inputState[stateKey] = false;

                btn.classList.remove("active");
            }
        );

        btn.addEventListener(
            "pointercancel",
            function (e) {

                e.preventDefault();

                inputState[stateKey] = false;

                btn.classList.remove("active");
            }
        );

        btn.addEventListener(
            "pointerleave",
            function () {

                if (stateKey !== "fire") {

                    inputState[stateKey] = false;

                    btn.classList.remove(
                        "active"
                    );
                }
            }
        );
    }

    setupTouchButton(
        "btn-left",
        "left"
    );

    setupTouchButton(
        "btn-right",
        "right"
    );

    setupTouchButton(
        "btn-fire",
        "fire"
    );

    // ========================================
    // 20. CLASS BULLET
    // ========================================

    class Bullet {

        constructor(
            x,
            y,
            speed,
            color
        ) {

            this.x = x;
            this.y = y;

            this.speed = speed;
            this.color = color;

            this.width = 4;
            this.height = 10;

            this.active = true;
        }

        update() {

            this.y += this.speed;

            if (
                this.y < -30 ||
                this.y > GAME_HEIGHT + 30
            ) {
                this.active = false;
            }
        }

        draw(ctx) {

            if (!this.active) {
                return;
            }

            const bulletHeight =
                Math.max(
                    10,
                    Math.min(
                        16,
                        Math.abs(
                            this.speed
                        ) * 1.4
                    )
                );

            ctx.save();

            // Glow
            ctx.shadowColor =
                this.color;

            ctx.shadowBlur = 10;

            ctx.fillStyle =
                this.color;

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                bulletHeight
            );

            // Inti
            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "#ffffff";

            ctx.fillRect(
                this.x + 1,
                this.y,
                2,
                bulletHeight
            );

            ctx.restore();
        }
    }

    // ========================================
    // 21. UPDATE FORMATION
    // ========================================

    function updateFormation() {

        const formationSpeed =
            1.2 +
            Math.min(
                1.8,
                (wave - 1) * 0.15
            );

        formationVelocityX =
            formationVelocityX > 0
                ? formationSpeed
                : -formationSpeed;

        formationOffsetX +=
            formationVelocityX;

        if (
            formationOffsetX >=
            FORMATION_RIGHT
        ) {

            formationOffsetX =
                FORMATION_RIGHT;

            formationVelocityX =
                -formationSpeed;

            formationTargetY +=
                FORMATION_DROP;
        }

        if (
            formationOffsetX <=
            FORMATION_LEFT
        ) {

            formationOffsetX =
                FORMATION_LEFT;

            formationVelocityX =
                formationSpeed;

            formationTargetY +=
                FORMATION_DROP;
        }

        formationOffsetY +=
            (
                formationTargetY -
                formationOffsetY
            ) * 0.04;

        if (
            formationOffsetY > 300
        ) {

            formationOffsetY = 300;
            formationTargetY = 300;
        }
    }

    // ========================================
    // 22. CLASS ALIEN
    // ========================================

    class Alien {

        constructor(
            homeX,
            homeY,
            type,
            row,
            col
        ) {

            this.homeX = homeX;
            this.homeY = homeY;

            this.x = homeX;
            this.y = homeY;

            this.width = 40;
            this.height = 30;

            this.type = type;

            this.row = row;
            this.col = col;

            this.alive = true;

            this.state =
                ALIEN_STATES.FORMATION;

            this.diveProgress = 0;

            this.startX = homeX;
            this.startY = homeY;

            this.hasShot = false;

            this.targetX = homeX;

            this.diveSpeedX = 0;
            this.diveSpeedY = 0;
        }

        // ========================================
        // UPDATE ALIEN
        // ========================================

        update() {

            if (!this.alive) {
                return;
            }

            if (
                this.state ===
                ALIEN_STATES.FORMATION
            ) {

                this.x =
                    this.homeX +
                    formationOffsetX;

                this.y =
                    this.homeY +
                    formationOffsetY;

            } else if (
                this.state ===
                ALIEN_STATES.DIVE_OUT ||

                this.state ===
                ALIEN_STATES.DIVE_ATTACK
            ) {

                this.updateDive();
            }
        }

        // ========================================
        // UPDATE DIVE
        // ========================================

        updateDive() {

            // ====================================
            // DIVE OUT
            // ====================================

            if (
                this.state ===
                ALIEN_STATES.DIVE_OUT
            ) {

                this.diveProgress +=
                    getAlienDiveProgressSpeed();

                const t =
                    Math.min(
                        this.diveProgress,
                        1
                    );

                const playerCenter =
                    player.x +
                    player.width / 2;

                this.targetX =
                    playerCenter -
                    this.width / 2;

                const startX =
                    this.startX;

                const startY =
                    this.startY;

                const midX =
                    (startX + this.targetX) / 2;

                const midY =
                    startY + 90;

                const endY =
                    startY + 150;

                const oneMinusT =
                    1 - t;

                this.x =
                    oneMinusT *
                        oneMinusT *
                        startX +

                    2 *
                        oneMinusT *
                        t *
                        midX +

                    t *
                        t *
                        this.targetX;

                this.y =
                    oneMinusT *
                        oneMinusT *
                        startY +

                    2 *
                        oneMinusT *
                        t *
                        midY +

                    t *
                        t *
                        endY;

                if (t >= 1) {

                    this.state =
                        ALIEN_STATES.DIVE_ATTACK;

                    this.diveProgress = 0;

                    this.diveSpeedX = 0;

                    this.diveSpeedY = 1;

                    this.hasShot = false;
                }

                return;
            }

            // ====================================
            // DIVE ATTACK
            // ====================================

            if (
                this.state ===
                ALIEN_STATES.DIVE_ATTACK
            ) {

                const playerCenter =
                    player.x +
                    player.width / 2;

                const targetX =
                    playerCenter -
                    this.width / 2;

                const differenceX =
                    targetX - this.x;

                // Auto aim horizontal
                this.diveSpeedX +=
                    differenceX *
                    getAlienAttackAcceleration();

                const maxSpeed =
                    getAlienMaxHorizontalSpeed();

                if (
                    this.diveSpeedX >
                    maxSpeed
                ) {

                    this.diveSpeedX =
                        maxSpeed;
                }

                if (
                    this.diveSpeedX <
                    -maxSpeed
                ) {

                    this.diveSpeedX =
                        -maxSpeed;
                }

                this.x +=
                    this.diveSpeedX;

                // Turun
                this.diveSpeedY +=
                    0.018;

                if (
                    this.diveSpeedY >
                    5.2
                ) {

                    this.diveSpeedY =
                        5.2;
                }

                this.y +=
                    this.diveSpeedY;

                // Batas kiri
                if (this.x < 0) {

                    this.x = 0;
                    this.diveSpeedX = 0;
                }

                // Batas kanan
                if (
                    this.x >
                    GAME_WIDTH -
                    this.width
                ) {

                    this.x =
                        GAME_WIDTH -
                        this.width;

                    this.diveSpeedX = 0;
                }

                // =================================
                // ALIEN MENEMBAK
                // =================================

                if (
                    !this.hasShot &&
                    this.y > 280
                ) {

                    alienBullets.push(
                        new Bullet(
                            this.x +
                                this.width / 2 -
                                2,

                            this.y +
                                this.height,

                            5 +
                                Math.min(
                                    2,
                                    (wave - 1) *
                                        0.25
                                ),

                            "#ff0055"
                        )
                    );

                    playSound(
                        300 + wave * 20,
                        "square",
                        0.1,
                        0.04
                    );

                    this.hasShot = true;
                }

                // =================================
                // ALIEN SAMPAI BAWAH
                // =================================

            if (this.y + this.height >= GAME_HEIGHT) {
        this.alive = false;
        this.state = null;

        // Hilangkan alien dari layar
        this.x = -1000;
        this.y = -1000;

        console.log("Alien mencapai bagian bawah!");

        // Langsung GAME OVER
        endGame("GAME OVER - Alien mencapai bawah");
        return;
    }
            }
        }

        // ========================================
        // DRAW ALIEN
        // ========================================

        draw(ctx) {

            if (
                !ctx ||
                !this.alive
            ) {
                return;
            }

            ctx.save();

            const time =
                performance.now();

            // ====================================
            // HOVER
            // ====================================

            let hoverOffset = 0;

            if (
                this.state ===
                ALIEN_STATES.FORMATION
            ) {

                hoverOffset =
                    Math.sin(
                        time * 0.004 +
                        this.col * 0.7
                    ) * 2;
            }

            // ====================================
            // ROTATION
            // ====================================

            let rotation = 0;

            if (
                this.state !==
                ALIEN_STATES.FORMATION
            ) {

                rotation =
                    Math.max(
                        -0.35,
                        Math.min(
                            0.35,
                            this.diveSpeedX *
                                0.08
                        )
                    );
            }

            // ====================================
            // POSISI
            // ====================================

            ctx.translate(
                this.x +
                    this.width / 2,

                this.y +
                    this.height / 2 +
                    hoverOffset
            );

            ctx.rotate(rotation);

            // ====================================
            // WARNA
            // ====================================

            const colors = [
                "#ff0055",
                "#00ffff",
                "#00ff00"
            ];

            const color =
                colors[this.type] ||
                "#ffffff";

            // ====================================
            // GLOW
            // ====================================

            const glow =
                7 +
                Math.sin(
                    time * 0.008 +
                    this.row
                ) * 4;

            ctx.fillStyle =
                color;

            ctx.shadowBlur =
                glow;

            ctx.shadowColor =
                color;

            // ====================================
            // ANTENNA
            // ====================================

            ctx.fillRect(
                -2,
                -10,
                4,
                5
            );

            ctx.beginPath();

            ctx.arc(
                0,
                -11,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();

            // ====================================
            // UPPER BODY
            // ====================================

            ctx.fillRect(
                -11,
                -7,
                22,
                5
            );

            // ====================================
            // MAIN BODY
            // ====================================

            ctx.fillRect(
                -15,
                -2,
                30,
                11
            );

            // ====================================
            // LEFT WING
            // ====================================

            ctx.fillRect(
                -20,
                3,
                6,
                7
            );

            // ====================================
            // RIGHT WING
            // ====================================

            ctx.fillRect(
                14,
                3,
                6,
                7
            );

            // ====================================
            // BOTTOM BODY
            // ====================================

            ctx.fillRect(
                -9,
                9,
                18,
                5
            );

            // ====================================
            // MATA
            // ====================================

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "#111111";

            ctx.fillRect(
                -8,
                1,
                4,
                4
            );

            ctx.fillRect(
                4,
                1,
                4,
                4
            );

            // ====================================
            // MATA BERKEDIP
            // ====================================

            if (
                Math.sin(
                    time * 0.006 +
                    this.col
                ) > 0.92
            ) {

                ctx.fillStyle =
                    "#ffffff";

                ctx.fillRect(
                    -8,
                    1,
                    4,
                    4
                );

                ctx.fillRect(
                    4,
                    1,
                    4,
                    4
                );
            }

            // ====================================
            // EFFECT SERANGAN
            // ====================================

            if (
                this.state !==
                ALIEN_STATES.FORMATION
            ) {

                ctx.fillStyle =
                    "#ffffff";

                ctx.globalAlpha =
                    0.15 +
                    Math.sin(
                        time * 0.02
                    ) * 0.1;

                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    20 +
                        Math.sin(
                            time * 0.01
                        ) * 2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.globalAlpha = 1;
            }

            ctx.restore();
        }
    }

    // ========================================
    // 23. TRIGGER ALIEN DIVE
    // ========================================

    function triggerAlienDive() {

        diveTimer--;

        if (diveTimer <= 0) {

            const candidates =
                aliens.filter(
                    function (alien) {

                        return (
                            alien.alive &&
                            alien.state ===
                                ALIEN_STATES.FORMATION
                        );
                    }
                );

            if (
                candidates.length > 0
            ) {

                const randomAlien =
                    candidates[
                        Math.floor(
                            Math.random() *
                                candidates.length
                        )
                    ];

                randomAlien.state =
                    ALIEN_STATES.DIVE_OUT;

                randomAlien.diveProgress = 0;

                randomAlien.startX =
                    randomAlien.x;

                randomAlien.startY =
                    randomAlien.y;

                randomAlien.targetX =
                    player.x +
                    player.width / 2 -
                    randomAlien.width / 2;

                randomAlien.hasShot = false;

                randomAlien.diveSpeedX = 0;

                randomAlien.diveSpeedY = 1;

                diveTimer =
                    getAlienDiveInterval();
            } else {

                diveTimer = 60;
            }
        }
    }

    // ========================================
    // 24. CLASS PLAYER
    // ========================================

    class Player {

        constructor() {

            this.width = 40;
            this.height = 24;

            this.x =
                (GAME_WIDTH -
                    this.width) / 2;

            this.y =
                GAME_HEIGHT - 60;

            this.speed =
                PLAYER_SPEED;

            this.cooldown = 0;

            this.invincible = 0;
        }

        // ========================================
        // UPDATE PLAYER
        // ========================================

        update(inputState) {

            if (
                inputState.left &&
                this.x > 0
            ) {

                this.x -=
                    this.speed;
            }

            if (
                inputState.right &&
                this.x <
                    GAME_WIDTH -
                        this.width
            ) {

                this.x +=
                    this.speed;
            }

            if (
                this.cooldown > 0
            ) {

                this.cooldown--;
            }

            if (
                this.invincible > 0
            ) {

                this.invincible--;
            }
        }

        // ========================================
        // DRAW PLAYER
        // ========================================

        draw(ctx) {

            if (!ctx) {
                return;
            }

            if (
                this.invincible > 0 &&
                Math.floor(
                    this.invincible / 4
                ) % 2 === 0
            ) {

                return;
            }

            const time =
                performance.now();

            // Hover
            const hover =
                Math.sin(
                    time * 0.005
                ) * 1.5;

            // Tilt
            let tilt = 0;

            if (inputState.left) {
                tilt = -0.08;
            }

            if (inputState.right) {
                tilt = 0.08;
            }

            const centerX =
                this.x +
                this.width / 2;

            const centerY =
                this.y +
                this.height / 2 +
                hover;

            ctx.save();

            // Posisi
            ctx.translate(
                centerX,
                centerY
            );

            ctx.rotate(tilt);

            // ====================================
            // GLOW
            // ====================================

            ctx.shadowColor =
                "#ffffff";

            ctx.shadowBlur = 8;

            // ====================================
            // BADAN PESAWAT
            // ====================================

            ctx.fillStyle =
                "#ffffff";

            ctx.beginPath();

            ctx.moveTo(
                0,
                -12
            );

            ctx.lineTo(
                15,
                7
            );

            ctx.lineTo(
                8,
                8
            );

            ctx.lineTo(
                0,
                4
            );

            ctx.lineTo(
                -8,
                8
            );

            ctx.lineTo(
                -15,
                7
            );

            ctx.closePath();

            ctx.fill();

            // ====================================
            // COCKPIT
            // ====================================

            ctx.shadowBlur = 5;

            ctx.fillStyle =
                "#00ffff";

            ctx.beginPath();

            ctx.moveTo(
                0,
                -7
            );

            ctx.lineTo(
                4,
                3
            );

            ctx.lineTo(
                -4,
                3
            );

            ctx.closePath();

            ctx.fill();

            // ====================================
            // SAYAP KIRI
            // ====================================

            ctx.fillStyle =
                "#ff4fa3";

            ctx.beginPath();

            ctx.moveTo(
                -7,
                1
            );

            ctx.lineTo(
                -20,
                10
            );

            ctx.lineTo(
                -5,
                7
            );

            ctx.closePath();

            ctx.fill();

            // ====================================
            // SAYAP KANAN
            // ====================================

            ctx.beginPath();

            ctx.moveTo(
                7,
                1
            );

            ctx.lineTo(
                20,
                10
            );

            ctx.lineTo(
                5,
                7
            );

            ctx.closePath();

            ctx.fill();

            // ====================================
            // API MESIN
            // ====================================

            const flameSize =
                5 +
                Math.sin(
                    time * 0.025
                ) * 3;

            // Outer flame
            ctx.shadowColor =
                "#ff2f7d";

            ctx.shadowBlur = 12;

            ctx.fillStyle =
                "#ff2f7d";

            ctx.beginPath();

            ctx.moveTo(
                -4,
                7
            );

            ctx.lineTo(
                0,
                7 + flameSize
            );

            ctx.lineTo(
                4,
                7
            );

            ctx.closePath();

            ctx.fill();

            // Inner flame
            ctx.shadowBlur = 5;

            ctx.fillStyle =
                "#ffffff";

            ctx.beginPath();

            ctx.moveTo(
                -2,
                7
            );

            ctx.lineTo(
                0,
                7 +
                    flameSize *
                        0.6
            );

            ctx.lineTo(
                2,
                7
            );

            ctx.closePath();

            ctx.fill();

            ctx.restore();
        }

        // ========================================
        // SHOOT
        // ========================================

        shoot(playerBullets) {

            if (
                this.cooldown === 0
            ) {

                playerBullets.push(
                    new Bullet(
                        this.x +
                            this.width / 2 -
                            2,

                        this.y - 12,

                        getPlayerBulletSpeed(),

                        "#ffffff"
                    )
                );

                this.cooldown =
                    getPlayerFireCooldown();

                playSound(
                    800 + wave * 40,
                    "square",
                    0.08,
                    0.05
                );
            }
        }
    }

    // ========================================
    // 25. UPDATE BULLETS
    // ========================================

    function updateBullets(
        bullets
    ) {

        for (
            let i =
                bullets.length - 1;
            i >= 0;
            i--
        ) {

            const bullet =
                bullets[i];

            bullet.update();

            if (
                !bullet.active
            ) {

                bullets.splice(
                    i,
                    1
                );
            }
        }
    }

    // ========================================
    // 26. DRAW BULLETS
    // ========================================

    function drawBullets(
        bullets
    ) {

        bullets.forEach(
            function (bullet) {

                bullet.draw(ctx);
            }
        );
    }

    // ========================================
    // 27. COLLISION DETECTION
    // ========================================

    function isColliding(
        rect1,
        rect2
    ) {

        return (
            rect1.x <
                rect2.x +
                    rect2.width &&

            rect1.x +
                rect1.width >
                rect2.x &&

            rect1.y <
                rect2.y +
                    rect2.height &&

            rect1.y +
                rect1.height >
                rect2.y
        );
    }

    // ========================================
    // 28. CHECK COLLISIONS
    // ========================================

    function checkCollisions() {

        // ====================================
        // PLAYER BULLET VS ALIEN
        // ====================================

        for (
            let i =
                playerBullets.length - 1;
            i >= 0;
            i--
        ) {

            const bullet =
                playerBullets[i];

            for (
                let j =
                    aliens.length - 1;
                j >= 0;
                j--
            ) {

                const alien =
                    aliens[j];

                if (
                    alien.alive &&
                    bullet.active &&
                    isColliding(
                        bullet,
                        alien
                    )
                ) {

                    // Alien mati
                    alien.alive = false;

                    // Hapus state
                    alien.state = null;

                    // Hapus bullet
                    bullet.active = false;

                    // Tambah score
                    score += 100;

                    playSound(
                        150,
                        "sawtooth",
                        0.2,
                        0.1
                    );

                    updateHUD();

                    break;
                }
            }
        }

        // ====================================
        // ALIEN BULLET VS PLAYER
        // ====================================

        if (
            player.invincible <= 0
        ) {

            for (
                let i =
                    alienBullets.length - 1;
                i >= 0;
                i--
            ) {

                const bullet =
                    alienBullets[i];

                if (
                    bullet.active &&
                    isColliding(
                        bullet,
                        player
                    )
                ) {

                    bullet.active =
                        false;

                    playerHit();

                    break;
                }
            }

            // =================================
            // ALIEN VS PLAYER
            // =================================

            for (
                const alien of aliens
            ) {

                if (
                    alien.alive &&
                    isColliding(
                        alien,
                        player
                    )
                ) {

                    alien.alive =
                        false;

                    alien.state = null;

                    playerHit();

                    break;
                }
            }
        }
    }

    // ========================================
    // 29. PLAYER HIT
    // ========================================

    function playerHit() {

        lives--;

        updateHUD();

        if (
            lives <= 0
        ) {

            endGame(
                "GAME OVER - Nyawa habis"
            );

        } else {

            player.invincible = 120;
        }
    }

    // ========================================
    // 30. CEK LEVEL SELESAI
    // ========================================

    function checkLevelComplete() {

        if (
            gameState !==
            "PLAYING"
        ) {
            return;
        }

        const remainingAliens =
            aliens.some(
                function (alien) {

                    return alien.alive;
                }
            );

        if (
            aliens.length > 0 &&
            !remainingAliens
        ) {

            nextWave();
        }
    }

    // ========================================
    // 31. NEXT WAVE
    // ========================================

    function nextWave() {

        wave++;

        levelMessage =
            "LEVEL " + wave;

        levelMessageTimer = 120;

        formationOffsetX = 0;
        formationOffsetY = 0;

        formationVelocityX =
            1.2 +
            Math.min(
                1.8,
                (wave - 1) * 0.15
            );

        formationTargetY = 0;

        diveTimer =
            getAlienDiveInterval();

        playerBullets = [];
        alienBullets = [];

        if (player) {
            player.cooldown = 0;
        }

        createAliens();

        updateHUD();

        playSound(
            500 + wave * 40,
            "triangle",
            0.15,
            0.08
        );

        setTimeout(
            function () {

                if (
                    gameState ===
                    "PLAYING"
                ) {

                    playSound(
                        700 + wave * 40,
                        "triangle",
                        0.18,
                        0.08
                    );
                }
            },
            120
        );
    }

    // ========================================
    // 32. LEVEL MESSAGE
    // ========================================

    function drawLevelMessage() {

        if (
            levelMessageTimer <= 0
        ) {
            return;
        }

        ctx.save();

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.font =
            "bold 42px Courier New";

        ctx.shadowColor =
            "#ff4fa3";

        ctx.shadowBlur = 20;

        ctx.fillStyle =
            "#ffffff";

        ctx.fillText(
            levelMessage,
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2
        );

        ctx.shadowBlur = 0;

        ctx.font =
            "bold 14px Courier New";

        ctx.fillStyle =
            "#c77dff";

        ctx.fillText(
            "GET READY!",
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 + 48
        );

        ctx.restore();
    }

    // ========================================
    // 33. BACKGROUND STARS
    // ========================================

    const stars = [];

    const NUM_STARS = 60;

    function initStars() {

        stars.length = 0;

        for (
            let i = 0;
            i < NUM_STARS;
            i++
        ) {

            stars.push({

                x:
                    Math.random() *
                    GAME_WIDTH,

                y:
                    Math.random() *
                    GAME_HEIGHT,

                speed:
                    Math.random() *
                        0.8 +
                    0.2,

                size:
                    Math.random() *
                        2 +
                    1
            });
        }
    }

    function updateStars() {

        for (
            const star of stars
        ) {

            star.y +=
                star.speed;

            if (
                star.y >
                GAME_HEIGHT
            ) {

                star.y = 0;

                star.x =
                    Math.random() *
                    GAME_WIDTH;
            }
        }
    }

    function drawStars() {

        ctx.fillStyle =
            "#ffffff";

        for (
            const star of stars
        ) {

            ctx.globalAlpha =
                0.5 +
                star.speed * 0.3;

            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );
        }

        ctx.globalAlpha = 1;
    }

    // ========================================
    // 34. CREATE ALIENS
    // ========================================

    function createAliens() {

        aliens = [];

        const pattern =
            ((wave - 1) % 5) + 1;

        // ====================================
        // FORMASI 1 - CLASSIC
        // ====================================

        if (
            pattern === 1
        ) {

            for (
                let r = 0;
                r < 5;
                r++
            ) {

                for (
                    let c = 0;
                    c < 8;
                    c++
                ) {

                    const type =
                        r === 0
                            ? 0
                            : r < 3
                            ? 1
                            : 2;

                    const x =
                        70 + c * 45;

                    const y =
                        60 + r * 40;

                    aliens.push(
                        new Alien(
                            x,
                            y,
                            type,
                            r,
                            c
                        )
                    );
                }
            }
        }

        // ====================================
        // FORMASI 2 - STAGGERED
        // ====================================

        else if (
            pattern === 2
        ) {

            for (
                let r = 0;
                r < 5;
                r++
            ) {

                for (
                    let c = 0;
                    c < 8;
                    c++
                ) {

                    const type =
                        r === 0
                            ? 0
                            : r < 3
                            ? 1
                            : 2;

                    const rowOffset =
                        r % 2 === 0
                            ? 0
                            : 22;

                    const x =
                        48 +
                        c * 48 +
                        rowOffset;

                    const y =
                        55 + r * 42;

                    aliens.push(
                        new Alien(
                            x,
                            y,
                            type,
                            r,
                            c
                        )
                    );
                }
            }
        }

        // ====================================
        // FORMASI 3 - V SHAPE
        // ====================================

        else if (
            pattern === 3
        ) {

            for (
                let r = 0;
                r < 5;
                r++
            ) {

                for (
                    let c = 0;
                    c < 8;
                    c++
                ) {

                    const type =
                        r === 0
                            ? 0
                            : r < 3
                            ? 1
                            : 2;

                    const distance =
                        Math.abs(
                            c - 3.5
                        );

                    const x =
                        70 + c * 45;

                    const y =
                        55 +
                        r * 40 +
                        distance * 4;

                    aliens.push(
                        new Alien(
                            x,
                            y,
                            type,
                            r,
                            c
                        )
                    );
                }
            }
        }

        // ====================================
        // FORMASI 4 - ZIGZAG
        // ====================================

        else if (
            pattern === 4
        ) {

            for (
                let r = 0;
                r < 5;
                r++
            ) {

                for (
                    let c = 0;
                    c < 8;
                    c++
                ) {

                    const type =
                        r === 0
                            ? 0
                            : r < 3
                            ? 1
                            : 2;

                    const rowOffset =
                        r % 2 === 0
                            ? 15
                            : -15;

                    const x =
                        55 +
                        c * 48 +
                        rowOffset;

                    const y =
                        50 + r * 43;

                    aliens.push(
                        new Alien(
                            x,
                            y,
                            type,
                            r,
                            c
                        )
                    );
                }
            }
        }

        // ====================================
        // FORMASI 5 - DIAMOND
        // ====================================

        else {

            const rowCounts =
                [6, 8, 10, 8, 6];

            for (
                let r = 0;
                r <
                rowCounts.length;
                r++
            ) {

                const count =
                    rowCounts[r];

                const spacing = 42;

                const totalWidth =
                    (count - 1) *
                    spacing;

                const startX =
                    (GAME_WIDTH -
                        totalWidth) / 2;

                for (
                    let c = 0;
                    c < count;
                    c++
                ) {

                    const type =
                        r === 0
                            ? 0
                            : r < 3
                            ? 1
                            : 2;

                    const x =
                        startX +
                        c * spacing;

                    const y =
                        50 + r * 44;

                    aliens.push(
                        new Alien(
                            x,
                            y,
                            type,
                            r,
                            c
                        )
                    );
                }
            }
        }

        console.log(
            "Wave:",
            wave,
            "Alien:",
            aliens.length
        );
    }

    // ========================================
    // 35. INITIALIZE GAME
    // ========================================

    function initGame() {

        player =
            new Player();

        playerBullets = [];
        alienBullets = [];

        score = 0;
        lives = 3;
        wave = 1;

        diveTimer = 240;

        levelMessage = "";
        levelMessageTimer = 0;

        formationOffsetX = 0;
        formationOffsetY = 0;

        formationVelocityX = 1.2;

        formationTargetY = 0;

        createAliens();

        updateHUD();
    }

    // ========================================
    // 36. START SCREEN
    // ========================================

    function drawStartScreen() {
        // Overlay HTML digunakan
    }

    // ========================================
    // 37. GAME OVER SCREEN
    // ========================================

    function drawGameOverScreen() {
        // Overlay HTML digunakan
    }

    // ========================================
    // 38. GAME LOOP
    // ========================================

    function gameLoop() {

        ctx.clearRect(
            0,
            0,
            GAME_WIDTH,
            GAME_HEIGHT
        );

        // ====================================
        // BACKGROUND
        // ====================================

        updateStars();
        drawStars();

        // ====================================
        // PLAYING
        // ====================================

        if (
            gameState ===
            "PLAYING"
        ) {

            if (!player) {
                player = new Player();
            }

            // Player
            player.update(
                inputState
            );

            // Formation
            updateFormation();

            // Alien dive
            triggerAlienDive();

            // Update alien
            aliens.forEach(
                function (alien) {

                    alien.update();
                }
            );

            // =================================
            // Jika alien mencapai bawah
            // =================================

            if (
                gameState !==
                "PLAYING"
            ) {

                requestAnimationFrame(
                    gameLoop
                );

                return;
            }

            // =================================
            // FIRE
            // =================================

            if (
                inputState.fire
            ) {

                player.shoot(
                    playerBullets
                );
            }

            // =================================
            // BULLETS
            // =================================

            updateBullets(
                playerBullets
            );

            updateBullets(
                alienBullets
            );

            // =================================
            // COLLISIONS
            // =================================

            checkCollisions();

            // =================================
            // Jika GAME OVER
            // =================================

            if (
                gameState !==
                "PLAYING"
            ) {

                requestAnimationFrame(
                    gameLoop
                );

                return;
            }

            // =================================
            // LEVEL COMPLETE
            // =================================

            checkLevelComplete();

            // =================================
            // DRAW PLAYER
            // =================================

            if (player) {
                player.draw(ctx);
            }

            // =================================
            // DRAW ALIENS
            // =================================

            aliens.forEach(
                function (alien) {

                    if (
                        alien.alive
                    ) {

                        alien.draw(ctx);
                    }
                }
            );

            // =================================
            // DRAW BULLETS
            // =================================

            drawBullets(
                playerBullets
            );

            drawBullets(
                alienBullets
            );

            // =================================
            // LEVEL MESSAGE
            // =================================

            if (
                levelMessageTimer > 0
            ) {

                drawLevelMessage();

                levelMessageTimer--;
            }
        }

        requestAnimationFrame(
            gameLoop
        );
    }

    // ========================================
    // 39. START EVERYTHING
    // ========================================

    initStars();

    initGame();

    showStartOverlay();

    canvas.classList.remove(
        "game-visible"
    );

    requestAnimationFrame(
        gameLoop
    );