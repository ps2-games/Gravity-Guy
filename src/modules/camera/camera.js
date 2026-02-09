import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../shared/constants.js";

export default class Camera {
    constructor() { 
        this.x = 0; 
        this.y = 0; 
        this.smooth = 0.1; // Suavização mais rápida para seguir jogador
        this.bounds = {
            minX: 0,
            maxX: Infinity,
            minY: 0,
            maxY: Infinity
        };
    }

    update(targetX, targetY) {
        // Calcula a posição alvo (centro da tela no jogador)
        const targetCamX = targetX - SCREEN_WIDTH / 2;
        const targetCamY = targetY - SCREEN_HEIGHT / 2;
        
        // Aplica suavização
        this.x += (targetCamX - this.x) * this.smooth;
        this.y += (targetCamY - this.y) * this.smooth;
        
        // Aplica limites
        this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX - SCREEN_WIDTH, this.x));
        this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY - SCREEN_HEIGHT, this.y));
    }

    setBounds(minX, maxX, minY, maxY) {
        this.bounds = { minX, maxX, minY, maxY };
    }

    worldToScreen(worldX, worldY) {
        return { 
            x: worldX - this.x, 
            y: worldY - this.y 
        };
    }

    screenToWorld(screenX, screenY) {
        return { 
            x: screenX + this.x, 
            y: screenY + this.y 
        };
    }
}