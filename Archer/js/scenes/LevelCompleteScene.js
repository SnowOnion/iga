class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super('LevelCompleteScene');
    }

    init(data) {
        // 获取上一个场景传递的数据
        this.level = data.level;
        this.score = data.score;
        this.health = data.health;
    }

    create() {
        // 添加背景
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0);
        
        // 添加关卡完成图像
        const completeImage = this.add.image(this.cameras.main.width / 2, 100, 'level-complete');
        completeImage.setScale(0.7);
        
        // 添加关卡信息
        this.add.text(this.cameras.main.width / 2, 200, `关卡 ${this.level} 完成！`, {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加得分信息
        this.add.text(this.cameras.main.width / 2, 250, `得分: ${this.score}`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加剩余生命值信息
        this.add.text(this.cameras.main.width / 2, 290, `剩余生命值: ${this.health}%`, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加奖励信息
        const bonusScore = this.health * 10;
        this.add.text(this.cameras.main.width / 2, 330, `生命值奖励: +${bonusScore}`, {
            font: '24px Arial',
            fill: '#ffff00'
        }).setOrigin(0.5);
        
        // 更新总分
        const totalScore = this.score + bonusScore;
        this.add.text(this.cameras.main.width / 2, 370, `总分: ${totalScore}`, {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加下一关按钮
        const nextButton = this.add.image(this.cameras.main.width / 2, 450, 'button');
        nextButton.setScale(0.5);
        nextButton.setInteractive();
        
        const nextText = this.add.text(nextButton.x, nextButton.y, '下一关', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加返回菜单按钮
        const menuButton = this.add.image(this.cameras.main.width / 2, 520, 'button');
        menuButton.setScale(0.5);
        menuButton.setInteractive();
        
        const menuText = this.add.text(menuButton.x, menuButton.y, '主菜单', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 按钮点击事件
        nextButton.on('pointerdown', () => {
            // 进入下一关
            this.registry.set('currentLevel', this.level + 1);
            this.scene.start('GameScene');
        });
        
        menuButton.on('pointerdown', () => {
            // 返回主菜单
            this.scene.start('MenuScene');
        });
        
        // 按钮悬停效果
        nextButton.on('pointerover', () => {
            nextButton.setScale(0.55);
        });
        
        nextButton.on('pointerout', () => {
            nextButton.setScale(0.5);
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setScale(0.55);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setScale(0.5);
        });
    }
}
