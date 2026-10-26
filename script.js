
"use strict";

/* =========================================
   SETTINGS
   ========================================= */

const SETTINGS = {
    passcode: "1234",
    birthdayName: "Birthday Star",
    question: "Are you ready for your surprise?",

    balloonMessages: [
        "You make ordinary days special.",
        "Wishing you endless happiness.",
        "Never stop being your wonderful self.",
        "You deserve all the beautiful things in life."
    ],

    floatingMessages: [
        "You are special",
        "Keep smiling",
        "Lots of happiness",
        "A little love for you",
        "Stay wonderful"
    ],

    letter: `Dear Birthday Star,

Today is all about you and the happiness you bring into this world.

I hope your days are filled with laughter, your dreams keep growing, and life gives you countless reasons to smile.

You deserve kindness, happiness and beautiful memories.

May this new year of your life be truly special.

Happy Birthday!

With love,
Someone who wishes you the best`
};


/* =========================================
   ELEMENTS AND STATE
   ========================================= */

const app = document.getElementById("app");
const music = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");

const welcomeScreen = document.getElementById("welcome");
const questionScreen = document.getElementById("birthdayQuestion");

const keypad = document.getElementById("keypad");
const pinDots = document.querySelectorAll("#pinDots span");
const passcodeMessage = document.getElementById("passcodeMessage");

const passcodeForm = document.getElementById("passcodeForm");
const passcodeInput = document.getElementById("passcode");

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const questionMessage = document.getElementById("questionMessage");

let enteredPin = "";
let currentScreen = "welcome";
let blownOut = false;
let microphoneStream = null;
let microphoneContext = null;
let microphoneFrame = null;
let noButtonMoved = false;


/* =========================================
   SCREEN NAVIGATION
   ========================================= */

function createScreen(id, html) {
    let screen = document.getElementById(id);

    if (!screen) {
        screen = document.createElement("section");
        screen.id = id;
        screen.className = "screen";
        screen.innerHTML = html;
        app.appendChild(screen);
    }

    return screen;
}

function showScreen(id) {
    document.querySelectorAll("#app .screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(id);

    if (!target) {
        console.error("Screen not found:", id);
        return;
    }

    target.classList.add("active");
    currentScreen = id;
}


/* =========================================
   BACKGROUND MUSIC
   ========================================= */

async function startMusic() {
    if (!music) return;

    if (musicToggle) {
        musicToggle.hidden = false;
    }

    try {
        await music.play();

        if (musicToggle) {
            musicToggle.textContent = "Music: ON";
        }
    } catch (error) {
        if (musicToggle) {
            musicToggle.textContent = "Music: OFF";
        }

        console.info(
            "Add assets/bgm.mp3 and interact with the page to start music."
        );
    }
}

if (musicToggle && music) {
    musicToggle.addEventListener("click", async () => {
        if (music.paused) {
            await startMusic();
        } else {
            music.pause();
            musicToggle.textContent = "Music: OFF";
        }
    });
}


/* =========================================
   PASSCODE KEYPAD
   ========================================= */

function updatePinDots() {
    pinDots.forEach((dot, index) => {
        dot.classList.toggle("filled", index < enteredPin.length);
    });
}

function resetPin() {
    enteredPin = "";
    updatePinDots();
}

function checkPasscode() {
    if (enteredPin !== SETTINGS.passcode) {
        if (passcodeMessage) {
            passcodeMessage.textContent = "Oops! Try again.";
        }

        resetPin();
        return;
    }

    if (passcodeMessage) {
        passcodeMessage.textContent = "";
    }

    showScreen("birthdayQuestion");
    startMusic();
}

if (keypad) {
    keypad.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.dataset.digit !== undefined) {
            if (enteredPin.length >= 4) return;

            enteredPin += button.dataset.digit;
            updatePinDots();

            if (enteredPin.length === 4) {
                checkPasscode();
            }

            return;
        }

        if (button.dataset.action === "clear") {
            resetPin();
        }

        if (button.dataset.action === "delete") {
            enteredPin = enteredPin.slice(0, -1);
            updatePinDots();
        }
    });
} else if (passcodeForm && passcodeInput) {
    // Supports the earlier password-input version of index.html.
    passcodeForm.addEventListener("submit", event => {
        event.preventDefault();
        enteredPin = passcodeInput.value;
        checkPasscode();
        passcodeInput.value = "";
    });
}


/* =========================================
   YES / NO QUESTION
   Fast No-button movement without animation.
   ========================================= */

if (questionScreen) {
    const heading = questionScreen.querySelector("h2");

    if (heading) {
        heading.textContent = SETTINGS.question;
    }
}

