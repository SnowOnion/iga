class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // 添加背景
        this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(2);
        
        // 添加游戏标题
        const title = this.add.image(this.cameras.main.width / 2, 100, 'title');
        title.setScale(0.8);
        
        // 添加开始游戏按钮
        const startButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'button');
        startButton.setScale(0.5);
        startButton.setInteractive();
        // 移除按钮上的文字
        startButton.setTexture('button');
        
        const startText = this.add.text(startButton.x, startButton.y, '开始游戏', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加关卡选择按钮
        const levelButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 70, 'button');
        levelButton.setScale(0.5);
        levelButton.setInteractive();
        // 移除按钮上的文字
        levelButton.setTexture('button');
        
        const levelText = this.add.text(levelButton.x, levelButton.y, '关卡选择', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加操作说明按钮
        const helpButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 140, 'button');
        helpButton.setScale(0.5);
        helpButton.setInteractive();
        // 移除按钮上的文字
        helpButton.setTexture('button');
        
        const helpText = this.add.text(helpButton.x, helpButton.y, '操作说明', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 按钮点击事件
        startButton.on('pointerdown', () => {
            // 存储当前关卡为第一关
            this.registry.set('currentLevel', 1);
            this.scene.start('GameScene');
        });
        
        levelButton.on('pointerdown', () => {
            // 显示关卡选择界面
            this.showLevelSelection();
        });
        
        helpButton.on('pointerdown', () => {
            // 显示操作说明界面
            this.showHelpScreen();
            
            // 播放按钮点击音效
            this.sound.play('button_click_sound');
        });
        
        // 添加按钮悬停效果
        startButton.on('pointerover', () => {
            startButton.setScale(0.55);
        });
        
        startButton.on('pointerout', () => {
            startButton.setScale(0.5);
        });
        
        levelButton.on('pointerover', () => {
            levelButton.setScale(0.55);
        });
        
        levelButton.on('pointerout', () => {
            levelButton.setScale(0.5);
        });
        
        helpButton.on('pointerover', () => {
            helpButton.setScale(0.55);
        });
        
        helpButton.on('pointerout', () => {
            helpButton.setScale(0.5);
        });
        
        // 播放背景音乐
        if (!this.sound.get('ambience_sound')) {
            this.sound.add('ambience_sound', {
                volume: 0.5,
                loop: true
            }).play();
        }
    }
    
    showHelpScreen() {
        // 创建半透明背景
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0, 0);
        overlay.setInteractive();
        
        // 创建操作说明面板
        const panel = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 500, 350, 0x333333);
        panel.setStrokeStyle(2, 0xffffff);
        
        // 添加标题
        const title = this.add.text(this.cameras.main.width / 2, panel.y - 140, '操作说明', {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加操作说明文本
        const instructions = [
            '• 方向键 ←/→ 或 A/D：左右移动',
            '• 方向键 ↑ 或 W：跳跃',
            '• 空格键 / 鼠标左键：射箭',
            '• 目标：消灭指定数量的敌人通关',
            '• 注意保护自己，不要被敌人碰到'
        ];
        
        let yPos = panel.y - 60;
        instructions.forEach(text => {
            this.add.text(panel.x - 200, yPos, text, {
                font: '20px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            yPos += 40;
        });
        
        // 添加关闭按钮
        const closeButton = this.add.text(panel.x + 230, panel.y - 150, 'X', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        closeButton.setInteractive();
        
        closeButton.on('pointerdown', () => {
            // 移除所有元素
            overlay.destroy();
            panel.destroy();
            title.destroy();
            closeButton.destroy();
            
            // 查找并销毁所有操作说明文本
            this.children.list.forEach(child => {
                if (child.type === 'Text' && (instructions.some(instr => child.text.includes(instr.substring(5))) || 
                    child.text === '• 方向键 ←/→ 或 A/D：左右移动' ||
                    child.text === '• 方向键 ↑ 或 W：跳跃' ||
                    child.text === '• 空格键 / 鼠标左键：射箭' ||
                    child.text === '• 目标：消灭指定数量的敌人通关' ||
                    child.text === '• 注意保护自己，不要被敌人碰到')) {
                    child.destroy();
                }
            });
        });
    }
    
    showLevelSelection() {
        // 创建半透明背景
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        overlay.setOrigin(0, 0);
        overlay.setInteractive();
        
        // 创建关卡选择面板
        const panel = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 400, 300, 0x333333);
        panel.setStrokeStyle(2, 0xffffff);
        
        // 添加标题
        const title = this.add.text(this.cameras.main.width / 2, panel.y - 120, '选择关卡', {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 添加关卡按钮
        const levels = 3; // 总关卡数
        const buttonWidth = 80;
        const spacing = 20;
        const totalWidth = levels * buttonWidth + (levels - 1) * spacing;
        let startX = this.cameras.main.width / 2 - totalWidth / 2 + buttonWidth / 2;
        
        for (let i = 1; i <= levels; i++) {
            const levelButton = this.add.rectangle(startX, panel.y, buttonWidth, buttonWidth, 0x4a4a4a);
            levelButton.setStrokeStyle(2, 0xffffff);
            levelButton.setInteractive();
            
            const levelText = this.add.text(levelButton.x, levelButton.y, i.toString(), {
                font: '32px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // 按钮点击事件
            levelButton.on('pointerdown', () => {
                this.registry.set('currentLevel', i);
                this.scene.start('GameScene');
            });
            
            // 按钮悬停效果
            levelButton.on('pointerover', () => {
                levelButton.setFillStyle(0x666666);
            });
            
            levelButton.on('pointerout', () => {
                levelButton.setFillStyle(0x4a4a4a);
            });
            
            startX += buttonWidth + spacing;
        }
        
        // 添加关闭按钮
        const closeButton = this.add.text(panel.x + 180, panel.y - 130, 'X', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        closeButton.setInteractive();
        
        closeButton.on('pointerdown', () => {
            // 移除所有元素
            overlay.destroy();
            panel.destroy();
            title.destroy();
            closeButton.destroy();
            
            // 查找并销毁所有关卡按钮和文本
            this.children.list.forEach(child => {
                if (child.type === 'Rectangle' || (child.type === 'Text' && child.text !== '开始游戏' && child.text !== '关卡选择')) {
                    child.destroy();
                }
            });
        });
    }
}
