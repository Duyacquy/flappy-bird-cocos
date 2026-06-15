import { _decorator, Component, Node, CCFloat, Vec3, Animation, tween } from 'cc';
const { ccclass, property } = _decorator;
import { GameCtrl } from './GameCtrl';

@ccclass('Bird')
export class Bird extends Component {
    @property({
        type: CCFloat,
        tooltip: 'How high does he fly?'
    })
    public jumpHeight: number = 1.5;

    @property({
        type: CCFloat,
        tooltip: 'How long does he fly?'
    })
    public jumpDuration: number = 1.5;

    @property({
        type: GameCtrl,
        tooltip: 'Add GameCtrl here'
    })
    public game: GameCtrl = null!;

    public birdAnimation: Animation = null!;
    public birdLocation: Vec3 = null!;
    public hitSomething: boolean = false;

    onLoad() {
        this.resetBird();
        this.birdAnimation = this.getComponent(Animation)!;
    }

    resetBird() {
        this.birdLocation = new Vec3(0, 0, 0);
        this.node.setPosition(this.birdLocation);
        this.hitSomething = false;
    }

    fly() {
        // Dừng animation cũ và chạy lại để mượt mà khi nhấn liên tục
        this.birdAnimation.stop();
        
        // Sử dụng Tween để làm mượt chuyển động bay lên
        tween(this.node.position)
            .to(this.jumpDuration, new Vec3(this.node.position.x, this.node.position.y + this.jumpHeight, 0), {
                easing: 'smooth',
                onUpdate: (target: Vec3) => {
                    this.node.position = target;
                }
            })
            .start();

        this.birdAnimation.play();
    }
}