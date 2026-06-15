import { _decorator, Component, Node, CCInteger, Input, input, EventKeyboard, KeyCode, director, Contact2DType, Conllider2D, IPhysic2DContact } from 'cc';
import { Ground } from './Ground';
import { Results } from './Results';
import { Bird } from './Bird';
import { PipePool } from './PipePool';
import { BirdAudio } from './BirdAudio';

const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {
    @property({
        type: Component
    })
    public ground!: Ground;

    @property({
        type: PipePool
    })
    public pipePool!: PipePool;

    @property({
        type: Results
    })
    public result!: Results;

    @property({
        type: BirdAudio
    })
    public clip!: BirdAudio;

    @property({
        type: CCInteger,
        tooltip: 'Change the speed of ground'
    })
    public speed: number = 200;

    @property({
        type: CCInteger,
        tooltip: 'Change the speed of pipes'
    })
    public pileSpeed: number = 200;

    @property({
        type: Bird,
        tooltip: 'The bird'
    })
    public bird!: Bird;

    public isOver!: boolean;

    onLoad() {
        this.initListener();

        this.result.resetScore();

        this.isOver = true;

        director.pause();
    }

    initListener() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        this.node.on(Node.EventType.TOUCH_START, () => {
            this.bird.fly();
        });

        if (this.isOver) {
            this.resetGame();
            this.bird.resetBird();
            this.startGame();
        }

        if (this.isOver == false) {
            this.bird.fly();

            this.clip.onAudioQueue(0);
        }
    }

    startGame() {
        this.result.hideResult();

        director.resume();
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.gameOver();
                break;

            case KeyCode.KEY_P:
                this.startGame();
                break;

            case KeyCode.KEY_S:
                this.result.addScore();
                break;

            case KeyCode.KEY_Q:
                this.resetGame();
                this.bird.resetBird();
                break;
        }
    }

    gameOver() {
        this.result.showResult();

        this.isOver = true;

        this.clip.onAudioQueue(3);

        director.pause();
    }

    resetGame() {
        this.result.resetScore();
        this.pipePool.reset();
        this.isOver = false;
        this.startGame();
    }

    passPipe() {
        this.result.addScore();

        this.clip.onAudioQueue(1);
    }

    createPipe() {
        this.pipePool.addPool();
    }

    contactGroundPipe() {
        let collider = this.bird.getComponent(Conllider2D);

        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Conllider2D, otherCollider: Conllider2D, contact: IPhysic2DContact | null) {
        this.bird.hitSomething = true;

        this.clip.onAudioQueue(2);
    }

    birdStruck() {
        this.contactGroundPipe();

        if (this.bird.hitSomething) {
            this.gameOver();
        }
    }

    update(deltaTime: number) {
        if (this.isOver == false) {
            this.birdStruck();
        }
    }
}


