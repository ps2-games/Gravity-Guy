import Assets from "../../../shared/assets.js";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js";

const STREAM_MAIN_MENU = Assets.sound("./assets/sound/main_menu.ogg")
STREAM_MAIN_MENU.loop = true;

const SFX_CLICK = Assets.sound("./assets/sound/click.adp")

const BACKGROUND = new Image("./assets/img/ui/background.png");
BACKGROUND.width = SCREEN_WIDTH;
BACKGROUND.height = SCREEN_HEIGHT

const LOGO_ARMOR = new Image("./assets/img/ui/armor_logo.png")

const BG_BLUE_GUY = new Image("./assets/img/ui/blue_guy.png");
BG_BLUE_GUY.x = -BG_BLUE_GUY.width
const BG_WHITE_GUY = new Image("./assets/img/ui/white_guy.png");
BG_WHITE_GUY.x = SCREEN_WIDTH

const BTN_PLAY = new Image("./assets/img/ui/btn_play.png");
BTN_PLAY.width = 250;
BTN_PLAY.height = 100;
BTN_PLAY.frameWidth = 250;
BTN_PLAY.frameHeight = 100;
BTN_PLAY.framesPerRow = 2;
BTN_PLAY.fps = 0;
BTN_PLAY.startx = 0;
BTN_PLAY.starty = 0;
BTN_PLAY.endx = BTN_PLAY.width;
BTN_PLAY.endy = BTN_PLAY.height;
BTN_PLAY.x = (SCREEN_WIDTH - BTN_PLAY.width) / 2;
BTN_PLAY.y = (SCREEN_HEIGHT - BTN_PLAY.height) / 2 + 24;
BTN_PLAY.totalFrames = 2;
BTN_PLAY.animations = {
    "normal": {
        start: 0,
        end: 0,
    },
    "hover": {
        start: 1,
        end: 1,
    },
}

const BTN_MULTIPLAYER = new Image("./assets/img/ui/btn_multiplayer.png");
BTN_MULTIPLAYER.width = 232;
BTN_MULTIPLAYER.height = 73;
BTN_MULTIPLAYER.frameWidth = 232;
BTN_MULTIPLAYER.frameHeight = 73;
BTN_MULTIPLAYER.framesPerRow = 2;
BTN_MULTIPLAYER.fps = 0;
BTN_MULTIPLAYER.startx = 0;
BTN_MULTIPLAYER.starty = 0;
BTN_MULTIPLAYER.endx = BTN_MULTIPLAYER.width;
BTN_MULTIPLAYER.endy = BTN_MULTIPLAYER.height;
BTN_MULTIPLAYER.x = (SCREEN_WIDTH - BTN_MULTIPLAYER.width) / 2;
BTN_MULTIPLAYER.y = BTN_PLAY.y + BTN_PLAY.height + 4;
BTN_MULTIPLAYER.totalFrames = 2;
BTN_MULTIPLAYER.animations = {
    "normal": {
        start: 0,
        end: 0,
    },
    "hover": {
        start: 1,
        end: 1,
    },
}

const BTN_SCORES = new Image("./assets/img/ui/btn_scores.png");
BTN_SCORES.width = 145;
BTN_SCORES.height = 34;
BTN_SCORES.frameWidth = 145;
BTN_SCORES.frameHeight = 34;
BTN_SCORES.framesPerRow = 2;
BTN_SCORES.fps = 0;
BTN_SCORES.startx = 0;
BTN_SCORES.starty = 0;
BTN_SCORES.endx = BTN_SCORES.width;
BTN_SCORES.endy = BTN_SCORES.height;
BTN_SCORES.x = BTN_MULTIPLAYER.x + BTN_MULTIPLAYER.width - BTN_SCORES.width / 1.5;
BTN_SCORES.y = BTN_MULTIPLAYER.y + BTN_MULTIPLAYER.height + 24;
BTN_SCORES.totalFrames = 2;
BTN_SCORES.animations = {
    "normal": {
        start: 0,
        end: 0,
    },
    "hover": {
        start: 1,
        end: 1,
    },
}

const BTN_CREDITS = new Image("./assets/img/ui/btn_credits.png");
BTN_CREDITS.width = 145;
BTN_CREDITS.height = 34;
BTN_CREDITS.frameWidth = 145;
BTN_CREDITS.frameHeight = 34;
BTN_CREDITS.framesPerRow = 2;
BTN_CREDITS.fps = 0;
BTN_CREDITS.startx = 0;
BTN_CREDITS.starty = 0;
BTN_CREDITS.endx = BTN_CREDITS.width;
BTN_CREDITS.endy = BTN_CREDITS.height;
BTN_CREDITS.x = BTN_MULTIPLAYER.x - BTN_CREDITS.width / 3;
BTN_CREDITS.y = BTN_MULTIPLAYER.y + BTN_MULTIPLAYER.height + 24;
BTN_CREDITS.totalFrames = 2;
BTN_CREDITS.animations = {
    "normal": {
        start: 0,
        end: 0,
    },
    "hover": {
        start: 1,
        end: 1,
    },
}

const FLASH_DURATION = 200;
const SHAKE_DURATION = 200;
const SHAKE_MAGNITUDE = 12;

export {
    SFX_CLICK,
    STREAM_MAIN_MENU,
    BACKGROUND,
    BG_BLUE_GUY,
    BG_WHITE_GUY,
    BTN_CREDITS,
    BTN_MULTIPLAYER,
    BTN_PLAY,
    BTN_SCORES,
    LOGO_ARMOR,
    FLASH_DURATION,
    SHAKE_DURATION,
    SHAKE_MAGNITUDE,

}