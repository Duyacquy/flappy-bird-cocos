import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Results')
export class Results extends Component {
    @property({
        type: Label
    })
    public scoreLabel!: Label;

    @property({
        type: Label
    })
    public highScore!: Label;

    @property({
        type: Label
    })
    public resultEnd!: Label;

    maxScore: number = 0;
    currentScore: number = 0;
    
    updateScore(num: number) {
        this.currentScore = num;

        this.scoreLabel.string = ('' + this.currentScore);
    }

    resetScore() {
        this.updateScore(0);

        this.hideResult();

        this.scoreLabel.string = ('' + this.currentScore);
    }

    addScore() {
        this.updateScore(this.currentScore + 1);
    }

    showResult() {
        this.maxScore = Math.max(this.currentScore, this.maxScore);

        this.highScore.string = 'High Score: ' + this.maxScore;
        this.highScore.node.active = true;

        this.resultEnd.node.active = true;
    }

    hideResult() {
        this.highScore.node.active = false;
        this.resultEnd.node.active = false;
    }

    update(deltaTime: number) {
        
    }
}


