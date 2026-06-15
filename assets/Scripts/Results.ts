import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Results')
export class Results extends Component {
    @property({
        type: Label,
        tooltip: 'Current Score'
    })
    public scoreLabel: Label = null!;

    @property({
        type: Label,
        tooltip: 'High Score'
    })
    public highScore: Label = null!;

    @property({
        type: Label,
        tooltip: 'Try Again?'
    })
    public resultEnd: Label = null!;

    maxScore: number = 0;
    currentScore: number = 0;

    updateScore(num: number) {
        this.currentScore = num;
        this.scoreLabel.string = '' + this.currentScore;
    }

    resetScore() {
        this.updateScore(0);
        this.hideResult();
    }

    addScore() {
        this.updateScore(this.currentScore + 1);
    }

    showResult() {
        // Tính toán và cập nhật điểm cao nhất
        this.maxScore = Math.max(this.maxScore, this.currentScore);
        this.highScore.string = 'High Score is: ' + this.maxScore;
        
        // Hiển thị UI kết thúc
        this.highScore.node.active = true;
        this.resultEnd.node.active = true;
    }

    hideResult() {
        this.highScore.node.active = false;
        this.resultEnd.node.active = false;
    }
}