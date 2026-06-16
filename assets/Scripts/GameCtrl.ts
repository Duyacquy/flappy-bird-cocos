import { _decorator, Component, Node, CCInteger, Input, input, EventKeyboard, KeyCode, director, Contact2DType, Collider2D, IPhysics2DContact } from 'cc';
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

    public isOver: boolean = false;
    public isReady: boolean = true;

    onLoad() {
        this.pipeQueue.initPool();
        this.initListener();
        this.result.resetScore();
        this.isOver = false;
        this.isReady = true;
        this.startUI.active = true;
    }

    initListener() {
        // Lắng nghe sự kiện bàn phím (Dùng để test)
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        
        // Lắng nghe sự kiện chuột/chạm màn hình để điều khiển chú chim bay
        this.node.on(Node.EventType.TOUCH_START, () => {
            if (this.isOver) {
                this.resetGame();
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

    startGame() {
        this.startUI.active = false;
        director.resume();
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

    contactGroundPipe() {
        let collider = this.bird.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.bird.hitSomething = true;
        this.clip.onAudioQueue(2); // Âm thanh Hit khi va chạm
    }

    birdStruck() {
        this.contactGroundPipe();
        if (this.bird.hitSomething) {
            this.gameOver();
        }
    }

    gameOver() {
        this.result.showResult();
        this.isOver = true;
        this.isReady = false;
        this.clip.onAudioQueue(3); // Âm thanh Die khi Game Over

        this.result.showResult();
        director.pause();
    }

    update() {
        if (!this.isOver) {
            this.birdStruck();
        }
    }
}