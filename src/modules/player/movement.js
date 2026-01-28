import { PLAYER_MOVEMENT } from "../../shared/constants.js";
import Gamepad from "../../shared/gamepad.js";
import Collision from "../../shared/collision.js";

export default class Movement2D {
    constructor(options) {
        this.position = { x: options.initialX || 0, y: options.initialY || 0 }
        this.velocity = { x: 0, y: 0 }
        this.facingUp = true;
        this.canMove = true;
        this.onGround = false;
        this.touchingWall = false;
        this.wallDirection = 0;
        this.onFlip = options.onFlip;

        this.PLAYER_PORT = options.playerPort;
    }

    isFalling = () => this.facingUp ? this.velocity.y < 0 : this.velocity.y > 0;
    isGrounded = () => this.onGround;
    isWallSliding = () => this.touchingWall && !this.onGround && this.velocity.y > 0;
    isInMaxYVelocity = () => Math.abs(this.velocity.y) <= PLAYER_MOVEMENT.MAX_Y_VELOCITY;
    setCanMove = (canMove) => this.canMove = canMove;
    applyGravity = () => this.velocity.y += PLAYER_MOVEMENT.DEFAULT_GRAVITY * (this.facingUp ? -1 : 1)

    moveForward() {
        this.velocity.x = PLAYER_MOVEMENT.DEFAULT_SPEED;
    }

    checkGroundCollision(colliderId, bounds) {
        const checkY = this.facingUp ? bounds.top - 4 : bounds.bottom;
        const velocityCheck = this.facingUp ? this.velocity.y <= 0 : this.velocity.y >= 0;

        const groundCheck = Collision.checkArea({
            type: 'rect',
            x: bounds.left + 4,
            y: checkY,
            w: (bounds.right - bounds.left) - 8,
            h: 4,
            mask: ['ground', 'platform'],
            excludeId: colliderId
        });

        this.onGround = groundCheck.length > 0 && velocityCheck;

        if (this.onGround && Math.abs(this.velocity.y) > 0) {
            const ground = groundCheck[0].collider;

            if (this.facingUp) {
                this.position.y = ground.y + ground.h + (this.position.y - bounds.top);
            } else {
                this.position.y = ground.y - (bounds.bottom - this.position.y);
            }

            this.velocity.y = 0;
        }

        return this.onGround;
    }

    checkWallCollision(colliderId, bounds) {
        const leftCheck = Collision.checkArea({
            type: 'rect',
            x: bounds.left - 2,
            y: bounds.top + 4,
            w: 2,
            h: (bounds.bottom - bounds.top) - 8,
            mask: ['ground', 'wall', 'platform'],
            excludeId: colliderId
        });
        const rightCheck = Collision.checkArea({
            type: 'rect',
            x: bounds.right,
            y: bounds.top + 4,
            w: 2,
            h: (bounds.bottom - bounds.top) - 8,
            mask: ['ground', 'wall', 'platform'],
            excludeId: colliderId
        });

        this.touchingWall = false;
        this.wallDirection = 0;

        if (leftCheck.length > 0 && this.velocity.x < 0) {
            const validWalls = leftCheck.filter(hit =>
                hit.layer !== 'platform' && !hit.tags.includes('platform')
            );

            if (validWalls.length > 0) {
                const wall = validWalls[0].collider;
                this.position.x = wall.x + wall.w + (this.position.x - bounds.left);
                this.velocity.x = 0;
                this.touchingWall = true;
                this.wallDirection = -1;
            }
        }

        if (rightCheck.length > 0 && this.velocity.x > 0) {
            const validWalls = rightCheck.filter(hit =>
                hit.layer !== 'platform' && !hit.tags.includes('platform')
            );

            if (validWalls.length > 0) {
                const wall = validWalls[0].collider;
                this.position.x = wall.x - (bounds.right - this.position.x);
                this.velocity.x = 0;
                this.touchingWall = true;
                this.wallDirection = 1;
            }
        }

        return this.touchingWall;
    }

    die() {
        if (!this.canMove) return;

        this.canMove = false;
    }

    flip() {
        this.facingUp = !this.facingUp;
        this.velocity.y = -this.velocity.y;
    }

    updatePosition(deltaTime) {
        if (this.isInMaxYVelocity()) this.applyGravity();

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    update(deltaTime) {
        if (this.canMove && Gamepad.player(this.PLAYER_PORT).justPressed(Pads.CROSS)) {
            this.onFlip?.();
            this.flip();
        }

        if (this.isWallSliding()) this.velocity.y = Math.min(this.velocity.y, 0.5);

        this.updatePosition(deltaTime);
    }
}