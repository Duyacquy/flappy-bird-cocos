import { _decorator, Component, Node, CCFloat, Vec3, Animation, RigidBody2D, v2, AnimationClip, tween, Collider2D, UITransform } from 'cc';
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
    private idleTween: any = null;
    
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
            this.rb2d.gravityScale = active ? 4.2 : 0;
            
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

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.enabled = true;
        }

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

        this.startIdleAnimation();
    }

    private startIdleAnimation() {
        if (this.idleTween) {
            this.idleTween.stop();
        }

        this.node.setPosition(new Vec3(-160, 0, 0)); //
        this.node.angle = 0;

        this.idleTween = tween(this.node)
            .to(0.5, { position: new Vec3(-160, 15, 0), angle: 10 }, { easing: 'sineInOut' })
            .to(0.5, { position: new Vec3(-160, -8, 0), angle: -10 }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();
    }

    fly() {
        if (this.hitSomething) return;

        if (this.idleTween) {
            this.idleTween.stop();
            this.idleTween = null;
        }

        this.rb2d.linearVelocity = v2(0, this.jumpForce);
        this.playBirdAnimation();
    }

    public hitBounceAndFall() {
        if (this.rb2d) {
            this.rb2d.linearVelocity = v2(0, 0);
            this.rb2d.gravityScale = 0; 
            
            this.rb2d.fixedRotation = true;
            this.rb2d.angularVelocity = 0;
        }
    
        const currentX = this.node.position.x;
        
        let targetGroundY = -335;
        
        if (this.game && this.game.ground) {
            const groundNode = this.game.ground.node;
            
            // 1. CỐ ĐỊNH CHIỀU CAO ĐẤT LÀ 112 PX
            const groundHeight = 112; 
            const halfGroundHeight = groundHeight / 2;
            
            // Tọa độ bề mặt trên cùng của đất
            const groundSurfaceY = groundNode.position.y + halfGroundHeight;
            
       
            const birdTransform = this.getComponent(UITransform);
            let birdOffset = 40; // Con số dự phòng nếu không lấy được transform
            
            // Tọa độ đích: Bề mặt đất + một nửa kích thước chim để giữ tâm chim không bị lún
            targetGroundY = groundSurfaceY + birdOffset;
        }
    
        const peakY = this.node.position.y + 70; 
    
        tween(this.node)
            // GIAI ĐOẠN 1: Nảy vút lên cao 
            .to(0.3, 
                { position: new Vec3(currentX, peakY, 0), angle: 25 }, 
                { easing: 'quadOut' }
            ) 
    
            // GIAI ĐOẠN 2: Rơi tự do và hạ cánh chính xác ngay trên mặt cỏ
            .to(0.85, 
                { position: new Vec3(currentX, targetGroundY, 0), angle: -90 }, 
                { easing: 'quadIn' }
            )
            .start();
    }

    update(deltaTime: number) {
        if (this.game && this.game.isReady) {
            return;
        }

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
            let targetAngle = velocityY * 2;
            
            if (targetAngle < -90) targetAngle = -90;
            if (targetAngle > 0) targetAngle = 0;

            this.node.angle = this.node.angle + (targetAngle - this.node.angle) * 0.1;
        }
    }
}