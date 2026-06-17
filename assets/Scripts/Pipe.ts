import { _decorator, Component, Node, Vec3, screen, UITransform, find } from 'cc';
const { ccclass, property } = _decorator;

// Hàm tạo khoảng cách ngẫu nhiên cho ống nước
const random = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

@ccclass('Pipes')
export class Pipes extends Component {
    @property({
        type: Node,
        tooltip: 'Top Pipe'
    })
    public topPipe: Node = null!;

    @property({
        type: Node,
        tooltip: 'Bottom Pipe'
    })
    public bottomPipe: Node = null!;

    public tempStartLocationUp: Vec3 = new Vec3(0, 0, 0);
    public tempStartLocationDown: Vec3 = new Vec3(0, 0, 0);
    
    public scene = screen.windowSize;
    public hasSpawnedNextPipe: boolean = false;
    public game: any;
    public pipeSpeed: number = 0;
    public tempSpeed: number = 0;
    
    public isPass: boolean = false;

    onLoad() {
        this.game = find("GameCtrl")!.getComponent("GameCtrl");
        this.pipeSpeed = this.game.pipeSpeed;
        this.initPos();
        this.isPass = false;
        this.hasSpawnedNextPipe = false;
    }

    initPos() {
        const topPipeWidth = this.topPipe.getComponent(UITransform)!.width;

        // GIỮ NGUYÊN: Tọa độ sinh trục X theo code gốc của bạn
        const spawnX = 320 + topPipeWidth; 
        this.tempStartLocationUp.x = spawnX;
        this.tempStartLocationDown.x = spawnX;

        let realGap = 200; 
        
        // 2. VỊ TRÍ TRUNG TÂM KHE HỞ (Random trong khoảng giữa màn hình)
        let centerGapY = random(-150, 250); 

        // 3. ĐỌC CHIỀU CAO THỰC TẾ CỦA ỐNG (Sau khi bạn đã tăng lên 900 hoặc 1000 trong Editor)
        const pipeHeight = this.topPipe.getComponent(UITransform)!.height;

        this.tempStartLocationUp.y = centerGapY + (realGap / 2) + pipeHeight / 2;
        
        // Vì bottomPipe neo ở ĐÁY (Y=0) nên tọa độ Y của nó phải bằng: Vị trí khe trung tâm - nửa khe hở - toàn bộ chiều cao ống
        this.tempStartLocationDown.y = centerGapY - (realGap / 2) - pipeHeight / 2;

        // Cập nhật tọa độ cho các node ống nước
        this.topPipe.setPosition(this.tempStartLocationUp.x, this.tempStartLocationUp.y);
        this.bottomPipe.setPosition(this.tempStartLocationDown.x, this.tempStartLocationDown.y);
    }

    update(deltaTime: number) {
        if (this.game && this.game.isOver) {
            return; 
        }
        
        this.tempSpeed = this.pipeSpeed * deltaTime;
        
        this.tempStartLocationDown = this.bottomPipe.position;
        this.tempStartLocationUp = this.topPipe.position;

        this.tempStartLocationDown.x -= this.tempSpeed;
        this.tempStartLocationUp.x -= this.tempSpeed;

        this.bottomPipe.setPosition(this.tempStartLocationDown);
        this.topPipe.setPosition(this.tempStartLocationUp);

        // Tính điểm theo vị trí thực tế của chú chim
        if (!this.isPass && this.game.bird && this.topPipe.position.x <= this.game.bird.node.position.x) {
            this.isPass = true;
            this.game.passPipe();
        }

        const distanceToSpawnNext = 60; 

        if (this.topPipe.position.x < distanceToSpawnNext) {
            if (!this.hasSpawnedNextPipe) { 
                this.game.createPipe();
                this.hasSpawnedNextPipe = true;
            }
        }

        const pipeWidth = this.topPipe.getComponent(UITransform)!.width;
        const viewWidth = screen.windowSize.width;
        
        // ĐIỀU CHỈNH RESPONSIVE: Biên trái động dựa trên kích thước thật của thiết bị để thu hồi ống sạch sẽ khi bỏ Mask
        const leftBoundary = -(viewWidth / 2) - (pipeWidth * 2.5); 

        if (this.topPipe.position.x < leftBoundary) {
            try {
                if (this.game && typeof this.game.recyclePipe === 'function') {
                    this.game.recyclePipe(this.node);
                } else if (this.game && this.game.pipeQueue && typeof this.game.pipeQueue.recycle === 'function') {
                    this.game.pipeQueue.recycle(this.node);
                } else {
                    this.node.destroy();
                }
            } catch (e) {
                this.node.destroy();
            }
        }
    }
}