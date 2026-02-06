export default class Score {

    constructor(x, y){

        this.x = x;
        this.y = y;

        this.score = 0;
        this.highScore = 0;
        this.finished = false;
        this.started = false
        
        this.pointsPerSecond = 10000;
        this.scoreFloat = 0

    }
    
    update(deltaTime){
        
        if(this.started && !this.finished){
            
            this.scoreFloat += this.pointsPerSecond * deltaTime / 1000;
            this.score = Math.floor(this.scoreFloat);
            
        }
        
    }
    
    start(){
    
        this.started = true;
    
    }
        
    
    finishLevel(){
        
        this.finished = true;

    }

    draw(font){

        
        const scoreString = this.score.toString();
        const textWidth = font.getTextSize(scoreString).width;
        
        const drawX = this.x + 50 - textWidth;
        
        font.print(drawX, this.y, scoreString);


    }


}
