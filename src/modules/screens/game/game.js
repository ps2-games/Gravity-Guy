import { animationSprite, parallaxHorizontally, setAnimation } from "../../../shared/animation.js"
import Assets from "../../../shared/assets.js"
import Collision from "../../../shared/collision.js"
import { ASSETS_PATH, GAME_STATE, PLAYER_ONE_PORT, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js"
import Gamepad from "../../../shared/gamepad.js"
import ScreenBase from "../screenBase.js";
import StateManager from "../../stateManager/stateManager.js"
import Player from "../../player/player.js"
import TileMapRenderer from "./tileMapRenderer.js"
import Camera from "../../camera/camera.js"

export default class GameScreen extends ScreenBase {
    constructor() {
        super()
        this.player = null;
        this.isPaused = false;
        this.selectedIndex = 0;
        this.camera = new Camera()
        this.groundColliders = []; // Armazenar IDs dos colisores de chão
        this.safeZoneHeight = 100; // Espaço vertical livre no meio da tela
    }

    init() {
        super.init();
    }

    onEnter(fromState) {
        super.onEnter(fromState);
        this._initColliders();
        this._initAssets();
        
        // Posição inicial do jogador
        const initialX = SCREEN_WIDTH / 2;
        const initialY = SCREEN_HEIGHT / 2;
        this.player = new Player({ PLAYER_PORT: PLAYER_ONE_PORT, initialX, initialY })

        const mapData = JSON.parse(std.loadFile(`${ASSETS_PATH.MAPS}/sp1.json`));
        this.tileMapRenderer = new TileMapRenderer(mapData, SCREEN_WIDTH, SCREEN_HEIGHT);

        if (!this.STREAM_GAME.playing()) {
            this.STREAM_GAME.play();
        }

        setAnimation(this.BTN_RESUME_PAUSE, "hover");
        setAnimation(this.BTN_RETURN_MENU, "normal");

        // Configura limites da câmera baseado no tamanho do mapa
        if (this.tileMapRenderer && this.tileMapRenderer.getMapSize) {
            const mapSize = this.tileMapRenderer.getMapSize();
            this.camera.setBounds(0, mapSize.width, 0, mapSize.height);
        }

        // Posiciona a câmera inicialmente no jogador
        this.camera.x = initialX - SCREEN_WIDTH / 2;
        this.camera.y = initialY - SCREEN_HEIGHT / 2;
    }

    _initColliders() {
        // Primeiro, limpa qualquer colisor antigo
        this.groundColliders.forEach(id => Collision.unregister(id));
        this.groundColliders = [];

        // Calcula a posição Y do meio da tela para criar o espaço livre
        const screenCenterY = SCREEN_HEIGHT / 2;
        const safeZoneTop = screenCenterY - this.safeZoneHeight / 2;
        const safeZoneBottom = screenCenterY + this.safeZoneHeight / 2;

        // COLISOR SUPERIOR (acima da zona segura)
        const topColliderId = Collision.register({
            type: 'rect',
            x: 0,
            y: 0,
            w: SCREEN_WIDTH,
            h: safeZoneTop, // Altura até o topo da zona segura
            layer: 'ground',
            tags: ['ground', 'solid', 'top'],
            static: true
        });
        this.groundColliders.push(topColliderId);

        // COLISOR INFERIOR (abaixo da zona segura)
        const bottomColliderId = Collision.register({
            type: 'rect',
            x: 0,
            y: safeZoneBottom,
            w: SCREEN_WIDTH,
            h: SCREEN_HEIGHT - safeZoneBottom, // Altura da parte inferior
            layer: 'ground',
            tags: ['ground', 'solid', 'bottom'],
            static: true
        });
        this.groundColliders.push(bottomColliderId);

        // COLISORES LATERAIS (opcional - se quiser limitar horizontalmente)
        const sideWidth = 50; // Largura dos colisores laterais
        const leftColliderId = Collision.register({
            type: 'rect',
            x: 0,
            y: 0,
            w: sideWidth,
            h: SCREEN_HEIGHT,
            layer: 'wall',
            tags: ['wall', 'solid', 'left'],
            static: true
        });
        this.groundColliders.push(leftColliderId);

        const rightColliderId = Collision.register({
            type: 'rect',
            x: SCREEN_WIDTH - sideWidth,
            y: 0,
            w: sideWidth,
            h: SCREEN_HEIGHT,
            layer: 'wall',
            tags: ['wall', 'solid', 'right'],
            static: true
        });
        this.groundColliders.push(rightColliderId);
    }

    updateCollidersWithCamera() {
        // Atualiza a posição dos colisores para acompanhar a câmera
        // Converte coordenadas da tela para coordenadas do mundo
        const cameraWorldPos = {
            x: this.camera.x,
            y: this.camera.y
        };

        // Calcula as posições Y relativas à câmera
        const screenCenterY = SCREEN_HEIGHT / 2;
        const safeZoneTop = screenCenterY - this.safeZoneHeight / 2;
        const safeZoneBottom = screenCenterY + this.safeZoneHeight / 2;

        // Atualiza cada colisor
        this.groundColliders.forEach((id, index) => {
            const collider = Collision.get(id);
            if (!collider) return;

            // Calcula nova posição baseada no tipo de colisor
            let newX = cameraWorldPos.x;
            let newY = cameraWorldPos.y;
            let newW = collider.w;
            let newH = collider.h;

            if (collider.tags.includes('top')) {
                // Colisor superior: posição Y fixa relativa à câmera
                newY = cameraWorldPos.y;
                newH = safeZoneTop;
            } else if (collider.tags.includes('bottom')) {
                // Colisor inferior: posição Y começa após a zona segura
                newY = cameraWorldPos.y + safeZoneBottom;
                newH = SCREEN_HEIGHT - safeZoneBottom;
            } else if (collider.tags.includes('left')) {
                // Colisor esquerdo: posição X fixa
                newX = cameraWorldPos.x;
                newW = 50;
                newH = SCREEN_HEIGHT;
            } else if (collider.tags.includes('right')) {
                // Colisor direito: posição X no lado direito
                newX = cameraWorldPos.x + SCREEN_WIDTH - 50;
                newW = 50;
                newH = SCREEN_HEIGHT;
            }

            // Atualiza o colisor
            Collision.update(id, {
                x: newX,
                y: newY,
                w: newW,
                h: newH
            });
        });
    }

    _initAssets() {
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

        if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.L1)) {
            const stats = this.tileMapRenderer.getStats();
            console.log('TileMapRenderer Stats:', JSON.stringify(stats, null, 2));
            console.log('Camera:', { x: this.camera.x, y: this.camera.y });
            console.log('Player:', this.player.movement.position);
            
            // Mostra info dos colisores
            console.log('Ground colliders:', this.groundColliders.map(id => {
                const collider = Collision.get(id);
                return collider ? { id, tags: collider.tags, x: collider.x, y: collider.y } : null;
            }));
        }

        // MOVIMENTO DO JOGADOR
        if (!this.isPaused) {
            if (Gamepad.player(PLAYER_ONE_PORT).pressed(Pads.RIGHT)) {
                this.player.movement.position.x += 5;
            }

            if (Gamepad.player(PLAYER_ONE_PORT).pressed(Pads.LEFT)) {
                this.player.movement.position.x -= 5;
            }

            if (Gamepad.player(PLAYER_ONE_PORT).pressed(Pads.UP)) {
                this.player.movement.position.y -= 5;
            }

            if (Gamepad.player(PLAYER_ONE_PORT).pressed(Pads.DOWN)) {
                this.player.movement.position.y += 5;
            }
        }

        if (Gamepad.player(PLAYER_ONE_PORT).justPressed(Pads.START)) {
            this.isPaused = !this.isPaused;
            this.STREAM_GAME.playing() ? this.STREAM_GAME.pause() : this.STREAM_GAME.play();

            if (this.isPaused) {
                this.selectedIndex = 0;
                setAnimation(this.BTN_RESUME_PAUSE, "hover");
                setAnimation(this.BTN_RETURN_MENU, "normal");
            }
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

    updateCamera() {
        if (this.player) {
            this.camera.update(this.player.movement.position.x, this.player.movement.position.y);
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        this.handleInput();

        if (!this.isPaused) {
            if (this.player) {
                this.player.update(deltaTime);

                // Atualiza a câmera para seguir o jogador
                this.updateCamera();

                // Atualiza os colisores para acompanhar a câmera
                this.updateCollidersWithCamera();

                if (this.tileMapRenderer) {
                    this.tileMapRenderer.update(this.camera.x, this.camera.y);
                }
            }
            Collision.check();
        }
    }

    render() {
        if (!this.isActive) return;

        this.BACKGROUND.draw(0, 0);

        const parallaxDeltaTime = this.isPaused ? 0 : 1;

        this.drawParallaxBottom(parallaxDeltaTime);
        this.drawParallaxTop(parallaxDeltaTime);

        if (this.tileMapRenderer) {
            this.tileMapRenderer.render(this.camera.x, this.camera.y);
        }

        if (this.player) {
            // CONVERTE coordenadas do mundo para tela usando a câmera
            const screenPos = this.camera.worldToScreen(
                this.player.movement.position.x,
                this.player.movement.position.y
            );
            // Desenha o jogador na posição convertida
            this.player.draw(screenPos.x, screenPos.y);
        }

        // Desenha área segura (para debug visual)
        if (Collision.debugMode) {
            const screenCenterY = SCREEN_HEIGHT / 2;
            const safeZoneTop = screenCenterY - this.safeZoneHeight / 2;
            const safeZoneBottom = screenCenterY + this.safeZoneHeight / 2;
            
            // Desenha a área segura (verde semi-transparente)
            Draw.rect(0, safeZoneTop, SCREEN_WIDTH, this.safeZoneHeight, Color.new(0, 255, 0, 30));
            
            // Linhas demarcando a área segura
            Draw.line(0, safeZoneTop, SCREEN_WIDTH, safeZoneTop, Color.new(0, 255, 0, 150));
            Draw.line(0, safeZoneBottom, SCREEN_WIDTH, safeZoneBottom, Color.new(0, 255, 0, 150));
        }

        if (this.isPaused) this.drawPauseUI();

        Collision.renderDebug();
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
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        this.isPaused = false;
        this.groundColliders = [];

        if (this.tileMapRenderer) {
            this.tileMapRenderer.free();
            this.tileMapRenderer = null;
        }

        this._freeAssets();
    }
}