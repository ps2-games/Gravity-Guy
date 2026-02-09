import Assets from "../../../shared/assets.js";
import { ASSETS_PATH, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js";
import ScreenBase from "../screenBase.js";

export default class LoadingScreen extends ScreenBase {
    constructor() {
        super()
    }

    init() {
        super.init()
    }

    onEnter(fromState) {
        super.onEnter(fromState)
        this.loadingScreen = Assets.image(`${ASSETS_PATH.UI}/loading_screen.png`)
        this.loadingScreen.width = SCREEN_WIDTH;
        this.loadingScreen.height = SCREEN_HEIGHT;
    }

    onExit() {
        super.onExit();
    }

    update(deltaTime) {
    }

    render() {
        this.loadingScreen.draw(0, 0)
    }
}