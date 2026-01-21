import Assets from "../../../shared/assets.js"
import { ASSETS_PATH, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js"

const BACKGROUND = Assets.image(`${ASSETS_PATH.PARALLAX}/background.png`)
BACKGROUND.width = SCREEN_WIDTH;
BACKGROUND.height = SCREEN_HEIGHT;

const BG_CITY_FRONT = Assets.image(`${ASSETS_PATH.PARALLAX}/city_front.png`)
BG_CITY_FRONT.x = 0;
BG_CITY_FRONT.y = SCREEN_HEIGHT - BG_CITY_FRONT.height;
BG_CITY_FRONT.parallaxVel = 0.75f;

const BG_CITY_BACK = Assets.image(`${ASSETS_PATH.PARALLAX}/city_back.png`)
BG_CITY_BACK.x = 0;
BG_CITY_BACK.y = BG_CITY_FRONT.y + 10;
BG_CITY_BACK.parallaxVel = 0.25f;

const BG_LIGHT = Assets.image(`${ASSETS_PATH.PARALLAX}/light.png`)
BG_LIGHT.y = SCREEN_HEIGHT - (BG_LIGHT.height * 1.2f)

const BG_TOP_FIRST = Assets.image(`${ASSETS_PATH.PARALLAX}/top_first.png`)
BG_TOP_FIRST.y = 0
BG_TOP_FIRST.x = 0
BG_TOP_FIRST.parallaxVel = 1.0f;

const BG_TOP_THIRD = Assets.image(`${ASSETS_PATH.PARALLAX}/top_third.png`)
BG_TOP_THIRD.x = 0;
BG_TOP_THIRD.y = 0;
BG_TOP_THIRD.parallaxVel = 0.25f;

const BG_TOP_SECOND = Assets.image(`${ASSETS_PATH.PARALLAX}/top_second.png`)
BG_TOP_SECOND.x = BG_TOP_THIRD.width * 1.25f;
BG_TOP_SECOND.y = 0;
BG_TOP_SECOND.parallaxVel = 0.5f;

export {
    BG_CITY_BACK,
    BACKGROUND,
    BG_CITY_FRONT,
    BG_LIGHT,
    BG_TOP_FIRST,
    BG_TOP_THIRD,
    BG_TOP_SECOND
}