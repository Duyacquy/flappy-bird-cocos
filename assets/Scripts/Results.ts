import { _decorator, Component, Node, Label, Prefab, instantiate, Sprite, SpriteFrame, Vec3, find, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Results')
export class Results extends Component {
    @property({
        type: Node,
        tooltip: 'Node cha chứa các chữ số hiển thị điểm khi đang chơi (đỉnh màn hình)'
    })
    public scoreContainer: Node = null!;

    @property({
        type: Prefab,
        tooltip: 'Prefab chứa Sprite của 1 chữ số'
    })
    public digitPrefab: Prefab = null!;

    @property({
        type: [SpriteFrame],
        tooltip: 'Kéo thả 10 file ảnh từ 0 đến 9 vào đây theo đúng thứ tự index'
    })
    public numberSprites: SpriteFrame[] = [];

    @property({
        type: Node,
        tooltip: 'Game Over title node'
    })
    public gameOverNode: Node = null!;

    @property({
        type: Node,
        tooltip: 'Panel score node'
    })
    public panelScoreNode: Node = null!;

    @property({
        type: Node,
        tooltip: 'Play again button node'
    })
    public playAgainNode: Node = null!;

    // --- THÊM 2 PROPERTY MỚI ĐỂ KÉO THẢ CONTAINER TRONG PANEL ---
    @property({
        type: Node,
        tooltip: 'Kéo Node PanelCurrentScoreContainer ở trong Panel vào đây'
    })
    public panelCurrentScoreContainer: Node = null!;

    @property({
        type: Node,
        tooltip: 'Kéo Node PanelBestScoreContainer ở trong Panel vào đây'
    })
    public panelBestScoreContainer: Node = null!;

    private currentScore: number = 0;
    private maxScore: number = 0;

    private gameOverOrigin = new Vec3(0, 280, 0);
    private panelScoreOrigin = new Vec3(0, 21, 0);
    private playAgainOrigin = new Vec3(0, -249, 0);

    // HÀM HELPER: Dùng chung để vẽ chữ số PNG vào bất kỳ Container nào
    private renderDigitsToContainer(num: number, container: Node) {
        if (!container || !this.digitPrefab) return;

        const scoreStr = num.toString();
        
        // Ẩn toàn bộ các node cũ trong container đó
        for (let i = 0; i < container.children.length; i++) {
            container.children[i].active = false;
        }

        // Tạo hoặc tái sử dụng node ảnh số
        for (let i = 0; i < scoreStr.length; i++) {
            const digitValue = parseInt(scoreStr[i]);
            let digitNode: Node;

            if (i < container.children.length) {
                digitNode = container.children[i];
                digitNode.active = true;
            } else {
                digitNode = instantiate(this.digitPrefab);
                container.addChild(digitNode);
            }

            const spriteComp = digitNode.getComponent(Sprite);
            if (spriteComp && this.numberSprites[digitValue]) {
                spriteComp.spriteFrame = this.numberSprites[digitValue];
            }
        }
    }

    // Cập nhật điểm số khi ĐANG CHƠI (hiển thị ở đỉnh màn hình)
    updateScore(num: number) {
        this.currentScore = num;
        this.renderDigitsToContainer(this.currentScore, this.scoreContainer);
    }

    onLoad() {
        this.storeOriginalPositions();
        this.hideEndUI();
    }

    private storeOriginalPositions() {
        if (this.gameOverNode) this.gameOverOrigin = this.gameOverNode.position.clone();
        if (this.panelScoreNode) this.panelScoreOrigin = this.panelScoreNode.position.clone();
        if (this.playAgainNode) this.playAgainOrigin = this.playAgainNode.position.clone();
    }

    resetScore() {
        this.updateScore(0);
        this.hideEndUI();
    }

    addScore() {
        this.updateScore(this.currentScore + 1);
    }

    showResult() {
        this.maxScore = Math.max(this.maxScore, this.currentScore);
        this.hideEndUI();

        // Ẩn thanh điểm số khi đang chơi ở trên đỉnh màn hình đi cho đẹp góc nhìn
        if (this.scoreContainer) this.scoreContainer.active = false;

        // Kích hoạt các UI kết quả bình thường
        if (this.gameOverNode) {
            this.gameOverNode.setPosition(this.gameOverOrigin);
            this.gameOverNode.setScale(1, 1, 1);
            this.gameOverNode.active = true;
        }
        if (this.panelScoreNode) {
            this.panelScoreNode.setPosition(this.panelScoreOrigin);
            this.panelScoreNode.setScale(1, 1, 1);
            this.panelScoreNode.active = true;
        }
        if (this.playAgainNode) {
            this.playAgainNode.setPosition(this.playAgainOrigin);
            this.playAgainNode.setScale(1, 1, 1);
            this.playAgainNode.active = true;
        }

        // SỬA TẠI ĐÂY: Vẽ điểm hiện tại xuống dưới SCORE và điểm cao xuống dưới BEST bằng ảnh PNG
        this.renderDigitsToContainer(this.currentScore, this.panelCurrentScoreContainer);
        this.renderDigitsToContainer(this.maxScore, this.panelBestScoreContainer);
    }

    private prepareAnimationNode(node: Node, origin: Vec3, yOffset: number) {
        if (!node) return;
        node.setPosition(origin.x, origin.y + yOffset, origin.z);
    }

    private ensureOpacity(node: Node): never {
        throw new Error('ensureOpacity should not be used anymore');
    }

    hideEndUI() {
        // Hiện lại điểm trên đỉnh khi hồi sinh game mới
        if (this.scoreContainer) this.scoreContainer.active = true;

        if (this.gameOverNode) {
            this.gameOverNode.active = false;
            this.prepareAnimationNode(this.gameOverNode, this.gameOverOrigin, 0);
            this.gameOverNode.setScale(1, 1, 1);
        }
        if (this.panelScoreNode) {
            this.panelScoreNode.active = false;
            this.prepareAnimationNode(this.panelScoreNode, this.panelScoreOrigin, 0);
            this.panelScoreNode.setScale(1, 1, 1);
        }
        if (this.playAgainNode) {
            this.playAgainNode.active = false;
            this.prepareAnimationNode(this.playAgainNode, this.playAgainOrigin, 0);
            this.playAgainNode.setScale(1, 1, 1);
        }
    }

    onPlayAgainClick() {
        const gameCtrlNode = find('GameCtrl');
        if (gameCtrlNode) {
            const gameCtrl = gameCtrlNode.getComponent('GameCtrl') as any;
            if (gameCtrl && typeof gameCtrl.resetGame === 'function') {
                gameCtrl.resetGame();
            }
        }
    }
}