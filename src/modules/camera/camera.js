import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../shared/constants.js";

export default class Camera {
    constructor() { this.x = 0; this.y = 0; this.smooth = 0.15f; }

    update(targetX, targetY) {
        this.x += (targetX - this.x) * this.smooth;
        this.y += (targetY - this.y) * this.smooth
        const halfWidth = SCREEN_WIDTH / 2;

        if (this.x < halfWidth) this.x = halfWidth;
    }

    worldToScreen(worldX, worldY) {
        return { x: worldX - this.x + SCREEN_WIDTH / 2, y: worldY - this.y + SCREEN_HEIGHT / 2 };
    }

    screenToWorld(screenX) {
        return { x: screenX + this.x - SCREEN_WIDTH / 2 };
    }
}