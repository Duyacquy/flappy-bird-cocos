import { _decorator, Component, Node, Prefab, NodePool, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PipePool')
export class PipePool extends Component {
    @property({
        type: Prefab,
        tooltip: 'The prefab of pipes'
    })
    public prefabPipes: Prefab = null!;

    @property({
        type: Node,
        tooltip: 'Where the new pipes go'
    })
    public pipePoolHome: Node = null!;

    public pool = new NodePool();
    public createPipeNode: Node = null!;

    initPool() {
        let initCount = 3;
        for (let i = 0; i < initCount; i++) {
            let createPipe = instantiate(this.prefabPipes);
            if (i === 0) {
                this.pipePoolHome.addChild(createPipe);
            } else {
                this.pool.put(createPipe);
            }
        }
    }

    addPool() {
        if (this.pool.size() > 0) {
            this.createPipeNode = this.pool.get()!;
        } else {
            this.createPipeNode = instantiate(this.prefabPipes);
        }
        this.pipePoolHome.addChild(this.createPipeNode);
    }

    reset() {
        this.pipePoolHome.removeAllChildren();
        this.pool.clear();
        this.initPool();
    }
}