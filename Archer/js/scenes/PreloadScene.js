class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // 创建加载进度条
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const backgroundImage = this.add.image(width / 2, height / 2, 'loading-background');
        const loadingBar = this.add.image(width / 2, height / 2, 'loading-bar');
        
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // 显示加载进度文本
        const progressText = this.add.text(width / 2, height / 2 - 50, '0%', {
            font: '18px monospace',
            fill: '#ffffff'
        });
        progressText.setOrigin(0.5, 0.5);
        
        // 监听加载进度
        this.load.on('progress', (value) => {
            progressText.setText(parseInt(value * 100) + '%');
            loadingBar.setScale(value, 1);
        });
        
        // 加载完成时移除进度条
        this.load.on('complete', () => {
            progressText.destroy();
            loadingBar.destroy();
            progressBox.destroy();
        });
        
        // 加载游戏资源
        this.loadAssets();
    }

    loadAssets() {
        // 加载精灵表
        this.load.spritesheet('archer', 'assets/images/archer.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('enemies', 'assets/images/enemies.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('arrow', 'assets/images/arrow.png', { frameWidth: 32, frameHeight: 8 });
        this.load.spritesheet('explosion', 'assets/images/explosion.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('hit_effect', 'assets/images/hit_effect.png', { frameWidth: 32, frameHeight: 32 });
        
        // 加载粒子效果
        this.load.image('particle', 'assets/images/particle.png');
        this.load.image('blood_particle', 'assets/images/blood_particle.png');
        this.load.image('arrow_trail', 'assets/images/arrow_trail.png');
        
        // 加载瓦片地图
        this.load.image('tiles', 'assets/images/tileset.png');
        this.load.tilemapTiledJSON('level1', 'assets/levels/level1.json');
        this.load.tilemapTiledJSON('level2', 'assets/levels/level2.json');
        this.load.tilemapTiledJSON('level3', 'assets/levels/level3.json');
        
        // 加载背景
        this.load.image('background', 'assets/images/background.png');
        this.load.image('mountains', 'assets/images/mountains.png');
        
        // 加载UI元素
        this.load.image('button', 'assets/images/button.png');
        this.load.image('title', 'assets/images/title.png');
        this.load.image('game-over', 'assets/images/game-over.png');
        this.load.image('level-complete', 'assets/images/level-complete.png');
        
        // 加载音效
        this.load.audio('shoot_sound', 'assets/audio/shoot.mp3');
        this.load.audio('enemy_hit_sound', 'assets/audio/hit.mp3');
        this.load.audio('enemy_death_sound', 'assets/audio/enemy-death.mp3');
        this.load.audio('player_hit_sound', 'assets/audio/player-hurt.mp3');
        this.load.audio('player_death_sound', 'assets/audio/player-death.mp3');
        this.load.audio('level_complete_sound', 'assets/audio/level-complete.mp3');
        this.load.audio('game_over_sound', 'assets/audio/game-over.mp3');
        // this.load.audio('ambience_sound', 'assets/audio/background-music.mp3');
        // this.load.audio('ambience_sound', 'https://sonion.xyz/res/AncECfull.mp3');
        this.load.audio('ambience_sound', 'assets/audio/AncECfull.mp3');
        this.load.audio('jump_sound', 'assets/audio/jump.mp3');
        this.load.audio('button_click_sound', 'assets/audio/button-click.mp3');
    }

    create() {
        // 创建动画
        this.createAnimations();
        
        // 进入主菜单场景
        this.scene.start('MenuScene');
    }

    createAnimations() {
        // 弓箭手动画 - 适配当前资源
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('archer', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('archer', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('archer', { start: 4, end: 4 }),
            frameRate: 12,
            repeat: 0
        });
        
        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('archer', { start: 5, end: 5 }),
            frameRate: 8,
            repeat: 0
        });
        
        // 敌人动画
        this.anims.create({
            key: 'enemy-walk',
            frames: this.anims.generateFrameNumbers('enemies', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'enemy-attack',
            frames: this.anims.generateFrameNumbers('enemies', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'enemy-hurt',
            frames: this.anims.generateFrameNumbers('enemies', { start: 8, end: 9 }),
            frameRate: 8,
            repeat: 0
        });
        
        this.anims.create({
            key: 'enemy-die',
            frames: this.anims.generateFrameNumbers('enemies', { start: 10, end: 15 }),
            frameRate: 10,
            repeat: 0
        });
        
        // 爆炸动画
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: 0,
            hideOnComplete: true
        });
        
        // 击中效果动画
        this.anims.create({
            key: 'hit_flash',
            frames: this.anims.generateFrameNumbers('hit_effect', { start: 0, end: 5 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
    }
}
