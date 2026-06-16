import { _decorator, Component, Node, Prefab, NodePool, instantiate, find, Collider2D } from 'cc';
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
        let initCount = 6;
        for (let i = 0; i < initCount; i++) {
            let createPipe = instantiate(this.prefabPipes);
            this.pool.put(createPipe);
        }
    }

    addPool() {
        if (this.pool.size() > 0) {
            this.createPipeNode = this.pool.get()!;
        } else {
            this.createPipeNode = instantiate(this.prefabPipes);
        }
        this.pipePoolHome.addChild(this.createPipeNode);

        // Ensure the Pipes component is initialized/reset when reused
        const pipes = this.createPipeNode.getComponent('Pipes') as any;
        if (pipes) {
            // Ensure it has reference to GameCtrl and current pipeSpeed
            try {
                pipes.game = find('GameCtrl')!.getComponent('GameCtrl');
                pipes.pipeSpeed = pipes.game.pipeSpeed;
            } catch (e) {
                // ignore if find fails in editor context
            }
            pipes.hasSpawnedNextPipe = false;
            pipes.isPass = false;
            // Re-position pipes for new spawn
            if (typeof pipes.initPos === 'function') {
                pipes.initPos();
            }
        }
    }

    reset() {
        this.pipePoolHome.removeAllChildren();
        this.pool.clear();
        this.initPool();
    }

    // Recycle a pipe node back into the pool instead of destroying it
    public recycle(node: Node) {
        if (!node) return;
        try {
            node.removeFromParent();
        } catch (e) {
            // ignore
        }
        this.pool.put(node);
    }
}