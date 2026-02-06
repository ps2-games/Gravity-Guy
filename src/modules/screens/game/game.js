import { animationSprite, parallaxHorizontally, setAnimation } from "../../../shared/animation.js"
import Assets from "../../../shared/assets.js"
import Collision from "../../../shared/collision.js"
import { ASSETS_PATH, GAME_STATE, PLAYER_ONE_PORT, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js"
import Gamepad from "../../../shared/gamepad.js"
import ScreenBase from "../../../shared/screenBase.js"
import StateManager from "../../../shared/stateManager.js"
import Player from "../../player/player.js"
import startMission from "../map/mapScreen.js"
import Score from "./score.js"

export default class GameScreen extends ScreenBase {
    constructor() {
        super()
        this.player = null;
        this.isPaused = false;
        this.selectedIndex = 0;
        this.missionStarted = false;
        this.isSoundOn = true;
        this.effectActive = false;
    }

    init() {
        super.init();
    }

    onEnter(fromState) {
        super.onEnter(fromState);
        this._initColliders();
        this._initAssets();
        this.player = new Player({ PLAYER_PORT: PLAYER_ONE_PORT, initialX: 50, initialY: SCREEN_HEIGHT - 120 })
        this.score = new Score(589, -2);
        this.score.start();
        this.font = new Font('assets/font/ethno.ttf');



        if (!this.STREAM_GAME.playing()) {
            this.STREAM_GAME.play();
        }

        setAnimation(this.BTN_RESUME_PAUSE, "hover");
        setAnimation(this.BTN_RETURN_MENU, "normal");
    }

    _initColliders() {
        Collision.register({
            type: 'rect',
            x: 0,
            y: SCREEN_HEIGHT - 50,
            w: SCREEN_WIDTH,
            h: 50,
            layer: 'ground',
            tags: ['ground', 'solid'],
            static: true
        });

        Collision.register({
            type: 'rect',
            x: 0,
            y: 0,
            w: SCREEN_WIDTH,
            h: 50,
            layer: 'ground',
            tags: ['ground', 'solid'],
            static: true
        });
    }

    _initAssets() {

        this.HUD_SCORE = Assets.image(`${ASSETS_PATH.SCORE}/HUD.png`);

        this.STREAM_GAME = Assets.sound(`${ASSETS_PATH.SOUNDS}/game.ogg`)
        this.STREAM_GAME.loop = true;

        this.SFX_CLICK = Assets.sound(`${ASSETS_PATH.SOUNDS}/click.adp`);

        this.BACKGROUND = Assets.image(`${ASSETS_PATH.PARALLAX}/background.png`)
        const BACKGROUND_ORIGINAL_SIZE = { w: this.BACKGROUND.width, h: this.BACKGROUND.height }
        this.BACKGROUND.width = SCREEN_WIDTH;
        this.BACKGROUND.height = SCREEN_HEIGHT;

        const scaleX = this.BACKGROUND.width / BACKGROUND_ORIGINAL_SIZE.w;
        const scaleY = this.BACKGROUND.height / BACKGROUND_ORIGINAL_SIZE.h;

        this.BG_CITY_FRONT = Assets.image(`${ASSETS_PATH.PARALLAX}/city_front.png`)
        this.BG_CITY_FRONT.width = this.BG_CITY_FRONT.width * scaleX;
        this.BG_CITY_FRONT.height = this.BG_CITY_FRONT.height * scaleY;
        this.BG_CITY_FRONT.x = 0;
        this.BG_CITY_FRONT.y = SCREEN_HEIGHT - this.BG_CITY_FRONT.height;
        this.BG_CITY_FRONT.parallaxSpeed = 0.75;

        this.BG_CITY_BACK = Assets.image(`${ASSETS_PATH.PARALLAX}/city_back.png`)
        this.BG_CITY_BACK.width = this.BG_CITY_BACK.width * scaleX;
        this.BG_CITY_BACK.height = this.BG_CITY_BACK.height * scaleY;
        this.BG_CITY_BACK.x = 0;
        this.BG_CITY_BACK.y = this.BG_CITY_FRONT.y + 14;
        this.BG_CITY_BACK.parallaxSpeed = 0.35

        this.BG_LIGHT = Assets.image(`${ASSETS_PATH.PARALLAX}/light.png`)
        this.BG_LIGHT.width = this.BG_LIGHT.width * scaleX;
        this.BG_LIGHT.height = this.BG_LIGHT.height * scaleY;
        this.BG_LIGHT.x = 24;
        this.BG_LIGHT.y = SCREEN_HEIGHT - (this.BG_LIGHT.height * 0.95)

        this.BG_TOP_FIRST = Assets.image(`${ASSETS_PATH.PARALLAX}/top_first.png`)
        this.BG_TOP_FIRST.width = this.BG_TOP_FIRST.width * scaleX;
        this.BG_TOP_FIRST.height = this.BG_TOP_FIRST.height * scaleY;
        this.BG_TOP_FIRST.y = 0
        this.BG_TOP_FIRST.x = 0
        this.BG_TOP_FIRST.parallaxSpeed = 0.5;
        this.BG_TOP_FIRST.gap = 222;
        this.BG_TOP_FIRST.coverScreen = false;

        this.BG_TOP_THIRD = Assets.image(`${ASSETS_PATH.PARALLAX}/top_third.png`)
        this.BG_TOP_THIRD.width = this.BG_TOP_THIRD.width * scaleX;
        this.BG_TOP_THIRD.height = this.BG_TOP_THIRD.height * scaleY;
        this.BG_TOP_THIRD.x = 0;
        this.BG_TOP_THIRD.y = 0;
        this.BG_TOP_THIRD.parallaxSpeed = 0.25;

        this.BG_TOP_SECOND = Assets.image(`${ASSETS_PATH.PARALLAX}/top_second.png`)
        this.BG_TOP_SECOND.width = this.BG_TOP_SECOND.width * scaleX;
        this.BG_TOP_SECOND.height = this.BG_TOP_SECOND.height * scaleY;
        this.BG_TOP_SECOND.x = this.BG_TOP_FIRST.width + (this.BG_TOP_FIRST.gap / 2) - (this.BG_TOP_SECOND.width / 2);
        this.BG_TOP_SECOND.y = 0;
        this.BG_TOP_SECOND.gap = this.BG_TOP_FIRST.width + this.BG_TOP_FIRST.gap;
        this.BG_TOP_SECOND.parallaxSpeed = 0.5;
        this.BG_TOP_SECOND.coverScreen = false;
        this.BG_TOP_SECOND.numImages = 2;

        this.BG_PAUSE = Assets.image(`${ASSETS_PATH.UI}/bg_pause.png`, {
            optimize: true,
            animConfig: {
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT
            }
        });
        this.BTN_RESUME_PAUSE = Assets.image(`${ASSETS_PATH.UI}/btn_resume.png`, {
            optimize: true,
            animConfig: {
                width: 288,
                frameWidth: 288,
                startx: 0,
                endx: 288,
                height: 85,
                frameHeight: 85,
                starty: 0,
                endy: 85,
                framesPerRow: 2,
                totalFrames: 2,
                fps: 0,
                x: (SCREEN_WIDTH - 288) / 2,
                y: (SCREEN_HEIGHT - 180) / 2,
                animations: {
                    normal: { start: 0, end: 0 },
                    hover: { start: 1, end: 1 }
                }
            }
        })
        this.BTN_RETURN_MENU = Assets.image(`${ASSETS_PATH.UI}/btn_return.png`, {
            optimize: true,
            animConfig: {
                width: 288,
                frameWidth: 288,
                startx: 0,
                endx: 288,
                height: 82,
                frameHeight: 82,
                fps: 0,
                starty: 0,
                endy: 82,
                totalFrames: 2,
                framesPerRow: 2,
                x: (SCREEN_WIDTH - 288) / 2,
                y: this.BTN_RESUME_PAUSE.y + 85,
                animations: {
                    normal: { start: 0, end: 0 },
                    hover: { start: 1, end: 1 }
                }
            }
        })

        this.BTN_SUBMIT_SCORE = Assets.image(`${ASSETS_PATH.SCORE}/submit.png`, {
            optimize: true,
            animConfig: {
                width: 240,
                frameWidth: 115,
                startx: 0,
                endx: 115,
                height: 32,
                frameHeight: 32,
                fps: 0,
                starty: 0,
                endy: 32,
                totalFrames: 2,
                framesPerRow: 2,
                x: 523,
                y: 27,
                animations: {
                    normal: { start: 0, end: 0 },
                    hover: { start: 1, end: 1 }
                }
            }
        });

        this.BTN_VOLUME = Assets.image(`${ASSETS_PATH.SCORE}/btn_volume.png`, {
            optimize: true,
            animConfig: {
                width: 117,
                frameWidth: 39,
                startx: 0,
                endx: 39,
                height: 27,
                frameHeight: 27,
                fps: 0,
                starty: 0,
                endy: 27,
                totalFrames: 3,
                framesPerRow: 3,
                x: 71,
                y: 1,
                animations: {
                    off: { start: 1, end: 1 },
                    on: { start: 2, end: 2 },
                    on_off: { start: 0, end: 0 }
                }
            }
        });
        this.BTN_VOLUME.currentFrame = 2

        this.BTN_PAUSE = Assets.image(`${ASSETS_PATH.SCORE}/pause.png`)

    }

    drawParallaxTop(deltaTime) {
        parallaxHorizontally(this.BG_TOP_THIRD, deltaTime)
        parallaxHorizontally(this.BG_TOP_SECOND, deltaTime)
        parallaxHorizontally(this.BG_TOP_FIRST, deltaTime)
    }

    drawParallaxBottom(deltaTime) {
        parallaxHorizontally(this.BG_CITY_BACK, deltaTime)
        this.BG_LIGHT.draw(this.BG_LIGHT.x, this.BG_LIGHT.y)
        parallaxHorizontally(this.BG_CITY_FRONT, deltaTime)
    }

    handleInput() {
        if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.R1)) {
            Collision.toggleDebug();
        }

        if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.START)) {
            this.isPaused = !this.isPaused;


            if (this.isPaused) {
                if (this.STREAM_GAME.playing()) {
                    this.STREAM_GAME.pause();
                    this.effectActive = true;
                    
                }
                this.selectedIndex = 0;
            } else {
                if (this.isSoundOn && !this.STREAM_GAME.playing()) {
                    this.STREAM_GAME.play()
                    this.effectActive = false;
                }
            }
            

        }

        if (Gamepad.player(PLAYER_ONE_PORT).pressed(Pads.R2)) setAnimation(this.BTN_SUBMIT_SCORE, "hover");
        else setAnimation(this.BTN_SUBMIT_SCORE, "normal");

        if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.SQUARE)) {
            this.volumeAnim = 30;
            this.isSoundOn = !this.isSoundOn;
            this.SFX_CLICK.play();
        }



        if (this.isPaused) {

            if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.UP) && this.selectedIndex === 1) {
                setAnimation(this.BTN_RESUME_PAUSE, "hover");
                setAnimation(this.BTN_RETURN_MENU, "normal");
                this.selectedIndex = 0;
            }

            if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.DOWN) && this.selectedIndex === 0) {
                setAnimation(this.BTN_RETURN_MENU, "hover");
                setAnimation(this.BTN_RESUME_PAUSE, "normal");

                this.selectedIndex = 1;
            }


            if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.CROSS)) {
                if (this.selectedIndex === 0) {
                    this.SFX_CLICK.play();
                    this.isPaused = false;
                    !this.STREAM_GAME.playing() && this.STREAM_GAME.play();
                }

                if (this.selectedIndex === 1) {
                    this.SFX_CLICK.play();
                    StateManager.setState(GAME_STATE.LOADING, { targetState: GAME_STATE.MAIN_MENU })
                }
            }
        }
    }

    drawPauseUI() {
        this.BG_PAUSE.draw(0, 0);

        animationSprite(this.BTN_RESUME_PAUSE);
        this.BTN_RESUME_PAUSE.draw(this.BTN_RESUME_PAUSE.x, this.BTN_RESUME_PAUSE.y);

        animationSprite(this.BTN_RETURN_MENU);
        this.BTN_RETURN_MENU.draw(this.BTN_RETURN_MENU.x, this.BTN_RETURN_MENU.y);
    }



    update(deltaTime) {
        if (!this.isActive) return;

        this.handleInput();

        if (!this.isPaused) {
            if (this.player) {
                this.player.update(deltaTime);
            }
            Collision.check();

            this.score.update(deltaTime);
            this._volumeConfig();
            this._effectButtonPause(deltaTime);
        }
    }

    _effectButtonPause(deltaTime){

        if(!this.effectActive) return;

        this.effectTimer += deltaTime;

        if(this.effectTimer >= this.EFFECT_DURATION){

            this.effectActive = false;
            this.effectTimer = 0

        }

    }

    render() {
        if (!this.isActive) return;


        this.BACKGROUND.draw(0, 0);

        const parallaxDeltaTime = this.isPaused ? 0 : 1;

        this.drawParallaxBottom(parallaxDeltaTime);
        this.drawParallaxTop(parallaxDeltaTime);

        if (!this.missionStarted) {
            const texture = new Image("assets/img/tiles/texture-0.png");
            const texture1 = new Image("assets/img/tiles/texture-1.png");
            const texture2 = new Image("assets/img/tiles/texture-2.png");
            startMission.init(texture, texture1, texture2);
            this.missionStarted = true;
        }
        startMission.draw();
        if (this.player) this.player.draw();
        this.HUD_SCORE.draw(0, 0);
        this.score.draw(this.font);

        animationSprite(this.BTN_SUBMIT_SCORE);
        this.BTN_SUBMIT_SCORE.draw(this.BTN_SUBMIT_SCORE.x, this.BTN_SUBMIT_SCORE.y);

        animationSprite(this.BTN_VOLUME);
        this.BTN_VOLUME.draw(this.BTN_VOLUME.x, this.BTN_VOLUME.y);

        if(this.effectActive) this.BTN_PAUSE.draw(0, 0)

        if (this.isPaused) this.drawPauseUI();


        Collision.renderDebug();
    }

    _volumeConfig() {

        if (this.volumeAnim > 0) {

            this.volumeAnim--;

            let frame;

            if (this.isSoundOn) {

                frame = Math.floor((30 - this.volumeAnim) / 10);

            } else {

                frame = 2 - Math.floor((30 - this.volumeAnim) / 10);

            }

            const names = ['off', 'on_off', 'on'];
            setAnimation(this.BTN_VOLUME, names[frame]);

            if (this.volumeAnim === 0) {

                if (this.isSoundOn) {

                    if (!this.STREAM_GAME.playing()) this.STREAM_GAME.play();

                } else {

                    if (this.STREAM_GAME.playing()) this.STREAM_GAME.pause();

                }
            }
        }
    }


    _freeAssets() {
        Assets.free(`${ASSETS_PATH.SOUNDS}/game.ogg`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/background.png`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/city_front.png`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/city_back.png`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/light.png`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/top_first.png`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/top_third.png`)
        Assets.free(`${ASSETS_PATH.PARALLAX}/top_second.png`)
        Assets.free(`${ASSETS_PATH.UI}/bg_pause.png`)
        Assets.free(`${ASSETS_PATH.UI}/btn_resume.png`)
        Assets.free(`${ASSETS_PATH.UI}/btn_return.png`)
    }

    onExit() {
        super.onExit();
        if (this.STREAM_GAME.playing()) {
            this.STREAM_GAME.pause();
            this.STREAM_GAME.rewind();
            this.STREAM_GAME.free();
        }

        Collision.clear()
        this.player.destroy();
        this.player = null;
        this.isPaused = null;

        this._freeAssets();
    }
}

