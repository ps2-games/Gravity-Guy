import { GAME_STATE } from "../../shared/constants.js";

class StateManager {
    constructor() {
        if (StateManager.instance) {
            return StateManager.instance;
        }

        this.currentState = null;
        this.previousState = null;
        this.nextState = null;
        this.screens = new Map();
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 1000;

        this.pendingStateChange = null;
        this.stateChangeDelay = 0;
        this.stateChangeTimer = 0;

        StateManager.instance = this;
    }

    registerScreen(state, screen) {
        this.screens.set(state, screen);
    }

    setState(newState, data = {}) {
        if (this.currentState === newState) {
            return;
        }

        if (this.isTransitioning) {
            return;
        }

        this.previousState = this.currentState;
        this.nextState = newState;
        this.isTransitioning = true;
        this.transitionProgress = 0;

        const currentScreen = this.screens.get(this.currentState);
        if (currentScreen && typeof currentScreen.onExit === 'function') {
            currentScreen.onExit();
        }

        if (newState === GAME_STATE.LOADING) {
            this.loadingTarget = data.targetState || GAME_STATE.MAIN_MENU;
            this.loadingData = data;
        }
    }

    update(deltaTime) {
        if (this.isTransitioning) {
            this.transitionProgress += (deltaTime * 1000);

            if (this.transitionProgress >= this.transitionDuration) {
                this.completeTransition();
            }
        }

        if (this.pendingStateChange) {
            this.stateChangeTimer += deltaTime;
            
            if (this.stateChangeTimer >= this.stateChangeDelay) {
                const targetState = this.pendingStateChange.state;
                const data = this.pendingStateChange.data;
                
                this.pendingStateChange = null;
                this.stateChangeTimer = 0;
                this.stateChangeDelay = 0;
                
                this.setState(targetState, data);
            }
        }


        const currentScreen = this.screens.get(this.currentState);
        if (currentScreen && typeof currentScreen.update === 'function') {
            currentScreen.update(deltaTime);
        }
    }

    render() {
        const currentScreen = this.screens.get(this.currentState);
        
        if (currentScreen && typeof currentScreen.render === 'function') {
            currentScreen.render();
        }

        if (this.isTransitioning) {
            this.renderTransition();
        }
    }

    completeTransition() {
        this.isTransitioning = false;
        this.currentState = this.nextState;
        this.nextState = null;
        this.transitionProgress = 0;

        const newScreen = this.screens.get(this.currentState);
        if (newScreen && typeof newScreen.onEnter === 'function') {
            newScreen.onEnter(this.previousState);
        }

        if (this.currentState === GAME_STATE.LOADING && this.loadingTarget) {
            const targetState = this.loadingTarget;
            const loadingData = this.loadingData;
            this.loadingTarget = null;
            this.loadingData = null;
            
            this.scheduleStateChange(targetState, loadingData, 0.1f);
        }
    }

    scheduleStateChange(state, data = {}, delay = 0) {
        this.pendingStateChange = { state, data };
        this.stateChangeDelay = delay;
        this.stateChangeTimer = 0;
    }

    renderTransition() {
        const progress = this.transitionProgress / this.transitionDuration;
        const alpha = Math.min(180, progress * 180);

        const fadeColor = Color.new(0, 0, 0, alpha);
        Draw.rect(0, 0, 640, 512, fadeColor);
    }

    getState() {
        return this.currentState;
    }

    getCurrentScreen() {
        return this.screens.get(this.currentState);
    }

    isInTransition() {
        return this.isTransitioning;
    }
}

export default new StateManager();