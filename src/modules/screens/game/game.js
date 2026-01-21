import { BACKGROUND, BG_CITY_BACK, BG_CITY_FRONT, BG_LIGHT, BG_TOP_FIRST, BG_TOP_SECOND, BG_TOP_THIRD } from "./constants.js"

function drawBottomParallax() {
    BG_CITY_BACK.draw(BG_CITY_BACK.x, BG_CITY_BACK.y)
    BG_CITY_BACK.draw(BG_CITY_BACK.x + BG_CITY_BACK.width, BG_CITY_BACK.y)
    BG_LIGHT.draw(24, BG_LIGHT.y)
    BG_CITY_FRONT.draw(BG_CITY_FRONT.x, BG_CITY_FRONT.y)
    BG_CITY_FRONT.draw(BG_CITY_FRONT.x + BG_CITY_FRONT.width, BG_CITY_FRONT.y)
}

function drawTopParallax(){
    BG_TOP_THIRD.draw(BG_TOP_THIRD.x, BG_TOP_THIRD.y)
    BG_TOP_THIRD.draw(BG_TOP_THIRD.x + BG_TOP_THIRD.width, BG_TOP_THIRD.y)
    BG_TOP_SECOND.draw(BG_TOP_SECOND.x, BG_TOP_SECOND.y)
    BG_TOP_FIRST.draw(BG_TOP_FIRST.x, BG_TOP_FIRST.y)
    BG_TOP_FIRST.draw(BG_TOP_FIRST.x + (BG_TOP_FIRST.width * 1.65f), BG_TOP_FIRST.y)
}

function GAME_LOOP() {
    BACKGROUND.draw(0, 0)
    drawBottomParallax();
    drawTopParallax();
}

export default GAME_LOOP