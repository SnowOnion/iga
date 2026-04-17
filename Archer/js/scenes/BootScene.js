class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // 加载加载界面所需资源
        this.load.image('loading-background', 'assets/images/loading-background.png');
        this.load.image('loading-bar', 'assets/images/loading-bar.png');
    }

    create() {
        // 设置游戏基本参数
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        // 进入预加载场景
        this.scene.start('PreloadScene');
    }
}