function moveNoButton() {
    if (!noButton) return;

    const group = noButton.parentElement;
    const groupRect = group.getBoundingClientRect();

    // Keep the button inside its parent.
    const maxX = Math.max(0, groupRect.width - noButton.offsetWidth);
    const maxY = Math.max(0, groupRect.height - noButton.offsetHeight);

    // Disable transition so movement happens instantly.
    noButton.style.transition = "none";
    noButton.style.position = "absolute";
    noButton.style.left = `${Math.random() * maxX}px`;
    noButton.style.top = `${Math.random() * maxY}px`;

    noButtonMoved = true;
}

if (yesButton) {
    yesButton.addEventListener("click", () => {
        buildBalloonScreen();
        showScreen("balloonsScreen");
        startMusic();
    });
}

if (noButton) {
    // Mouse only: one movement when the pointer enters.
    noButton.addEventListener("pointerenter", event => {
        if (event.pointerType === "mouse") {
            moveNoButton();
        }
    });

    // Touch devices: move only after a tap, not on pointerenter.
    noButton.addEventListener("click", event => {
        event.preventDefault();
        moveNoButton();

        if (questionMessage) {
            questionMessage.textContent = "Hehe, try again!";
        }
    });
}


/* =========================================
   FOUR BALLOONS
   ========================================= */

function buildBalloonScreen() {
    createScreen("balloonsScreen", `
        <h1>A Few Little Surprises</h1>
        <p>Tap every balloon to discover your messages.</p>

        <div class="balloon-container">
            <button class="balloon" data-index="0"
                aria-label="Pop balloon one"></button>
            <button class="balloon" data-index="1"
                aria-label="Pop balloon two"></button>
            <button class="balloon" data-index="2"
                aria-label="Pop balloon three"></button>
            <button class="balloon" data-index="3"
                aria-label="Pop balloon four"></button>
        </div>

        <div id="balloonMessages" aria-live="polite"></div>
        <p id="balloonProgress">4 surprises waiting for you.</p>
        <button id="balloonContinue" hidden>Continue</button>
    `);

    const screen = document.getElementById("balloonsScreen");
    const balloons = screen.querySelectorAll(".balloon");
    const messageArea = screen.querySelector("#balloonMessages");
    const progress = screen.querySelector("#balloonProgress");
    const continueButton = screen.querySelector("#balloonContinue");

    let poppedCount = 0;

    balloons.forEach(balloon => {
        balloon.addEventListener("click", () => {
            if (balloon.classList.contains("popped")) return;

            balloon.classList.add("popped");
            balloon.disabled = true;
            poppedCount++;

            const message = document.createElement("div");
            message.className = "balloon-message";
            message.textContent =
                SETTINGS.balloonMessages[Number(balloon.dataset.index)];

            messageArea.appendChild(message);
            progress.textContent = `${4 - poppedCount} surprises remaining.`;

            if (poppedCount === 4) {
                progress.textContent = "You found every surprise!";
                continueButton.hidden = false;
            }
        });
    });

    continueButton.addEventListener("click", () => {
        buildCandleScreen();
        showScreen("candleScreen");
    });
}


/* =========================================
   BIRTHDAY CANDLE
   ========================================= */

function buildCandleScreen() {
    createScreen("candleScreen", `
        <h1>Make a Birthday Wish</h1>
        <p>Blow out the candle to make your wish!</p>

        <div class="cake">
            <div class="candle" id="birthdayCandle">
                <div class="flame"></div>
            </div>
            <div class="cake-body"></div>
        </div>

        <button id="micButton">Enable Microphone</button>
        <button id="blowButton" class="secondary-button">
            Blow Out Candle
        </button>

        <p id="micMessage" aria-live="polite">
            You can use the button if microphone access is unavailable.
        </p>
    `);

    const screen = document.getElementById("candleScreen");
    const micButton = screen.querySelector("#micButton");
    const blowButton = screen.querySelector("#blowButton");
    const micMessage = screen.querySelector("#micMessage");
    const candle = screen.querySelector("#birthdayCandle");

    blownOut = false;

    function extinguishCandle() {
        if (blownOut) return;

        blownOut = true;
        candle.classList.add("blown-out");
        micMessage.textContent = "Your wish is on its way!";

        stopMicrophone();

        micButton.disabled = true;
        blowButton.textContent = "Continue";
        blowButton.classList.remove("secondary-button");
    }

    blowButton.addEventListener("click", () => {
        if (!blownOut) {
            extinguishCandle();
        } else {
            buildBouquetScreen();
            showScreen("bouquetScreen");
        }
    });

    micButton.addEventListener("click", async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            micMessage.textContent =
                "Microphone unavailable. Use Blow Out Candle.";
            return;
        }

        try {
            microphoneStream =
                await navigator.mediaDevices.getUserMedia({ audio: true });

            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            microphoneContext = new AudioContextClass();

            const source =
                microphoneContext.createMediaStreamSource(microphoneStream);

            const analyser = microphoneContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            const samples = new Uint8Array(analyser.fftSize);

            micButton.disabled = true;
            micButton.textContent = "Listening...";
            micMessage.textContent = "Blow gently near your microphone!";

            function detectBlow() {
                if (blownOut) return;

                analyser.getByteTimeDomainData(samples);

                let sum = 0;

                for (const sample of samples) {
                    const normalized = (sample - 128) / 128;
                    sum += normalized * normalized;
                }

                const volume = Math.sqrt(sum / samples.length);

                if (volume > 0.13) {
                    extinguishCandle();
                    return;
                }

                microphoneFrame = requestAnimationFrame(detectBlow);
            }

            detectBlow();
        } catch (error) {
            micMessage.textContent =
                "Microphone permission unavailable. Use Blow Out Candle.";
        }
    });
}

