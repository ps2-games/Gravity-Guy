export default class Camera {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    follow(player) {
        this.x = player.x - this.width / 2 + player.width / 2;
        this.y = player.y - this.height / 2;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.length) this.x = this.length - this.width;
        
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.height) this.y = this.height - this.height;
        
    }
}

