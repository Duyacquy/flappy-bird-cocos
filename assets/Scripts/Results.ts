import { _decorator, Component, Node, Label, Prefab, instantiate, Sprite, SpriteFrame, tween, Vec3, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Results')
export class Results extends Component {
    @property({
        type: Node,
        tooltip: 'Node cha chứa các chữ số hiển thị điểm hiện tại (layout nằm ngang)'
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
        type: Label,
        tooltip: 'High Score (Có thể giữ nguyên Label hoặc đổi sau)'
    })
    public highScore: Label = null!;

    @property({
        type: Label,
        tooltip: 'Try Again?'
    })
    public resultEnd: Label = null!;

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

    private currentScore: number = 0;
    private maxScore: number = 0;
    private digitNodesPool: Node[] = []; // Pool nhỏ tự chế để quản lý các Node chữ số hiện tại

    private gameOverOrigin = new Vec3(0, 280, 0);
    private panelScoreOrigin = new Vec3(0, 21, 0);
    private playAgainOrigin = new Vec3(0, -249, 0);

    updateScore(num: number) {
        this.currentScore = num;
        
        // Chuyển số thành chuỗi ký tự (Ví dụ: 105 -> "1", "0", "5")
        const scoreStr = this.currentScore.toString();
        
        // Ẩn toàn bộ các node chữ số cũ đang có trong container về trạng thái chờ
        for (let i = 0; i < this.scoreContainer.children.length; i++) {
            this.scoreContainer.children[i].active = false;
        }

        // Duyệt qua từng ký tự số để hiển thị hình ảnh tương ứng
        for (let i = 0; i < scoreStr.length; i++) {
            const digitValue = parseInt(scoreStr[i]); // Lấy giá trị số (0 -> 9)
            let digitNode: Node;

            // Tái sử dụng Node cũ trong Container nếu có, tránh instantiate liên tục gây lag
            if (i < this.scoreContainer.children.length) {
                digitNode = this.scoreContainer.children[i];
                digitNode.active = true;
            } else {
                // Nếu thiếu Node (ví dụ điểm tăng từ hàng đơn vị lên hàng chục) thì mới tạo mới
                digitNode = instantiate(this.digitPrefab);
                this.scoreContainer.addChild(digitNode);
            }

            // Thay đổi hình ảnh (SpriteFrame) tương ứng với chữ số đó
            const spriteComp = digitNode.getComponent(Sprite);
            if (spriteComp && this.numberSprites[digitValue]) {
                spriteComp.spriteFrame = this.numberSprites[digitValue];
            }
        }
    }

    onLoad() {
        this.storeOriginalPositions();
        this.hideEndUI();
    }

    private storeOriginalPositions() {
        if (this.gameOverNode) {
            this.gameOverOrigin = this.gameOverNode.position.clone();
        }
        if (this.panelScoreNode) {
            this.panelScoreOrigin = this.panelScoreNode.position.clone();
        }
        if (this.playAgainNode) {
            this.playAgainOrigin = this.playAgainNode.position.clone();
        }
    }

    resetScore() {
        this.updateScore(0);
        this.hideResult();
        this.hideEndUI();
    }

    addScore() {
        this.updateScore(this.currentScore + 1);
    }

    showResult() {
        // Simple, immediate display (no animation)
        this.maxScore = Math.max(this.maxScore, this.currentScore);
        this.highScore.string = 'High Score is: ' + this.maxScore;

        this.hideEndUI();

        // Ensure nodes are at their original positions and default scale
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
        // Render scores: current score under SCORE, high score under BEST
        this.updateScore(this.currentScore);
        if (this.highScore) {
            this.highScore.string = String(this.maxScore);
            this.highScore.node.active = true;
        }
        if (this.resultEnd) this.resultEnd.node.active = true;
    }

    // (restoreNodeVisual removed; simple activation used instead)

    private prepareAnimationNode(node: Node, origin: Vec3, yOffset: number) {
        if (!node) return;
        node.setPosition(origin.x, origin.y + yOffset, origin.z);
    }

    private ensureOpacity(node: Node): never {
        throw new Error('ensureOpacity should not be used anymore');
    }

    hideResult() {
        this.highScore.node.active = false;
        this.resultEnd.node.active = false;
    }

    hideEndUI() {
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
        // Tìm Component GameCtrl trong Scene để gọi lệnh reset
        const gameCtrlNode = find('GameCtrl');
        if (gameCtrlNode) {
            const gameCtrl = gameCtrlNode.getComponent('GameCtrl') as any;
            if (gameCtrl && typeof gameCtrl.resetGame === 'function') {
                gameCtrl.resetGame(); // Gọi hàm reset game có sẵn của bạn
            }
        }
    }
}