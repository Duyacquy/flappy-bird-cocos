import { _decorator, Component, Node, CCFloat, Vec3, Animation, RigidBody2D, v2, AnimationClip, tween } from 'cc';
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
        this.birdLocation = new Vec3(-160, 0, 0);
        this.node.setPosition(this.birdLocation);
        this.node.angle = 0;

        this.hitSomething = false;

        if (this.rb2d) {
            this.rb2d.linearVelocity = v2(0, 0);
            this.rb2d.angularVelocity = 0;
            this.rb2d.gravityScale = 0;

            this.rb2d.fixedRotation = false;
        }

        this.setGravityActive(false);

        if (this.birdAnimation && this.birdAnimation.isPlaying) {
            this.birdAnimation.stop();
        }
        this.playBirdAnimation();
    }

    fly() {
        if (this.hitSomething) return;

        this.rb2d.linearVelocity = v2(0, this.jumpForce);
        this.playBirdAnimation();
    }

    hitBounce() {
        if (!this.rb2d) return;

        // 1. Khóa tính năng tự xoay của vật lý để chim không bị nghiêng lệch do va quệt cọc
        this.rb2d.fixedRotation = true;
        this.rb2d.angularVelocity = 0;

        // 2. Triệt tiêu toàn bộ vận tốc cũ (cả X lẫn Y) để chim không bị bay lùi hay trôi ngang
        this.rb2d.linearVelocity = v2(0, 0);

        // 3. Tạo một lực nảy hướng lên trên rõ ràng (bạn có thể tăng từ 6 lên 7-8 nếu muốn nảy cao hơn)
        const bounceForce = 6; 
        this.rb2d.linearVelocity = v2(0, bounceForce);

        // 4. Diễn hoạt góc nghiêng: Nẩy nhẹ góc lên rồi cắm đầu thẳng đứng xuống đất (-90 độ)
        tween(this.node)
            .to(0.1, { angle: 30 }, { easing: 'sineOut' }) // Nhấc mỏ lên nhẹ lúc đang nảy lên
            .delay(0.15)                                    // Giữ trạng thái một chút ở đỉnh nảy
            .to(0.4, { angle: -90 }, { easing: 'sineIn' })  // Chúi đầu thẳng đứng xuống đất cực kỳ đẹp mắt
            .start();
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
            let targetAngle = velocityY * 10;
            
            if (targetAngle < -90) targetAngle = -90;
            if (targetAngle > 0) targetAngle = 0;

            this.node.angle = this.node.angle + (targetAngle - this.node.angle) * 0.1;
        }
    }
}