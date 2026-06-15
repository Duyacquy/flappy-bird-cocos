import { _decorator, Component, Node, Prefab, NodePool, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PipePool')
export class PipePool extends Component {
    @property({
        type: Prefab,
        tooltip: "The pipe prefab"
    })
    public pipePrefab: Prefab = null;

    @property({
        type: Node,
        tooltip: "The parent node of pipes"
    })
    public pipePoolHome: Node = null;

    public pool = new NodePool();
    public createPipe: Node = null;

    initPool() {
        let initCount = 3;

        for (let i = 0; i < initCount; i++) {
            let createPipe = instantiate(this.pipePrefab);

            if (i == 0) {
                this.pipePoolHome.addChild(createPipe);
            } else {
                this.pool.put(createPipe);
            }
        }
    }

    addPool() {
        if (this.pool.size() > 0) {
            this.createPipe = this.pool.get();
        } else {
            this.createPipe = instantiate(this.pipePrefab);
        }

        this.pipePoolHome.addChild(this.createPipe);
    }

    reset() {
        this.pipePoolHome.removeAllChildren();
        this.pool.clear();
        this.initPool();
    }

    update(deltaTime: number) {
        
    }
}


