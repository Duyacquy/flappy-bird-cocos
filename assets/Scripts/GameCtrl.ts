import { _decorator, Component, Node, CCInteger, Input, input, director, Contact2DType, Collider2D, IPhysics2DContact, UIOpacity, tween } from 'cc';
const { ccclass, property } = _decorator;
import { Ground } from './Ground';
import { Results } from './Results';
import { Bird } from './Bird';
import { PipePool } from './PipePool';
import { BirdAudio } from './BirdAudio';

@ccclass('GameCtrl')
export class GameCtrl extends Component {
    @property({
        type: Ground,
        tooltip: 'Add ground component here'
    })
    public ground: Ground = null!;

    @property({
        type: CCInteger,
        tooltip: 'Change the speed of ground'
    })
    public speed: number = 200;

    @property({
        type: CCInteger,
        tooltip: 'Change the speed of pipes'
    })
    public pipeSpeed: number = 200;

    @property({
        type: Node,
        tooltip: 'Start UI'
    })
    public startUI: Node = null!;

    @property({
        type: Results,
        tooltip: 'Add results here'
    })
    public result: Results = null!;

    @property({
        type: Bird,
        tooltip: 'Add Bird node'
    })
    public bird: Bird = null!;

    @property({
        type: PipePool,
        tooltip: 'Add pipe pool here'
    })
    public pipeQueue: PipePool = null!;

    @property({
        type: BirdAudio,
        tooltip: 'Add audio controller'
    })
    public clip: BirdAudio = null!;

    @property({
        type: Node
    })
    public flashWhiteNode: Node = null!;

    @property({
        type: Node
    })
    public flashBlackNode: Node = null!;

    public isOver: boolean = false;
    public isReady: boolean = true;
    private collisionListenerRegistered: boolean = false;

    onLoad() {
        this.pipeQueue.initPool();
        this.initListener();
        this.registerCollisionListener();
        this.result.resetScore();
        this.isOver = false;
        this.isReady = true;
        this.startUI.active = true;
    }

    initListener() {
        // Lắng nghe sự kiện chuột/chạm màn hình để điều khiển chú chim bay
        this.node.on(Node.EventType.TOUCH_START, () => {
            if (this.isOver) {
                return;
            }
            if (this.isReady) {
                this.startGame();
                this.bird.fly();
                this.clip.onAudioQueue(0);
                return;
            }
            this.bird.fly();
            this.clip.onAudioQueue(0); // Âm thanh Swoosh đập cánh
        }, this);
    }

    private registerCollisionListener() {
        if (this.collisionListenerRegistered) return;
        const collider = this.bird.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collisionListenerRegistered = true;
        }
    }

    startGame() {
        this.startUI.active = false;
        this.isReady = false;

        if (this.bird) {
            this.bird.setGravityActive(true);
        }

        this.createPipe();
    }

    resetGame() {
        this.result.resetScore();
        this.pipeQueue.reset();
        this.isOver = false;
        this.isReady = true;
        this.bird.resetBird();
        this.startUI.active = true;
    }

    passPipe() {
        this.result.addScore();
        this.clip.onAudioQueue(1); // Âm thanh Point khi được điểm
    }

    createPipe() {
        if (!this.isReady && !this.isOver) {
            this.pipeQueue.addPool();
        }
    }

    // Wrapper to recycle a pipe node back into the pool
    recyclePipe(node: Node) {
        if (!node) return;
        if (this.pipeQueue && typeof this.pipeQueue.recycle === 'function') {
            this.pipeQueue.recycle(node);
        } else {
            try { node.destroy(); } catch (e) { /* ignore */ }
        }
    }

    private registerContactListener() {
        const collider = this.bird.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.bird.hitSomething || this.isOver) return;
        
        // 1. CHẶN NGAY TỪ ĐẦU: Đặt isOver = true ngay khi vừa chạm cọc để đóng băng hàm update()
        this.isOver = true; 
        this.isReady = false;
        
        this.bird.hitSomething = true;
        this.bird.hitBounce(); 
        this.clip.onAudioQueue(2); // Âm thanh Hit
        
        // 2. Chạy chuỗi hiệu ứng chớp tắt trắng đen nghệ thuật
        this.playFlashGlitchEffect();
    }

    private playFlashGlitchEffect() {
        if (!this.flashWhiteNode || !this.flashBlackNode) {
            this.gameOver();
            return;
        }

        const opacityWhite = this.flashWhiteNode.getComponent(UIOpacity);
        const opacityBlack = this.flashBlackNode.getComponent(UIOpacity);
        if (!opacityWhite || !opacityBlack) {
            this.gameOver();
            return;
        }

        this.flashWhiteNode.active = true;
        this.flashBlackNode.active = true;
        opacityWhite.opacity = 0;
        opacityBlack.opacity = 0;

        // Chuỗi tween mượt mà đan xen trắng - đen
        const tweenWhite = tween(opacityWhite)
            .to(0.04, { opacity: 200 })
            .to(0.04, { opacity: 0 })
            .delay(0.04)
            .to(0.04, { opacity: 180 })
            .to(0.04, { opacity: 0 });

        const tweenBlack = tween(opacityBlack)
            .delay(0.04)
            .to(0.04, { opacity: 240 })
            .to(0.04, { opacity: 0 })

        tween(this.node)
            .parallel(tweenWhite, tweenBlack)
            .call(() => {
                this.flashWhiteNode.active = false;
                this.flashBlackNode.active = false;
            })
        
            .delay(0.5) 
            .call(() => {
                // Hết 1 giây mới chính thức mở bảng điểm
                this.gameOver();
            })
            .start();
    }

    private birdStruck() {
        if (this.bird.hitSomething && !this.isOver) {
            this.gameOver();
        }
    }

    gameOver() {
        this.clip.onAudioQueue(3); // Âm thanh Die khi Game Over
        this.result.showResult();
    }

    update() {
        if (!this.isOver) {
            this.birdStruck();
        }
    }
}