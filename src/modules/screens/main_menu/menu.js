import { animateWithEasing, animationSprite, setAnimation } from "../../../shared/animation.js";
import { ASSETS_PATH, GAME_STATE, PLAYER_ONE_PORT, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js";
import Gamepad from '../../../shared/gamepad.js'
import Easing from "../../../shared/easing.js";
import ScreenBase from "../../../shared/screenBase.js";
import StateManager from "../../../shared/stateManager.js";
import Assets from "../../../shared/assets.js";

export default class MainMenuScreen extends ScreenBase {
    constructor() {
        super();
        
        this.FLASH_DURATION = 200;
        this.SHAKE_DURATION = 200;
        this.SHAKE_MAGNITUDE = 12;
        this.ANIMATION_SPEED = {
            INTRO: 600,
            EXIT_MULTIPLAYER: 300,
            EXIT_MENU: 400
        };

        this.buttons = [];
        this.multiplayerButtons = [];
        this.selectedIndex = 0;
        this.isMultiplayerMode = false;
        this.isTransitioning = false;
        this.targetMode = null;
        this.isFirstEntry = true;
        this.introAnimationDone = false;
        this.flashRequested = false;
        this.flashing = false;
        this.shaking = false;
        this.isReturningFromMultiplayer = false;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.skipNextFlash = false;
        this._animProps = ['_deltas', '_base', 'start', 'duration', 'extraDelay', 'loopEnabled', 'shouldReverse', 'isReversed'];
    }

    _createButton(path, x, y, width, height, frameWidth, frameHeight) {
        return Assets.image(path, {
            optimize: true,
            animConfig: {
                width, height, frameWidth, frameHeight,
                framesPerRow: 2,
                fps: 0,
                totalFrames: 2,
                x, y,
                animations: {
                    normal: { start: 0, end: 0 },
                    hover: { start: 1, end: 1 }
                }
            }
        });
    }

    _clearAnimProps(obj) {
        this._animProps.forEach(prop => delete obj[prop]);
    }

    _initAssets() {
        this.STREAM_MAIN_MENU = Assets.sound(`${ASSETS_PATH.SOUNDS}/main_menu.ogg`);
        this.STREAM_MAIN_MENU.loop = true;
        this.SFX_CLICK = Assets.sound(`${ASSETS_PATH.SOUNDS}/click.adp`);

        this.BACKGROUND = Assets.image(`${ASSETS_PATH.UI}/background.png`, {
            optimize: true,
            animConfig: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }
        });
        
        this.LOGO_ARMOR = Assets.image(`${ASSETS_PATH.UI}/armor_logo.png`, { optimize: true });
        
        this.BG_BLUE_GUY = Assets.image(`${ASSETS_PATH.UI}/blue_guy.png`, {
            optimize: true,
            animConfig: { x: -195 }
        });
        
        this.BG_WHITE_GUY = Assets.image(`${ASSETS_PATH.UI}/white_guy.png`, {
            optimize: true,
            animConfig: { x: SCREEN_WIDTH }
        });

        const centerX = (SCREEN_WIDTH - 250) / 2;
        const baseY = (SCREEN_HEIGHT - 100) / 2 + 24;
        
        this.BTN_PLAY = this._createButton(
            `${ASSETS_PATH.UI}/btn_play.png`, 
            centerX, baseY, 250, 100, 250, 100
        );
        
        this.BTN_MULTIPLAYER = this._createButton(
            `${ASSETS_PATH.UI}/btn_multiplayer.png`,
            (SCREEN_WIDTH - 232) / 2,
            this.BTN_PLAY.y + 104,
            232, 73, 232, 73
        );

        const creditsX = this.BTN_MULTIPLAYER.x - 48;
        const scoresX = this.BTN_MULTIPLAYER.x + this.BTN_MULTIPLAYER.width - 96;
        const bottomY = this.BTN_MULTIPLAYER.y + 97;

        this.BTN_CREDITS = this._createButton(
            `${ASSETS_PATH.UI}/btn_credits.png`,
            creditsX, bottomY, 145, 34, 145, 34
        );
        
        this.BTN_SCORES = this._createButton(
            `${ASSETS_PATH.UI}/btn_scores.png`,
            scoresX, bottomY, 145, 34, 145, 34
        );

        this.CHOOSE_PLAYERS_LABEL = Assets.image(`${ASSETS_PATH.UI}/choose_players.png`, {
            optimize: true,
            animConfig: {
                x: (SCREEN_WIDTH - 293) / 2,
                y: (SCREEN_HEIGHT - 90) / 2
            }
        });
        const mpY = SCREEN_HEIGHT - 228;
        this.BTN_2_PLAYERS = this._createButton(`${ASSETS_PATH.UI}/btn_2_players.png`, 100, mpY, 141, 114, 141, 114);
        this.BTN_3_PLAYERS = this._createButton(`${ASSETS_PATH.UI}/btn_3_players.png`, 241, mpY, 135, 114, 135, 114);
        this.BTN_4_PLAYERS = this._createButton(`${ASSETS_PATH.UI}/btn_4_players.png`, 376, mpY, 140, 114, 140, 114);
        this.BTN_BACK = this._createButton(`${ASSETS_PATH.UI}/btn_back.png`, (SCREEN_WIDTH - 172) / 2, SCREEN_HEIGHT - 98, 172, 49, 172, 49);
    }

    onEnter(fromState) {
        super.onEnter(fromState);
        this._initAssets();
        
        if (!this.STREAM_MAIN_MENU.playing()) this.STREAM_MAIN_MENU.play();
        
        this.BG_BLUE_GUY.x = -this.BG_BLUE_GUY.width;
        this.BG_WHITE_GUY.x = SCREEN_WIDTH;
        this.introAnimationDone = false;
        this.buttons = [this.BTN_PLAY, this.BTN_MULTIPLAYER, this.BTN_CREDITS, this.BTN_SCORES];
        this.multiplayerButtons = [this.BTN_2_PLAYERS, this.BTN_3_PLAYERS, this.BTN_4_PLAYERS, this.BTN_BACK];
        this.selectedIndex = 0;
        this.isMultiplayerMode = false;
    }

    drawBackground() {
        this.BACKGROUND.draw(this.shakeOffsetX, this.shakeOffsetY);
        this.LOGO_ARMOR.draw((SCREEN_WIDTH - this.LOGO_ARMOR.width) / 2 + this.shakeOffsetX, this.shakeOffsetY);

        if (this.isMultiplayerMode && !this.isTransitioning) return;

        const guys = [this.BG_BLUE_GUY, this.BG_WHITE_GUY];
        
        if (!this.isMultiplayerMode && !this.isTransitioning && !this.introAnimationDone) {
            if (!this._introAnimStarted) {
                guys.forEach(g => this._clearAnimProps(g));
                this._introAnimStarted = true;
            }

            const entrySpeed = this.isReturningFromMultiplayer ? this.ANIMATION_SPEED.EXIT_MENU : this.ANIMATION_SPEED.INTRO;

            const targets = [0, SCREEN_WIDTH - this.BG_WHITE_GUY.width];
            const done = guys.map((guy, i) => 
                animateWithEasing(guy, { x: targets[i] }, Easing.linear, entrySpeed)
            );

            if (done.every(Boolean)) {
                this.introAnimationDone = true;
                this._introAnimStarted = false;
                if (!this.skipNextFlash) this.flashRequested = true;
                this.skipNextFlash = false;
            }
        }

        guys.forEach(guy => {
            guy.draw(guy.x + this.shakeOffsetX, SCREEN_HEIGHT - guy.height + this.shakeOffsetY);
        });
    }

    drawButtons() {
        const isMulti = this.isTransitioning && this.targetMode ? this.targetMode === 'multiplayer' : this.isMultiplayerMode;
        const buttons = isMulti ? this.multiplayerButtons : this.buttons;
        
        buttons.forEach((btn, index) => {
            setAnimation(btn, index === this.selectedIndex ? "hover" : "normal");
            animationSprite(btn);
            btn.draw(btn.x + this.shakeOffsetX, btn.y + this.shakeOffsetY);
        });

        if (isMulti) {
            this.CHOOSE_PLAYERS_LABEL.draw(this.CHOOSE_PLAYERS_LABEL.x + this.shakeOffsetX, this.CHOOSE_PLAYERS_LABEL.y + this.shakeOffsetY);
        }
    }

    handleInput() {
        const pad = Gamepad.player(PLAYER_ONE_PORT);
        const stick = pad.leftStick();
        
        const justPressed = {
            up: pad.justPressed(Pads.UP) || (stick.y < -0.5 && pad.justPressed(Pads.L_STICK_UP)),
            down: pad.justPressed(Pads.DOWN) || (stick.y > 0.5 && pad.justPressed(Pads.L_STICK_DOWN)),
            left: pad.justPressed(Pads.LEFT) || (stick.x < -0.5 && pad.justPressed(Pads.L_STICK_LEFT)),
            right: pad.justPressed(Pads.RIGHT) || (stick.x > 0.5 && pad.justPressed(Pads.L_STICK_RIGHT))
        };

        const currentButtons = this.isMultiplayerMode ? this.multiplayerButtons : this.buttons;
        const len = currentButtons.length;
        const isMulti = this.isMultiplayerMode;

        if (justPressed.up) {
            this.selectedIndex = isMulti 
                ? (this.selectedIndex === 3 ? 0 : 3)
                : (this.selectedIndex === 0 ? len - 1 : [1, 0, 1, 1][this.selectedIndex]);
        }
        
        if (justPressed.down) {
            this.selectedIndex = isMulti
                ? (this.selectedIndex < 3 ? 3 : 0)
                : (this.selectedIndex === len - 1 ? 0 : this.selectedIndex === 0 ? 1 : 2);
        }
        
        if (justPressed.left) {
            if (isMulti && this.selectedIndex < 3) this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            else if (!isMulti && this.selectedIndex === 3) this.selectedIndex = 2;
        }
        
        if (justPressed.right) {
            if (isMulti && this.selectedIndex < 3) this.selectedIndex = Math.min(2, this.selectedIndex + 1);
            else if (!isMulti && this.selectedIndex === 2) this.selectedIndex = 3;
        }

        if (pad.justPressed(Pads.CROSS)) this.handleSelection();
    }

    handleTransitions() {
        if (!this.isTransitioning) return;

        if (!this._transitionStarted) {
            [this.BG_BLUE_GUY, this.BG_WHITE_GUY].forEach(g => this._clearAnimProps(g));
            this._transitionStarted = true;
            this.selectedIndex = 0;
        }
        
        const targets = [-this.BG_BLUE_GUY.width, SCREEN_WIDTH];
        const guys = [this.BG_BLUE_GUY, this.BG_WHITE_GUY];
        
        const done = guys.map((guy, i) => 
            animateWithEasing(guy, { x: targets[i] }, Easing.linear, this.ANIMATION_SPEED.EXIT_MULTIPLAYER)
        );

        if (done.every(Boolean)) {
            this.isTransitioning = false;
            this._transitionStarted = false;

            if (this.targetMode === 'multiplayer') {
                this.isMultiplayerMode = true;
            } else if (this.targetMode === 'main_menu') {
                this.isMultiplayerMode = false;
                this.introAnimationDone = false;
                this.skipNextFlash = true;
                this.isReturningFromMultiplayer = true;
            }
            this.targetMode = null;
        }
    }

    handleSelection() {
        if (!this.SFX_CLICK.playing()) this.SFX_CLICK.play();

        if (this.isMultiplayerMode && this.selectedIndex === 3) {
            this.isTransitioning = true;
            this.flashRequested = true;
            this.targetMode = 'main_menu';
            return;
        }

        if (!this.isMultiplayerMode) {
            const actions = [
                () => StateManager.setState(GAME_STATE.LOADING, { targetState: GAME_STATE.SINGLE_PLAYER }),
                () => { this.isTransitioning = true; this.flashRequested = true; this.targetMode = 'multiplayer'; },
                () => StateManager.setState(GAME_STATE.LOADING, { targetState: GAME_STATE.CREDITS }),
                () => StateManager.setState(GAME_STATE.LOADING, { targetState: GAME_STATE.SCORES })
            ];
            actions[this.selectedIndex]();
        }
    }

    handleEffects() {
        if (this.flashRequested) {
            this.flashing = true;
            this.flashStartTime = Date.now();
            
            if (this.isFirstEntry) {
                this.shaking = true;
                this.shakeStartTime = Date.now();
                this.isFirstEntry = false;
            }
            
            this.flashRequested = false;
        }

        if (this.shaking) {
            const elapsed = Date.now() - this.shakeStartTime;
            if (elapsed < this.SHAKE_DURATION) {
                this.shakeOffsetX = (Math.random() - 0.5f) * 2 * this.SHAKE_MAGNITUDE;
                this.shakeOffsetY = (Math.random() - 0.5f) * 2 * this.SHAKE_MAGNITUDE;
            } else {
                this.shaking = false;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    }

    drawEffects() {
        if (!this.flashing) return;
        
        const elapsed = Date.now() - this.flashStartTime;
        if (elapsed >= this.FLASH_DURATION * 2) {
            this.flashing = false;
            return;
        }
        
        const alpha = (elapsed < this.FLASH_DURATION 
            ? elapsed / this.FLASH_DURATION 
            : 1 - (elapsed - this.FLASH_DURATION) / this.FLASH_DURATION) * 72;
        
        Draw.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, Color.new(255, 255, 255, alpha));
    }

    update(deltaTime) {
        if (!this.isActive) return;
        this.handleTransitions();
        this.handleEffects();
        if (!this.isTransitioning) this.handleInput();
    }

    render() {
        if (!this.isActive) return;
        this.drawBackground();
        this.drawButtons();
        this.drawEffects();
    }

    _freeAssets() {
        const paths = [
            `${ASSETS_PATH.SOUNDS}/main_menu.ogg`,
            `${ASSETS_PATH.SOUNDS}/click.adp`,
            ...['background', 'armor_logo', 'blue_guy', 'white_guy', 'btn_play', 
                'btn_multiplayer', 'btn_scores', 'btn_credits', 'choose_players',
                'btn_2_players', 'btn_3_players', 'btn_4_players', 'btn_back']
                .map(f => `${ASSETS_PATH.UI}/${f}.png`)
        ];
        paths.forEach(p => Assets.free(p));
    }

    onExit() {
        super.onExit();
        if (this.STREAM_MAIN_MENU.playing()) this.STREAM_MAIN_MENU.rewind();
        this._freeAssets();
    }
}