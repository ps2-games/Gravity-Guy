import { BACKGROUND, BG_BLUE_GUY, BG_WHITE_GUY, BTN_CREDITS, BTN_MULTIPLAYER, BTN_PLAY, BTN_SCORES, LOGO_ARMOR, SFX_CLICK, SHAKE_MAGNITUDE, STREAM_MAIN_MENU, SHAKE_DURATION, FLASH_DURATION } from "./constants.js";
import { animateWithEasing, animationSprite, setAnimation } from "../../../shared/animation.js";
import { PLAYER_ONE_PORT, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js";
import Gamepad from '../../../shared/gamepad.js'
import Easing from "../../../shared/easing.js";

const buttons = [BTN_PLAY, BTN_MULTIPLAYER, BTN_CREDITS, BTN_SCORES];
let selectedIndex = 0;

let introAnimationDone = false;
let flashRequested = false;
let flashing = false;
let flashStartTime = 0;
let shaking = false;
let shakeStartTime = 0;
let shakeOffsetX = 0;
let shakeOffsetY = 0;

function drawBackground() {
    BACKGROUND.draw(0 + shakeOffsetX, 0 + shakeOffsetY);
    LOGO_ARMOR.draw((SCREEN_WIDTH - LOGO_ARMOR.width) / 2 + shakeOffsetX, 0 + shakeOffsetY);

    if (!introAnimationDone) {
        const blueDone = animateWithEasing(BG_BLUE_GUY, { x: 0 }, Easing.linear, 600);
        const whiteDone = animateWithEasing(BG_WHITE_GUY, { x: SCREEN_WIDTH - BG_WHITE_GUY.width }, Easing.linear, 600);
        if (blueDone && whiteDone) {
            introAnimationDone = true;
            flashRequested = true;
        }
    }

    BG_BLUE_GUY.draw(BG_BLUE_GUY.x + shakeOffsetX, SCREEN_HEIGHT - BG_BLUE_GUY.height + shakeOffsetY);
    BG_WHITE_GUY.draw(BG_WHITE_GUY.x + shakeOffsetX, SCREEN_HEIGHT - BG_WHITE_GUY.height + shakeOffsetY);
}

function drawButtons() {
    for (let index = 0; index < buttons.length; index++) {
        if (selectedIndex === index) {
            setAnimation(buttons[index], "hover");
        } else {
            setAnimation(buttons[index], "normal");
        }
    }

    animationSprite(BTN_PLAY);
    BTN_PLAY.draw(BTN_PLAY.x + shakeOffsetX, BTN_PLAY.y + shakeOffsetY);

    animationSprite(BTN_MULTIPLAYER);
    BTN_MULTIPLAYER.draw(BTN_MULTIPLAYER.x + shakeOffsetX, BTN_MULTIPLAYER.y + shakeOffsetY);

    animationSprite(BTN_CREDITS);
    BTN_CREDITS.draw(BTN_CREDITS.x + shakeOffsetX, BTN_CREDITS.y + shakeOffsetY);

    animationSprite(BTN_SCORES);
    BTN_SCORES.draw(BTN_SCORES.x + shakeOffsetX, BTN_SCORES.y + shakeOffsetY);
}

function handleInput() {
    const stick = Gamepad.player(PLAYER_ONE_PORT).leftStick();

    if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.CROSS) && !SFX_CLICK.playing()) {
        SFX_CLICK.play();
    }

    if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.UP) || (stick.y < -0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_UP))) {
        if (selectedIndex === 1) selectedIndex = 0;
        else if (selectedIndex === 2 || selectedIndex === 3) selectedIndex = 1;
    }

    if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.DOWN) || (stick.y > 0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_DOWN))) {
        if (selectedIndex === 0) selectedIndex = 1;
        else if (selectedIndex === 1) selectedIndex = 2;
    }

    if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.LEFT) || (stick.x < -0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_LEFT))) {
        if (selectedIndex === 3) selectedIndex = 2;
    }

    if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.RIGHT) || (stick.x > 0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_RIGHT))) {
        if (selectedIndex === 2) selectedIndex = 3;
    }
}

function handleEffects() {
    if (flashRequested) {
        flashing = true;
        flashStartTime = Date.now();
        shaking = true;
        shakeStartTime = Date.now();
        flashRequested = false;
    }

    if (shaking) {
        const elapsed = Date.now() - shakeStartTime;
        if (elapsed < SHAKE_DURATION) {
            shakeOffsetX = (Math.random() - 0.5) * 2 * SHAKE_MAGNITUDE;
            shakeOffsetY = (Math.random() - 0.5) * 2 * SHAKE_MAGNITUDE;
        } else {
            shaking = false;
            shakeOffsetX = 0;
            shakeOffsetY = 0;
        }
    }
}

function drawEffects() {
    if (flashing) {
        const elapsed = Date.now() - flashStartTime;
        let alpha = 0;

        if (elapsed < FLASH_DURATION) {
            alpha = (elapsed / FLASH_DURATION) * 180;
        } else if (elapsed < FLASH_DURATION * 2) {
            alpha = (1 - ((elapsed - FLASH_DURATION) / FLASH_DURATION)) * 180;
        } else {
            flashing = false;
        }

        if (flashing) {
            alpha *= 0.4;
            const flashColor = Color.new(255, 255, 255, alpha);
            Draw.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, flashColor);
        }
    }
}

function MAIN_MENU_LOOP() {
    if (!STREAM_MAIN_MENU.playing()) {
        STREAM_MAIN_MENU.play();
    }

    handleInput();
    handleEffects();
    drawBackground();
    drawButtons();
    drawEffects();
}

export default MAIN_MENU_LOOP
