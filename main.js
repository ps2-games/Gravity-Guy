import GameScreen from './src/modules/screens/game/game.js';
import LoadingScreen from './src/modules/screens/loading/loading.js';
import MainMenuScreen from './src/modules/screens/main_menu/menu.js';
import { GAME_STATE } from './src/shared/constants.js';
import Gamepad from './src/shared/gamepad.js'
import StateManager from './src/shared/stateManager.js';



Screen.setParam(Screen.DEPTH_TEST_ENABLE, false);

function initializeGame() {
    const mainMenuScreen = new MainMenuScreen();
    const gameScreen = new GameScreen();
    const loadingScreen = new LoadingScreen();

    StateManager.registerScreen(GAME_STATE.MAIN_MENU, mainMenuScreen);
    StateManager.registerScreen(GAME_STATE.SINGLE_PLAYER, gameScreen);
    StateManager.registerScreen(GAME_STATE.LOADING, loadingScreen);

    StateManager.screens.forEach(screen => {
        screen.init();
    });

    StateManager.setState(GAME_STATE.MAIN_MENU);
}

function gameLoop() {
    let lastFrameTime = Date.now();

    while (true) {
        Screen.clear();
        const now = Date.now();
        const deltaTime = (now - lastFrameTime) / 1000;
        lastFrameTime = now;

        Gamepad.update();

        StateManager.update(deltaTime);
        
        StateManager.render();

        Screen.flip();
    }
}

function main() {
    try {
        initializeGame();
        gameLoop();
    } catch (error) {
        console.log("[Game] Fatal error:", error);
        throw error;
    }
}

main();