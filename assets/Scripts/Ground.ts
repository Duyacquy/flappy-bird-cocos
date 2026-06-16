import { _decorator, Component, Node, Vec3, UITransform, find } from 'cc';
const { ccclass, property } = _decorator;
import { GameCtrl } from './GameCtrl';

@ccclass('Ground')
export class Ground extends Component {
    @property({
        type: Node,
        tooltip: 'First ground'
    })
    public ground1: Node = null!;

    @property({
        type: Node,
        tooltip: 'Second ground'
    })
    public ground2: Node = null!;

    @property({
        type: Node,
        tooltip: 'Third ground'
    })
    public ground3: Node = null!;

    public groundWidth1: number;
    public groundWidth2: number;
    public groundWidth3: number;

    public tempStartLocation1 = new Vec3();
    public tempStartLocation2 = new Vec3();
    public tempStartLocation3 = new Vec3();

    @property({
        type: GameCtrl,
        tooltip: 'Reference to GameCtrl'
    })
    public gameCtrlSpeed: GameCtrl = null!;
    public gameSpeed: number = 0;

    onLoad() {
        if (!this.gameCtrlSpeed) {
            const gameCtrlNode = find('GameCtrl');
            if (gameCtrlNode) {
                this.gameCtrlSpeed = gameCtrlNode.getComponent(GameCtrl) as GameCtrl;
            }
        }
        this.startUp();
    }

    startUp() {
        // Lấy chiều rộng của các mảnh đất
        this.groundWidth1 = this.ground1.getComponent(UITransform)!.width;
        this.groundWidth2 = this.ground2.getComponent(UITransform)!.width;
        this.groundWidth3 = this.ground3.getComponent(UITransform)!.width;

        // Đặt vị trí ban đầu tạm thời
        this.tempStartLocation1.x = 0;
        this.tempStartLocation2.x = this.groundWidth1;
        this.tempStartLocation3.x = this.groundWidth1 + this.groundWidth2;

        // Cập nhật vị trí thực tế
        this.ground1.setPosition(this.tempStartLocation1);
        this.ground2.setPosition(this.tempStartLocation2);
        this.ground3.setPosition(this.tempStartLocation3);
    }

    update(deltaTime: number) {
        // Lấy tốc độ từ GameCtrl
        if (this.gameCtrlSpeed && this.gameCtrlSpeed.isOver) {
            return; // Đứng yên khi game over
        }

        this.gameSpeed = this.gameCtrlSpeed.speed;

        // Lấy vị trí hiện tại
        this.tempStartLocation1 = this.ground1.position;
        this.tempStartLocation2 = this.ground2.position;
        this.tempStartLocation3 = this.ground3.position;

        // Di chuyển về phía bên trái
        this.tempStartLocation1.x -= this.gameSpeed * deltaTime;
        this.tempStartLocation2.x -= this.gameSpeed * deltaTime;
        this.tempStartLocation3.x -= this.gameSpeed * deltaTime;

        const totalWidth = this.groundWidth1 + this.groundWidth2 + this.groundWidth3;

        if (this.tempStartLocation1.x <= -this.groundWidth1) {
            this.tempStartLocation1.x += totalWidth; 
        }
        
        if (this.tempStartLocation2.x <= -this.groundWidth2) {
            this.tempStartLocation2.x += totalWidth;
        }
        
        if (this.tempStartLocation3.x <= -this.groundWidth3) {
            this.tempStartLocation3.x += totalWidth;
        }

        // Cập nhật lại vị trí mới cho các node
        this.ground1.setPosition(this.tempStartLocation1);
        this.ground2.setPosition(this.tempStartLocation2);
        this.ground3.setPosition(this.tempStartLocation3);
    }
}