export default class ScreenBase {
    constructor() {
        this.isActive = false;
        this.initialized = false;
    }
    init() {
        if (this.initialized) return;

        this.initialized = true;
    }
    onEnter(fromState) {
        this.isActive = true;

        if (!this.initialized) {
            this.init();
        }
    }
    onExit() { 
        this.isActive = false; 
        this.initialized = false; 
    }
    update(deltaTime) { throw new Error(`Not Implemented`) }
    render() { throw new Error(`Not Implemented`) }
}