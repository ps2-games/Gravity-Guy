import { animateWithEasing, animationSprite, setAnimation } from "../../../shared/animation.js";
import { ASSETS_PATH, GAME_STATE, PLAYER_ONE_PORT, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js";
import Gamepad from '../../../shared/gamepad.js'
import Easing from "../../../shared/easing.js";
import ScreenBase from "../../../shared/screenBase.js";
import StateManager from "../../../shared/stateManager.js";
import Assets from "../../../shared/assets.js";

export default class MainMenuScreen extends ScreenBase {
    constructor() {
        super()
        this.buttons = null;
        this.multiplayerButtons = null;
        this.selectedIndex = 0;
        this.isMultiplayerMode = false;
        this.isTransitioning = false;
        this.targetMode = null;

        this.introAnimationDone = false;
        this.flashRequested = false;
        this.flashing = false;
        this.flashStartTime = 0;

        this.shaking = false;
        this.shakeStartTime = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        this.FLASH_DURATION = 200;
        this.SHAKE_DURATION = 200;
        this.SHAKE_MAGNITUDE = 12;
    }

    init() {
        super.init();
    }

    _initAssets() {
        this.STREAM_MAIN_MENU = Assets.sound(`${ASSETS_PATH.SOUNDS}/main_menu.ogg`)
        this.STREAM_MAIN_MENU.loop = true;

        this.SFX_CLICK = Assets.sound(`${ASSETS_PATH.SOUNDS}/click.adp`)

        this.BACKGROUND = Assets.image(`${ASSETS_PATH.UI}/background.png`, {
            optimize: true,
            animConfig: {
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT
            }
        });
        this.LOGO_ARMOR = Assets.image(`${ASSETS_PATH.UI}/armor_logo.png`, { optimize: true })
        this.BG_BLUE_GUY = Assets.image(`${ASSETS_PATH.UI}/blue_guy.png`, {
            optimize: true,
            animConfig: {
                x: -195
            }
        });
        this.BG_WHITE_GUY = Assets.image(`${ASSETS_PATH.UI}/white_guy.png`, {
            optimize: true,
            animConfig: {
                x: SCREEN_WIDTH
            }
        });
        this.BTN_PLAY = Assets.image(`${ASSETS_PATH.UI}/btn_play.png`, {
            optimize: true,
            animConfig: {
                width: 250,
                height: 100,
                frameWidth: 250,
                frameHeight: 100,
                framesPerRow: 2,
                fps: 0,
                startx: 0,
                starty: 0,
                endx: 250,
                endy: 100,
                x: (SCREEN_WIDTH - 250) / 2,
                y: (SCREEN_HEIGHT - 100) / 2 + 24,
                totalFrames: 2,
                animations: {
                    "normal": {
                        start: 0,
                        end: 0,
                    },
                    "hover": {
                        start: 1,
                        end: 1,
                    },
                }
            }
        });
        this.BTN_MULTIPLAYER = Assets.image(`${ASSETS_PATH.UI}/btn_multiplayer.png`, {
            optimize: true,
            animConfig: {
                width: 232,
                height: 73,
                frameWidth: 232,
                frameHeight: 73,
                framesPerRow: 2,
                fps: 0,
                startx: 0,
                starty: 0,
                endx: 232,
                endy: 73,
                x: (SCREEN_WIDTH - 232) / 2,
                y: this.BTN_PLAY.y + this.BTN_PLAY.height + 4,
                totalFrames: 2,
                animations: {
                    "normal": {
                        start: 0,
                        end: 0,
                    },
                    "hover": {
                        start: 1,
                        end: 1,
                    },
                }
            }
        });
        this.BTN_SCORES = Assets.image(`${ASSETS_PATH.UI}/btn_scores.png`, {
            optimize: true,
            animConfig: {
                width: 145,
                height: 34,
                frameWidth: 145,
                frameHeight: 34,
                framesPerRow: 2,
                fps: 0,
                startx: 0,
                starty: 0,
                endx: 145,
                endy: 34,
                x: Math.fround(this.BTN_MULTIPLAYER.x + this.BTN_MULTIPLAYER.width - 145 / 1.5),
                y: this.BTN_MULTIPLAYER.y + this.BTN_MULTIPLAYER.height + 24,
                totalFrames: 2,
                animations: {
                    "normal": {
                        start: 0,
                        end: 0,
                    },
                    "hover": {
                        start: 1,
                        end: 1,
                    },
                }
            }
        });
        this.BTN_CREDITS = Assets.image(`${ASSETS_PATH.UI}/btn_credits.png`, {
            optimize: true,
            animConfig: {
                width: 145,
                height: 34,
                frameWidth: 145,
                frameHeight: 34,
                framesPerRow: 2,
                fps: 0,
                startx: 0,
                starty: 0,
                endx: 145,
                endy: 34,
                x: this.BTN_MULTIPLAYER.x - 145 / 3,
                y: this.BTN_MULTIPLAYER.y + this.BTN_MULTIPLAYER.height + 24,
                totalFrames: 2,
                animations: {
                    "normal": {
                        start: 0,
                        end: 0,
                    },
                    "hover": {
                        start: 1,
                        end: 1,
                    },
                }
            }
        });

        this.CHOOSE_PLAYERS_LABEL = Assets.image(`${ASSETS_PATH.UI}/choose_players.png`, {
            optimize: true,
            animConfig: {
                x: (SCREEN_WIDTH - 293) / 2,
                y: (SCREEN_HEIGHT - 90) / 2
            }
        })
        this.BTN_2_PLAYERS = Assets.image(`${ASSETS_PATH.UI}/btn_2_players.png`, {
            optimize: true,
            animConfig: {
                width: 141,
                height: 114,
                frameWidth: 141,
                frameHeight: 114,
                framesPerRow: 2,
                x: 100,
                y: SCREEN_HEIGHT - 114 * 2,
                totalFrames: 2,
                animations: { "normal": { start: 0, end: 0 }, "hover": { start: 1, end: 1 } }
            }
        })
        this.BTN_3_PLAYERS = Assets.image(`${ASSETS_PATH.UI}/btn_3_players.png`, {
            optimize: true,
            animConfig: {
                width: 135,
                height: 114,
                frameWidth: 135,
                frameHeight: 114,
                framesPerRow: 2,
                x: this.BTN_2_PLAYERS.x + this.BTN_2_PLAYERS.width,
                y: SCREEN_HEIGHT - 114 * 2,
                totalFrames: 2,
                animations: { "normal": { start: 0, end: 0 }, "hover": { start: 1, end: 1 } }
            }
        })
        this.BTN_4_PLAYERS = Assets.image(`${ASSETS_PATH.UI}/btn_4_players.png`, {
            optimize: true,
            animConfig: {
                height: 114,
                width: 140,
                frameWidth: 140,
                frameHeight: 114,
                framesPerRow: 2,
                x: this.BTN_3_PLAYERS.x + this.BTN_3_PLAYERS.width,
                y: SCREEN_HEIGHT - 114 * 2,
                totalFrames: 2,
                animations: { "normal": { start: 0, end: 0 }, "hover": { start: 1, end: 1 } }
            }
        })
        this.BTN_BACK = Assets.image(`${ASSETS_PATH.UI}/btn_back.png`, {
            optimize: true,
            animConfig: {
                height: 49,
                width: 172,
                frameWidth: 172,
                frameHeight: 49,
                framesPerRow: 2,
                x: (SCREEN_WIDTH - 172) / 2,
                y: SCREEN_HEIGHT - 49 * 2,
                totalFrames: 2,
                animations: { "normal": { start: 0, end: 0 }, "hover": { start: 1, end: 1 } }
            }
        })
    }

    onEnter(fromState) {
        super.onEnter(fromState);
        this._initAssets();

        if (!this.STREAM_MAIN_MENU.playing()) {
            this.STREAM_MAIN_MENU.play();
        }

        this.BG_BLUE_GUY.x = -this.BG_BLUE_GUY.width;
        this.BG_WHITE_GUY.x = SCREEN_WIDTH;
        this.introAnimationDone = false;

        this.buttons = [this.BTN_PLAY, this.BTN_MULTIPLAYER, this.BTN_CREDITS, this.BTN_SCORES];
        this.multiplayerButtons = [this.BTN_2_PLAYERS, this.BTN_3_PLAYERS, this.BTN_4_PLAYERS, this.BTN_BACK];
        this.selectedIndex = 0;
        this.isMultiplayerMode = false;
    }

    drawBackground() {
        this.BACKGROUND.draw(0 + this.shakeOffsetX, 0 + this.shakeOffsetY);
        this.LOGO_ARMOR.draw((SCREEN_WIDTH - this.LOGO_ARMOR.width) / 2 + this.shakeOffsetX, 0 + this.shakeOffsetY);

        const shouldDrawGuys = !this.isMultiplayerMode || this.isTransitioning;

        if (shouldDrawGuys) {
            if (!this.isMultiplayerMode && !this.isTransitioning && !this.introAnimationDone) {
                if (!this._introAnimStarted) {
                    delete this.BG_BLUE_GUY._deltas;
                    delete this.BG_BLUE_GUY._base;
                    delete this.BG_BLUE_GUY.start;
                    delete this.BG_WHITE_GUY._deltas;
                    delete this.BG_WHITE_GUY._base;
                    delete this.BG_WHITE_GUY.start;
                    this._introAnimStarted = true;
                }

                const blueDone = animateWithEasing(this.BG_BLUE_GUY, { x: 0 }, Easing.linear, 600);
                const whiteDone = animateWithEasing(this.BG_WHITE_GUY, { x: SCREEN_WIDTH - this.BG_WHITE_GUY.width }, Easing.linear, 600);

                if (blueDone && whiteDone) {
                    this.introAnimationDone = true;
                    this._introAnimStarted = false;
                    this.flashRequested = true;
                }
            }
            this.BG_BLUE_GUY.draw(this.BG_BLUE_GUY.x + this.shakeOffsetX, SCREEN_HEIGHT - this.BG_BLUE_GUY.height + this.shakeOffsetY);
            this.BG_WHITE_GUY.draw(this.BG_WHITE_GUY.x + this.shakeOffsetX, SCREEN_HEIGHT - this.BG_WHITE_GUY.height + this.shakeOffsetY);
        }
    }

    drawMultiplayerButtons() {
        for (let index = 0; index < this.multiplayerButtons.length; index++) {
            if (this.selectedIndex === index) {
                setAnimation(this.multiplayerButtons[index], "hover");
            } else {
                setAnimation(this.multiplayerButtons[index], "normal");
            }
        }

        this.CHOOSE_PLAYERS_LABEL.draw(this.CHOOSE_PLAYERS_LABEL.x + this.shakeOffsetX, this.CHOOSE_PLAYERS_LABEL.y + this.shakeOffsetY);

        animationSprite(this.BTN_2_PLAYERS);
        this.BTN_2_PLAYERS.draw(this.BTN_2_PLAYERS.x + this.shakeOffsetX, this.BTN_2_PLAYERS.y + this.shakeOffsetY);

        animationSprite(this.BTN_3_PLAYERS);
        this.BTN_3_PLAYERS.draw(this.BTN_3_PLAYERS.x + this.shakeOffsetX, this.BTN_3_PLAYERS.y + this.shakeOffsetY);

        animationSprite(this.BTN_4_PLAYERS);
        this.BTN_4_PLAYERS.draw(this.BTN_4_PLAYERS.x + this.shakeOffsetX, this.BTN_4_PLAYERS.y + this.shakeOffsetY);

        animationSprite(this.BTN_BACK);
        this.BTN_BACK.draw(this.BTN_BACK.x + this.shakeOffsetX, this.BTN_BACK.y + this.shakeOffsetY);
    }

    drawMainMenuButtons() {
        for (let index = 0; index < this.buttons.length; index++) {
            if (this.selectedIndex === index) {
                setAnimation(this.buttons[index], "hover");
            } else {
                setAnimation(this.buttons[index], "normal");
            }
        }

        animationSprite(this.BTN_PLAY);
        this.BTN_PLAY.draw(this.BTN_PLAY.x + this.shakeOffsetX, this.BTN_PLAY.y + this.shakeOffsetY);

        animationSprite(this.BTN_MULTIPLAYER);
        this.BTN_MULTIPLAYER.draw(this.BTN_MULTIPLAYER.x + this.shakeOffsetX, this.BTN_MULTIPLAYER.y + this.shakeOffsetY);

        animationSprite(this.BTN_CREDITS);
        this.BTN_CREDITS.draw(this.BTN_CREDITS.x + this.shakeOffsetX, this.BTN_CREDITS.y + this.shakeOffsetY);

        animationSprite(this.BTN_SCORES);
        this.BTN_SCORES.draw(this.BTN_SCORES.x + this.shakeOffsetX, this.BTN_SCORES.y + this.shakeOffsetY);
    }

    drawButtons() {
        if (this.isTransitioning && this.targetMode) {
            return this.targetMode === 'multiplayer' ? this.drawMultiplayerButtons() : this.drawMainMenuButtons();
        }
        return this.isMultiplayerMode ? this.drawMultiplayerButtons() : this.drawMainMenuButtons();
    }

    handleInput() {
        const stick = Gamepad.player(PLAYER_ONE_PORT).leftStick();
        const justPressedUp = Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.UP) || (stick.y < -0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_UP));
        const justPressedDown = Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.DOWN) || (stick.y > 0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_DOWN));
        const justPressedLeft = Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.LEFT) || (stick.x < -0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_LEFT));
        const justPressedRight = Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.RIGHT) || (stick.x > 0.5 && Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L_STICK_RIGHT));

        if (this.isMultiplayerMode) {
            if (justPressedLeft) {
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            }
            if (justPressedRight) {
                this.selectedIndex = Math.min(this.multiplayerButtons.length - 2, this.selectedIndex + 1);
            }
            if (justPressedUp) {
                if (this.selectedIndex === 3) this.selectedIndex = 0;
                else if (this.selectedIndex < 3) this.selectedIndex = 3;
            }
            if (justPressedDown) {
                if (this.selectedIndex < 3) this.selectedIndex = 3;
                else this.selectedIndex = 0;
            }
        } else {
            if (justPressedUp) {
                if (this.selectedIndex === 0) this.selectedIndex = this.buttons.length - 1;
                else if (this.selectedIndex === 1) this.selectedIndex = 0;
                else if (this.selectedIndex === 2 || this.selectedIndex === 3) this.selectedIndex = 1;
            }

            if (justPressedDown) {
                if (this.selectedIndex === this.buttons.length - 1) this.selectedIndex = 0;
                else if (this.selectedIndex === 0) this.selectedIndex = 1;
                else if (this.selectedIndex === 1) this.selectedIndex = 2;
            }

            if (justPressedLeft) {
                if (this.selectedIndex === 3) this.selectedIndex = 2;
            }

            if (justPressedRight) {
                if (this.selectedIndex === 2) this.selectedIndex = 3;
            }
        }

        if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.CROSS)) {
            this.handleSelection();
        }
    }

    handleTransitions() {
        if (!this.isTransitioning) return;

        if (!this._transitionStarted) {
            delete this.BG_BLUE_GUY._deltas;
            delete this.BG_BLUE_GUY._base;
            delete this.BG_BLUE_GUY.start;
            delete this.BG_WHITE_GUY._deltas;
            delete this.BG_WHITE_GUY._base;
            delete this.BG_WHITE_GUY.start;
            this._transitionStarted = true;
            this.selectedIndex = 0;
        }

        const blueDone = animateWithEasing(this.BG_BLUE_GUY, { x: -this.BG_BLUE_GUY.width }, Easing.linear, 400);
        const whiteDone = animateWithEasing(this.BG_WHITE_GUY, { x: SCREEN_WIDTH }, Easing.linear, 400);

        if (blueDone && whiteDone) {
            this.isTransitioning = false;
            this._transitionStarted = false;

            if (this.targetMode === 'multiplayer') {
                this.isMultiplayerMode = true;
            } else if (this.targetMode === 'main_menu') {
                this.isMultiplayerMode = false;
                this.introAnimationDone = false;
            }
            this.targetMode = null;
        }
    }

    handleSelection() {
        if (!this.SFX_CLICK.playing()) {
            this.SFX_CLICK.play();
        }

        if (this.isMultiplayerMode) {
            if (this.selectedIndex === 3) {
                this.isTransitioning = true;
                this.flashRequested = true;
                this.targetMode = 'main_menu';
            }
        } else {
            let nextState;
            switch (this.selectedIndex) {
                case 0:
                    nextState = GAME_STATE.SINGLE_PLAYER;
                    StateManager.setState(GAME_STATE.LOADING, { targetState: nextState });
                    break;
                case 1:
                    this.isTransitioning = true;
                    this.flashRequested = true;
                    this.targetMode = 'multiplayer';
                    break;
                case 2:
                    nextState = GAME_STATE.CREDITS;
                    StateManager.setState(GAME_STATE.LOADING, { targetState: nextState });
                    break;
                case 3:
                    nextState = GAME_STATE.SCORES;
                    StateManager.setState(GAME_STATE.LOADING, { targetState: nextState });
                    break;
            }
        }
    }

    handleEffects() {
        if (this.flashRequested) {
            this.flashing = true;
            this.flashStartTime = Date.now();
            this.shaking = true;
            this.shakeStartTime = Date.now();
            this.flashRequested = false;
        }

        if (this.shaking) {
            const elapsed = Date.now() - this.shakeStartTime;
            if (elapsed < this.SHAKE_DURATION) {
                this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.SHAKE_MAGNITUDE;
                this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.SHAKE_MAGNITUDE;
            } else {
                this.shaking = false;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    }

    drawEffects() {
        if (this.flashing) {
            const elapsed = Date.now() - this.flashStartTime;
            let alpha = 0;

            if (elapsed < this.FLASH_DURATION) {
                alpha = (elapsed / this.FLASH_DURATION) * 180;
            } else if (elapsed < this.FLASH_DURATION * 2) {
                alpha = (1 - ((elapsed - this.FLASH_DURATION) / this.FLASH_DURATION)) * 180;
            } else {
                this.flashing = false;
            }

            if (this.flashing) {
                alpha *= 0.4;
                const flashColor = Color.new(255, 255, 255, alpha);
                Draw.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, flashColor);
            }
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        this.handleTransitions();
        this.handleEffects();
        if (!this.isTransitioning) {
            this.handleInput();
        }
    }

    render() {
        if (!this.isActive) return;

        this.drawBackground();
        this.drawButtons();
        this.drawEffects();
    }

    _freeAssets() {
        Assets.free(`${ASSETS_PATH.SOUNDS}/main_menu.ogg`)
        Assets.free(`${ASSETS_PATH.SOUNDS}/click.adp`)
        Assets.free(`${ASSETS_PATH.UI}/background.png`);
        Assets.free(`${ASSETS_PATH.UI}/armor_logo.png`)
        Assets.free(`${ASSETS_PATH.UI}/blue_guy.png`);
        Assets.free(`${ASSETS_PATH.UI}/white_guy.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_play.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_multiplayer.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_scores.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_credits.png`);
        Assets.free(`${ASSETS_PATH.UI}/choose_players.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_2_players.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_3_players.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_4_players.png`);
        Assets.free(`${ASSETS_PATH.UI}/btn_back.png`);
    }

    onExit() {
        super.onExit();
        if (this.STREAM_MAIN_MENU.playing()) {
            this.STREAM_MAIN_MENU.rewind();
        }

        this._freeAssets();
    }
}