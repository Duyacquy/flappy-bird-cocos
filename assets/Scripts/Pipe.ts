import { _decorator, Component, Node, screen, find, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const random = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

@ccclass('Pipe')
export class Pipe extends Component {
    @property({
        type: Node,
        tooltip: "Top pipe"
    })
    public topPipe!: Node;

    @property({
        type: Node,
        tooltip: "Bottom pipe"
    })
    public bottomPipe!: Node;

    public tempStartLocationUp: Vec3 = new Vec3(0, 0, 0);
    public tempStartLocationDown: Vec3 = new Vec3(0, 0, 0);
    public scene = screen.windowSize;

    public game;
    public pipeSpeed!: number;
    public tempSpeed!: number;
    private isPass: boolean = false;

    onLoad() {
        this.game = find("GameCtrl").getComponent("GameCtrl");
        this.pipeSpeed = this.game.pileSpeed;
        this.initPos();
        this.isPass = false;
    }

    initPos() {
        this.tempStartLocationUp.x = (this.topPipe.getComponent(UITransform).width + this.scene.width);
        this.tempStartLocationDown.x = (this.bottomPipe.getComponent(UITransform).width + this.scene.width);

        let gap = random(90, 100);
        let topHeight = random(0, 450);

        this.tempStartLocationUp.y = topHeight;
        this.tempStartLocationDown.y = (topHeight - (gap * 10));

        this.topPipe.setPosition(this.tempStartLocationUp);
        this.bottomPipe.setPosition(this.tempStartLocationDown);
    }

    update(deltaTime: number) {
        if (this.isPass == false && this.topPipe.position.x <= 0) {
            this.isPass = true;

            this.game.passPipe();
        }

        if (this.topPipe.position.x < (0 - this.scene.width)) {
            this.game.createPipe();

            this.destroy();
        }
    }
}


