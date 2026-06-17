import { _decorator, Component, Node, Vec3, UITransform, find, screen } from 'cc';
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

    public groundWidth1: number = 0;
    public groundWidth2: number = 0;
    public groundWidth3: number = 0;

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
        // Lấy kích thước chiều rộng thực tế của màn hình thiết bị hiện tại
        const viewWidth = screen.windowSize.width;

        const transform1 = this.ground1.getComponent(UITransform)!;
        const transform2 = this.ground2.getComponent(UITransform)!;
        const transform3 = this.ground3.getComponent(UITransform)!;

        // ĐẢM BẢO AN TOÀN: Nhân đôi chiều rộng của mảnh đất để nó luôn dư dả, không bao giờ lo bị hở mép
        transform1.width = viewWidth * 1.5;
        transform2.width = viewWidth * 1.5;
        transform3.width = viewWidth * 1.5;

        // Cập nhật lại biến lưu chiều rộng mới
        this.groundWidth1 = transform1.width;
        this.groundWidth2 = transform2.width;
        this.groundWidth3 = transform3.width;

        this.tempStartLocation1.x = -(this.groundWidth1 - viewWidth) / 2;
        this.tempStartLocation1.y = 0;

        // Mảnh 2 nối đuôi ngay sau mảnh 1
        this.tempStartLocation2.x = this.tempStartLocation1.x + this.groundWidth1;
        this.tempStartLocation2.y = 0;

        // Mảnh 3 nối đuôi ngay sau mảnh 2
        this.tempStartLocation3.x = this.tempStartLocation2.x + this.groundWidth2;
        this.tempStartLocation3.y = 0;

        // Cập nhật vị trí thực tế ban đầu
        this.ground1.setPosition(this.tempStartLocation1);
        this.ground2.setPosition(this.tempStartLocation2);
        this.ground3.setPosition(this.tempStartLocation3);
    }

    update(deltaTime: number) {
        if (this.gameCtrlSpeed && this.gameCtrlSpeed.isOver) {
            return; 
        }

        this.gameSpeed = this.gameCtrlSpeed.speed;

        this.tempStartLocation1 = this.ground1.position;
        this.tempStartLocation2 = this.ground2.position;
        this.tempStartLocation3 = this.ground3.position;

        // Di chuyển liên tục về bên trái
        this.tempStartLocation1.x -= this.gameSpeed * deltaTime;
        this.tempStartLocation2.x -= this.gameSpeed * deltaTime;
        this.tempStartLocation3.x -= this.gameSpeed * deltaTime;

        // Tính tổng chiều rộng vòng lặp cuộn nền
        const totalWidth = this.groundWidth1 + this.groundWidth2 + this.groundWidth3;
        const viewWidth = screen.windowSize.width;
        
        // Điều kiện hồi vị: Khi mép phải của mảnh đất đi quá mép trái màn hình
        const leftLimit = -(viewWidth / 2) - (this.groundWidth1 + this.groundWidth2 + this.groundWidth3) / 2;

        if (this.tempStartLocation1.x <= leftLimit) {
            this.tempStartLocation1.x += totalWidth; 
        }
        
        if (this.tempStartLocation2.x <= leftLimit) {
            this.tempStartLocation2.x += totalWidth;
        }
        
        if (this.tempStartLocation3.x <= leftLimit) {
            this.tempStartLocation3.x += totalWidth;
        }

        // Cập nhật lại vị trí mới cho các node
        this.ground1.setPosition(this.tempStartLocation1);
        this.ground2.setPosition(this.tempStartLocation2);
        this.ground3.setPosition(this.tempStartLocation3);
    }
}