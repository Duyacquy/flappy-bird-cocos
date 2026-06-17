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

        container.removeAllChildren();
        
        const scoreStr = num.toString();
        
        for (let i = 0; i < container.children.length; i++) {
            container.children[i].active = false;
        }

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
        
        // Dừng toàn bộ các tween cũ đang chạy dở trên 3 node UI này (nếu có) để tránh xung đột
        if (this.gameOverNode) tween(this.gameOverNode).stop();
        if (this.panelScoreNode) tween(this.panelScoreNode).stop();
        if (this.playAgainNode) tween(this.playAgainNode).stop();

        // 1. Ẩn thanh điểm số đỉnh màn hình lúc đang chơi đi
        if (this.scoreContainer) this.scoreContainer.active = false;

        // 2. Vẽ điểm số vào các panel container trước khi xuất hiện
        this.renderDigitsToContainer(this.currentScore, this.panelCurrentScoreContainer);
        this.renderDigitsToContainer(this.maxScore, this.panelBestScoreContainer);

        // Khoảng cách Y kéo lùi xuống để chuẩn bị hiệu ứng bay từ dưới lên (ví dụ lùi xuống 600 pixel)
        const dropYOffset = -900;

        // 3. Đặt các node UI vào vị trí chuẩn bị xuất phát (nằm ẩn phía dưới) và kích hoạt active
        if (this.gameOverNode) {
            this.gameOverNode.setPosition(this.gameOverOrigin.x, this.gameOverOrigin.y + dropYOffset, this.gameOverOrigin.z);
            this.gameOverNode.active = true;
        }
        if (this.panelScoreNode) {
            this.panelScoreNode.setPosition(this.panelScoreOrigin.x, this.panelScoreOrigin.y + dropYOffset, this.panelScoreOrigin.z);
            this.panelScoreNode.active = true;
        }
        if (this.playAgainNode) {
            this.playAgainNode.setPosition(this.playAgainOrigin.x, this.playAgainOrigin.y + dropYOffset, this.playAgainOrigin.z);
            this.playAgainNode.active = true;
        }

        // 4. BIỂU DIỄN CHUỖI TWEEN TUẦN TỰ
        tween(this.gameOverNode)
            .to(0.9, { position: this.gameOverOrigin }, { easing: 'backOut' })
            .call(() => {
                tween(this.panelScoreNode)
                    .to(0.9, { position: this.panelScoreOrigin }, { easing: 'backOut' })
                    .start();

                // Nút bấm Play Again bay lên đồng thời
                tween(this.playAgainNode)
                    .to(0.9, { position: this.playAgainOrigin }, { easing: 'backOut' })
                    .start();
            })
            .start();
    }

    private prepareAnimationNode(node: Node, origin: Vec3, yOffset: number) {
        if (!node) return;
        node.setPosition(origin.x, origin.y + yOffset, origin.z);
    }

    hideEndUI() {
        if (this.gameOverNode) tween(this.gameOverNode).stop();
        if (this.panelScoreNode) tween(this.panelScoreNode).stop();
        if (this.playAgainNode) tween(this.playAgainNode).stop();

        if (this.scoreContainer) this.scoreContainer.active = true;

        if (this.gameOverNode) {
            this.gameOverNode.active = false;
            this.prepareAnimationNode(this.gameOverNode, this.gameOverOrigin, 0);
        }
        if (this.panelScoreNode) {
            this.panelScoreNode.active = false;
            this.prepareAnimationNode(this.panelScoreNode, this.panelScoreOrigin, 0);
        }
        if (this.playAgainNode) {
            this.playAgainNode.active = false;
            this.prepareAnimationNode(this.playAgainNode, this.playAgainOrigin, 0);
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