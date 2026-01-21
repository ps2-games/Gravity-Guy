import GAME_LOOP from './src/modules/screens/game/game.js';
import MAIN_MENU_LOOP from './src/modules/screens/main_menu/menu.js';
import Gamepad from './src/shared/gamepad.js'

// const ARMOR_INTRO = new Video("./assets/video/armor.m2v");

Screen.setParam(Screen.DEPTH_TEST_ENABLE, false);

while (true) {
    Screen.clear();
    Gamepad.update();

    // if (ARMOR_INTRO.ready) {
    //     if (!ARMOR_INTRO.playing) {
    //         ARMOR_INTRO.play();
    //     }
    //     ARMOR_INTRO.update();

    //     ARMOR_INTRO.draw(0, 0, 640, 512);
    // }

    // if (ARMOR_INTRO.ended) {
    //     ARMOR_INTRO.free();

    //     MAIN_MENU_LOOP();
    // }

    // MAIN_MENU_LOOP();
    GAME_LOOP();

    Screen.flip();
}