function stopMicrophone() {
    if (microphoneFrame !== null) {
        cancelAnimationFrame(microphoneFrame);
        microphoneFrame = null;
    }

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }

    if (microphoneContext) {
        microphoneContext.close().catch(() => {});
        microphoneContext = null;
    }
}


/* =========================================
   ROSE BOUQUET
   ========================================= */

function buildBouquetScreen() {
    createScreen("bouquetScreen", `
        <h1>A Bouquet Just for You</h1>
        <p>A few little reminders of how special you are.</p>

        <div class="bouquet" aria-label="Rose bouquet">💐</div>

        <div class="floating-messages">
            ${SETTINGS.floatingMessages.map(message =>
                `<span>${escapeHTML(message)}</span>`
            ).join("")}
        </div>

        <button id="letterContinue" style="margin-top:25px">
            Open Your Letter
        </button>
    `);

    document.getElementById("letterContinue").addEventListener("click", () => {
        buildLetterScreen();
        showScreen("letterScreen");
    });
}


/* =========================================
   LETTER
   ========================================= */

function buildLetterScreen() {
    createScreen("letterScreen", `
        <h1>A Message From My Heart</h1>
        <p>There is something I want you to read.</p>

        <button id="openLetter" class="envelope"
            aria-label="Open your letter">💌</button>

        <div id="letterContent" hidden></div>

        <button id="letterNext" hidden>One Last Thing...</button>
    `);

    const openLetter = document.getElementById("openLetter");
    const letterContent = document.getElementById("letterContent");
    const nextButton = document.getElementById("letterNext");

    openLetter.addEventListener("click", () => {
        letterContent.hidden = false;
        letterContent.className = "letter";
        letterContent.textContent = SETTINGS.letter;
        openLetter.textContent = "💖";
        nextButton.hidden = false;
    });

    nextButton.addEventListener("click", () => {
        buildGiftScreen();
        showScreen("giftScreen");
    });
}


/* =========================================
   FINAL GIFT
   ========================================= */

function buildGiftScreen() {
    createScreen("giftScreen", `
        <h1>One Last Thing...</h1>
        <p>There is one more little surprise for you.</p>

        <button id="openGift" class="gift"
            aria-label="Open final birthday gift">🎁</button>

        <div id="finalWish" class="final-wish" hidden>
            <h2>Happy Birthday, ${escapeHTML(SETTINGS.birthdayName)}!</h2>
            <p>
                May your life be filled with love, laughter,
                beautiful memories and wonderful surprises.
                Never forget how special you are.
            </p>
            <p>Wishing you the happiest birthday!</p>
        </div>

        <button id="replayButton" class="replay-button" hidden>
            Replay the Surprise
        </button>
    `);

    const giftButton = document.getElementById("openGift");
    const finalWish = document.getElementById("finalWish");
    const replayButton = document.getElementById("replayButton");

    giftButton.addEventListener("click", () => {
        finalWish.hidden = false;
        giftButton.textContent = "💝";
        giftButton.disabled = true;
        replayButton.hidden = false;
    });

    replayButton.addEventListener("click", replayExperience);
}


/* =========================================
   REPLAY
   ========================================= */

function replayExperience() {
    stopMicrophone();

    resetPin();

    if (passcodeMessage) {
        passcodeMessage.textContent = "";
    }

    if (questionMessage) {
        questionMessage.textContent = "";
    }

    if (noButton) {
        noButton.style.position = "";
        noButton.style.left = "";
        noButton.style.top = "";
        noButton.style.transition = "";
        noButtonMoved = false;
    }

    [
        "balloonsScreen",
        "candleScreen",
        "bouquetScreen",
        "letterScreen",
        "giftScreen"
    ].forEach(id => {
        document.getElementById(id)?.remove();
    });

    showScreen("welcome");

    // Do not stop or recreate the music element here.
}


/* =========================================
   TEXT ESCAPING
   ========================================= */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


/* =========================================
   INITIALIZE
   ========================================= */

showScreen("welcome");
