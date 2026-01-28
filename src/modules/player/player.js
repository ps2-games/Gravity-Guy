import { SCREEN_HEIGHT, SCREEN_WIDTH, PLAYER_ANIMATION, ASSETS_PATH } from "../../shared/constants.js";
import { animationSprite, setAnimation } from "../../shared/animation.js";
import Movement2D from "./movement.js";
import Collision from "../../shared/collision.js";
import Assets from "../../shared/assets.js";

export default class Player {
    constructor(options = {}) {
        this.PLAYER_PORT = options.PLAYER_PORT || 0;
        this.movement = new Movement2D(options.initialX || SCREEN_WIDTH / 2, options.initialY || 100, this.PLAYER_PORT);
        this._bounds = { left: 0, top: 0, right: 0, bottom: 0 };

        this.spritesheet = Assets.image(`${ASSETS_PATH.SPRITES}/${this.PLAYER_PORT}.png`)
        this.colliderId = null;

        this.HITBOX_WIDTH = 32;

        this.debugColor = Color.new(255, 0, 0, 100);

        this._initAnimations();
        this._initCollider();
    }

    _initAnimations() {
        this.spritesheet.startx = 0;
        this.spritesheet.endx = 65;
        this.spritesheet.starty = 0;
        this.spritesheet.endy = 77;
        this.spritesheet.loop = true;
        this.spritesheet.fps = 16;
        this.spritesheet.framesPerRow = 9;
        this.spritesheet.frameWidth = 65;
        this.spritesheet.frameHeight = 77;
        this.spritesheet.totalFrames = 62
        this.spritesheet.animations = {
            [PLAYER_ANIMATION.INIT]: {
                start: 23,
                end: 43
            },
            [PLAYER_ANIMATION.WALK]: {
                start: 0,
                end: 12
            },
            [PLAYER_ANIMATION.WALK_SLIDE]: {
                start: 44,
                end: 46
            },
            [PLAYER_ANIMATION.FALL]: {
                start: 13,
                end: 22
            },
            [PLAYER_ANIMATION.RUN]: {
                start: 47,
                end: 55
            },
            [PLAYER_ANIMATION.DEAD]: {
                start: 56,
                end: 62
            }
        }

        setAnimation(this.spritesheet, PLAYER_ANIMATION.INIT);
    }

    _initCollider() {
        this.colliderId = Collision.register({
            type: 'rect',
            x: this.movement.position.x,
            y: this.movement.position.y,
            w: this.spritesheet.frameWidth,
            h: this.spritesheet.frameHeight,
            layer: 'player',
            mask: ['ground', 'wall', 'platform', 'solid'],
            tags: ['player', 'damageable'],
            data: { entity: this }
        });
    }

    getBounds() {
        this._bounds.left = this.movement.position.x - 20;
        this._bounds.top = this.movement.position.y + 12;
        this._bounds.right = this.movement.position.x + 20;
        this._bounds.bottom = this.movement.position.y + 70;

        return this._bounds;
    }

    updateAnimation() {
        if (!this.movement.canMove) setAnimation(this.spritesheet, PLAYER_ANIMATION.DEAD);
        else if (this.movement.isWallSliding()) setAnimation(this.spritesheet, PLAYER_ANIMATION.WALK_SLIDE);
        else if (this.movement.isFalling()) setAnimation(this.spritesheet, PLAYER_ANIMATION.FALL);
        else if (this.movement.isGrounded()) setAnimation(this.spritesheet, PLAYER_ANIMATION.WALK);
        else setAnimation(this.spritesheet, PLAYER_ANIMATION.INIT);
    }

    updateCollider() {
        if (!this.colliderId) return;

        const bounds = this.getBounds();

        Collision.update(this.colliderId, {
            x: bounds.left,
            y: bounds.top,
            w: this.HITBOX_WIDTH,
            h: bounds.bottom - bounds.top
        });
    }

    drawCollisionBox() {
        const bounds = this.getBounds();

        Draw.quad(
            bounds.left, bounds.top,
            bounds.right, bounds.top,
            bounds.right, bounds.bottom,
            bounds.left, bounds.bottom,
            this.debugColor
        );
    }

    draw(deltaTime) {
        if (this.shouldRemove()) return;

        this.spritesheet.deltaTime = deltaTime;
        animationSprite(this.spritesheet);

        this.spritesheet.facingUp = this.movement.facingUp;
        this.spritesheet.draw(
            Math.fround(this.movement.position.x - this.spritesheet.width / 2),
            this.movement.position.y
        );

        //this.drawCollisionBox();
    }

    update(deltaTime) {
        this.movement.update(deltaTime);
        const bounds = this.getBounds();

        if (this.movement.canMove) {
            this.movement.checkWallCollision(this.colliderId, bounds);
            this.movement.checkGroundCollision(this.colliderId, bounds);
        }

        this.updateCollider(bounds);

        this.updateAnimation();
        this.draw(deltaTime);
    }

    destroy() {
        if (this.colliderId !== null) {
            Collision.unregister(this.colliderId);
            this.colliderId = null;
        }

        this.spritesheet = null;
        this.movement = null;
        this.debugColor = null;

        Assets.free(`${ASSETS_PATH.SPRITES}/${this.PLAYER_PORT}.png`)
    }

    shouldRemove() {
        if (this.movement.canMove) return false;

        return this.movement.position.y > SCREEN_HEIGHT ||
            Math.abs(this.movement.position.x) > SCREEN_WIDTH + 100;
    }
}