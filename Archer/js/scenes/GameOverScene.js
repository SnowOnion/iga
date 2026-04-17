class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        // 获取上一个场景传递的数据
        this.level = data.level;
        this.score = data.score;
    }

    create() {
        // 添加背景
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setOrigin(0, 0);
        
        // 添加游戏结束图像
        const gameOverImage = this.add.image(this.cameras.main.width / 2, 150, 'game-over');
        gameOverImage.setScale(0.7);
        
        // 添加游戏信息
        this.add.text(this.cameras.main.width / 2, 250, `你在第 ${this.level} 关失败了`, {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加得分信息
        this.add.text(this.cameras.main.width / 2, 300, `最终得分: ${this.score}`, {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加重新开始按钮
        const restartButton = this.add.image(this.cameras.main.width / 2, 400, 'button');
        restartButton.setScale(0.5);
        restartButton.setInteractive();
        
        const restartText = this.add.text(restartButton.x, restartButton.y, '重新开始', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加返回菜单按钮
        const menuButton = this.add.image(this.cameras.main.width / 2, 470, 'button');
        menuButton.setScale(0.5);
        menuButton.setInteractive();
        
        const menuText = this.add.text(menuButton.x, menuButton.y, '主菜单', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 按钮点击事件
        restartButton.on('pointerdown', () => {
            // 重新开始当前关卡
            this.registry.set('currentLevel', this.level);
            this.scene.start('GameScene');
        });
        
        menuButton.on('pointerdown', () => {
            // 返回主菜单
            this.scene.start('MenuScene');
        });
        
        // 按钮悬停效果
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.55);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setScale(0.5);
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setScale(0.55);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setScale(0.5);
        });
    }
}
