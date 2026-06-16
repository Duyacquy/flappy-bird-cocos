import { _decorator, Component, Node, CCFloat, Vec3, Animation, RigidBody2D, v2, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;
import { GameCtrl } from './GameCtrl';

@ccclass('Bird')
export class Bird extends Component {
    @property({
        type: CCFloat,
        tooltip: 'Lực đẩy khi chú chim bay lên'
    })
    public jumpForce: number = 5;

    @property({
        type: GameCtrl,
        tooltip: 'Add GameCtrl here'
    })
    public game: GameCtrl = null!;

    public birdAnimation: Animation = null!;
    public birdLocation: Vec3 = null!;
    public hitSomething: boolean = false;
    
    private rb2d: RigidBody2D = null!;
    
    private playBirdAnimation() {
        if (!this.birdAnimation) return;
        
        const clipName = this.birdAnimation.defaultClip?.name || this.getAnyAnimationClipName();
        if (clipName) {
            this.birdAnimation.play(clipName);
        } else {
            this.birdAnimation.play();
        }
    }

    onLoad() {
        this.birdAnimation = this.getComponent(Animation) ?? this.node.getComponentInChildren(Animation)!;
        this.rb2d = this.getComponent(RigidBody2D)!;
    }

    start() {
        this.resetBird();
    }

    private getAnyAnimationClipName(): string | null {
        const clips = this.birdAnimation.getClips?.() ?? [];
        return clips.length > 0 ? clips[0].name : null;
    }

    setGravityActive(active: boolean) {
        if (this.rb2d) {
            this.rb2d.gravityScale = active ? 1.5 : 0;
            
            if (!active) {
                this.rb2d.linearVelocity = v2(0, 0);
            }
        }
    }

    resetBird() {
        this.birdLocation = new Vec3(-150, 0, 0);
        this.node.setPosition(this.birdLocation);
        this.node.angle = 0; // Reset góc nghiêng về nằm ngang
        
        this.hitSomething = false;

        this.setGravityActive(false);

        if (this.rb2d) {
            this.rb2d.linearVelocity = v2(0, 0); // Reset vận tốc vật lý về 0
        }

        this.playBirdAnimation();
    }

    fly() {
        if (this.hitSomething) return;

        this.rb2d.linearVelocity = v2(0, this.jumpForce);
        this.playBirdAnimation();
    }

    update(deltaTime: number) {
        if (this.hitSomething) {
            if (this.birdAnimation && this.birdAnimation.isPlaying) {
                this.birdAnimation.stop();
            }
            return;
        }

        // Lấy vận tốc hiện tại theo trục Y của chú chim
        let velocityY = this.rb2d.linearVelocity.y;

        if (velocityY > 0) {
            this.node.angle = 25;
        } else {
            // Khi đang rơi xuống (vận tốc Y âm): Chúi đầu xuống dưới (tối đa tầm -70 độ đến -90 độ)
            // Vận tốc rơi càng nhanh, góc chúi xuống càng sâu
            let targetAngle = velocityY * 10; // Nhân hệ số để góc xoay nhạy hơn theo tốc độ rơi
            
            if (targetAngle < -90) targetAngle = -90; // Giới hạn góc cắm đầu thẳng đứng
            if (targetAngle > 0) targetAngle = 0;

            // Làm mượt góc nghiêng khi chuyển từ bay sang rơi bằng toán học (Linear Interpolation)
            this.node.angle = this.node.angle + (targetAngle - this.node.angle) * 0.1;
        }
    }
}