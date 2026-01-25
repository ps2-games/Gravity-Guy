import { animationSprite, parallaxHorizontally } from "../../../shared/animation.js"
import Assets from "../../../shared/assets.js"
import { ASSETS_PATH } from "../../../shared/constants.js"
import { BACKGROUND, BG_CITY_BACK, BG_CITY_FRONT, BG_LIGHT, BG_TOP_FIRST, BG_TOP_SECOND, BG_TOP_THIRD } from "./constants.js"

function drawParallaxTop(){
    parallaxHorizontally(BG_TOP_THIRD, 1)
    parallaxHorizontally(BG_TOP_SECOND, 1)
    parallaxHorizontally(BG_TOP_FIRST, 1)
}

function drawParallaxBottom(){
    parallaxHorizontally(BG_CITY_BACK, 1)
    BG_LIGHT.draw(BG_LIGHT.x, BG_LIGHT.y)
    parallaxHorizontally(BG_CITY_FRONT, 1)
}

const player = Assets.image(`${ASSETS_PATH.SPRITES}/blue.png`)
player.startx = 0;
player.endx= 65;
player.starty = 0;
player.endy = 77;
player.loop = true;
player.fps = 12;
player.framesPerRow = 10;
player.frameWidth = 65;
player.frameHeight = 77;
player.totalFrames = 82

function GAME_LOOP() {
    BACKGROUND.draw(0, 0)
    drawParallaxBottom();
    drawParallaxTop();


    animationSprite(player);
    player.draw(0, 0)
}

export default GAME_LOOP