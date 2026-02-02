export class Map {

    constructor(x, y, startX, startY, width, height, textureImage) {

        this.x = x;
        this.y = y;

        this.texture = textureImage;

        this.texture.startx = startX;
        this.texture.starty = startY;
        this.texture.endx   = startX + width;
        this.texture.endy   = startY + height;

        this.texture.width  = width;
        this.texture.height = height;

    }

    draw() {

        this.texture.draw(this.x, this.y);
        
    }
}