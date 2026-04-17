class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // 初始化游戏数据
        this.score = 0;
        this.health = 100;
        this.arrows = 10;
        this.currentLevel = this.registry.get('currentLevel') || 1;
        this.enemiesKilled = 0;
        this.totalEnemies = 0;
        this.isGameOver = false;
    }

    create() {
        // 创建背景
        this.createBackground();
        // 加载当前关卡地图
        this.loadLevel();
        // 创建玩家
        this.createPlayer();
        // 创建敌人
        this.createEnemies();
        // 创建UI
        this.createUI();
        // 设置相机跟随玩家
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        // 设置碰撞
        this.setCollisions();
        // 设置输入控制
        this.setInputs();
        // 初始化音效管理器
        this.audioManager = new AudioManager(this);
        // 初始化粒子效果管理器
        this.particleManager = new ParticleManager(this);
        // 播放环境音效
        this.audioManager.playAmbienceSound();
    }

    update() {
        if (this.isGameOver) return;
        
        // 检测跳跃键
        if ((this.cursors.up.isDown || this.keyW.isDown) && this.player.body.onFloor()) {
            this.player.jump();
        }
        
        // 更新玩家
        this.player.update();
        // 更新敌人
        this.enemies.getChildren().forEach(enemy => {
            enemy.update();
        });
        // 检查关卡是否完成
        this.checkLevelComplete();
    }

    createBackground() {
        // 添加远景背景
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0.1)
            .setScale(2);
        // 添加山脉背景
        this.add.image(0, this.cameras.main.height - 300, 'mountains')
            .setOrigin(0, 0)
            .setScrollFactor(0.4)
            .setScale(1.5);
    }

    loadLevel() {
        // 加载地图
        this.map = this.make.tilemap({ key: `level${this.currentLevel}` });
        const tileset = this.map.addTilesetImage('tileset', 'tiles');
        // 创建图层
        this.backgroundLayer = this.map.createLayer('Background', tileset, 0, 0);
        this.platformLayer = this.map.createLayer('Platforms', tileset, 0, 0);
        // 设置碰撞
        this.platformLayer.setCollisionByProperty({ collides: true });
        // 获取玩家起始位置
        const spawnPoint = this.map.findObject('Objects', obj => obj.name === 'Spawn');
        this.spawnX = spawnPoint ? spawnPoint.x : 50;
        this.spawnY = spawnPoint ? spawnPoint.y : 300;
        // 获取敌人位置
        this.enemySpawnPoints = this.map.filterObjects('Objects', obj => obj.name === 'EnemySpawn');
        // 获取关卡目标
        const levelData = this.map.properties || [];
        this.targetEnemies = levelData.find(prop => prop.name === 'targetEnemies')?.value || 5;
    }

    createPlayer() {
        // 创建玩家实例
        this.player = new Player(this, this.spawnX, this.spawnY);
        // 创建箭矢组
        this.arrows = this.physics.add.group({
            classType: Arrow,
            maxSize: 10,
            runChildUpdate: true
        });
    }

    createEnemies() {
        // 创建敌人组
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });
        // 根据关卡难度生成敌人
        this.totalEnemies = this.enemySpawnPoints.length;
        
        // 延迟生成敌人，确保地图已完全加载
        this.time.delayedCall(500, () => {
            this.enemySpawnPoints.forEach(point => {
                // 使用射线检测找到平台顶部位置
                const tileY = this.findPlatformTopAt(point.x);
                console.log("tileY", tileY);
                
                // 如果找到平台，就在平台上方生成敌人
                const spawnY = tileY ? tileY - 20 : point.y;
                没执行到啊
                const enemy = new Enemy(
                    this,
                    point.x,
                    spawnY,
                    this.currentLevel // 传递当前关卡作为难度参数
                );
                this.enemies.add(enemy);
            });
        });
    }
    
    // 不太有用的样子
    findPlatformTopAt(x) {
        // 从上到下射线检测找到平台顶部
        for (let y = 0; y < this.map.heightInPixels; y += 16) {
            const tile = this.map.getTileAtWorldXY(x, y, true, this.cameras.main, 'Platforms');
            if (tile && tile.properties && tile.properties.collides) {
                return y; // 返回平台顶部Y坐标
            }
        }
        return null; // 未找到平台
    }

    createUI() {
        this.uiContainer = this.add.container(0, 0).setScrollFactor(0);
        // 添加生命值显示
        const healthBg = this.add.rectangle(20, 20, 204, 24, 0x000000, 0.7).setOrigin(0, 0);
        const healthLabel = this.add.text(25, 22, '生命值:', { fontSize: '16px', fill: '#ffffff' }).setOrigin(0, 0);
        this.healthBar = this.add.rectangle(100, 22, this.health * 2, 20, 0xff0000).setOrigin(0, 0);
        
        // 添加分数显示
        this.scoreText = this.add.text(20, 50, `分数: ${this.score}`, { fontSize: '20px', fill: '#ffffff' }).setOrigin(0, 0);
        
        // 添加关卡目标显示
        this.targetText = this.add.text(20, 80, `目标: ${this.enemiesKilled}/${this.targetEnemies}`, { fontSize: '20px', fill: '#ffffff' }).setOrigin(0, 0);
        
        // 添加关卡显示
        this.levelText = this.add.text(20, 110, `关卡: ${this.currentLevel}`, { fontSize: '20px', fill: '#ffffff' }).setOrigin(0, 0);
        
        // 添加箭矢数量显示
        const arrowIcon = this.add.image(20, 150, 'arrow-icon').setOrigin(0, 0.5).setScale(0.5);
        this.arrowText = this.add.text(50, 150, `x ${this.player.arrows}`, { fontSize: '20px', fill: '#ffffff' }).setOrigin(0, 0.5);
        
        // 添加所有UI元素到容器中
        this.uiContainer.add([healthBg, healthLabel, this.healthBar, this.scoreText, this.targetText, this.levelText, arrowIcon, this.arrowText]);
        
        // 在移动设备上创建虚拟按钮
        if (this.sys.game.device.input.touch) {
            this.createVirtualButtons();
        }
    }

    createVirtualButtons() {
        // 创建移动控制按钮容器
        this.virtualButtonsContainer = this.add.container(0, 0).setScrollFactor(0);
        
        const buttonSize = 80;
        const buttonPadding = 20;
        const screenHeight = this.cameras.main.height;
        const screenWidth = this.cameras.main.width;

        // 左右移动按钮
        const leftButton = this.add.circle(
            buttonPadding + buttonSize / 2,
            screenHeight - buttonPadding - buttonSize / 2,
            buttonSize / 2,
            0x0000ff,
            0.5
        ).setScrollFactor(0).setInteractive();

        const rightButton = this.add.circle(
            buttonPadding * 2 + buttonSize * 1.5,
            screenHeight - buttonPadding - buttonSize / 2,
            buttonSize / 2,
            0x0000ff,
            0.5
        ).setScrollFactor(0).setInteractive();

        // 跳跃按钮
        const jumpButton = this.add.circle(
            screenWidth - buttonPadding * 2 - buttonSize * 1.5,
            screenHeight - buttonPadding - buttonSize / 2,
            buttonSize / 2,
            0x00ff00,
            0.5
        ).setScrollFactor(0).setInteractive();

        // 射箭按钮
        const shootButton = this.add.circle(
            screenWidth - buttonPadding - buttonSize / 2,
            screenHeight - buttonPadding - buttonSize / 2,
            buttonSize / 2,
            0xff0000,
            0.5
        ).setScrollFactor(0).setInteractive();

        // 添加事件监听
        leftButton.on('pointerdown', () => {
            this.player.moveLeft();
        });
        leftButton.on('pointerup', () => {
            this.player.stopMoving();
        });
        leftButton.on('pointerout', () => {
            this.player.stopMoving();
        });

        rightButton.on('pointerdown', () => {
            this.player.moveRight();
        });
        rightButton.on('pointerup', () => {
            this.player.stopMoving();
        });
        rightButton.on('pointerout', () => {
            this.player.stopMoving();
        });

        jumpButton.on('pointerdown', () => {
            this.player.jump();
        });

        shootButton.on('pointerdown', () => {
            // 获取屏幕中心作为射击方向
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            this.shootArrow({ x: centerX, y: centerY });
        });
        
        // 添加按钮文本
        const leftText = this.add.text(leftButton.x, leftButton.y, '←', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        const rightText = this.add.text(rightButton.x, rightButton.y, '→', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        const jumpText = this.add.text(jumpButton.x, jumpButton.y, '↑', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        const shootText = this.add.text(shootButton.x, shootButton.y, '★', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        
        // 添加所有虚拟按钮到容器
        this.virtualButtonsContainer.add([leftButton, rightButton, jumpButton, shootButton, leftText, rightText, jumpText, shootText]);
    }

    setCollisions() {
        // 玩家与平台碰撞
        this.physics.add.collider(this.player, this.platformLayer);
        // 敌人与平台碰撞
        this.physics.add.collider(this.enemies, this.platformLayer);
        // 箭矢与平台碰撞
        this.physics.add.collider(this.arrows, this.platformLayer, (arrow) => {
            // 箭矢碰到平台后停止并嵌入
            arrow.setVelocity(0);
            arrow.setImmovable(true);
            // 一段时间后消失
            this.time.delayedCall(2000, () => {
                arrow.destroy();
            });
        });
        // 箭矢与敌人碰撞
        this.physics.add.overlap(this.arrows, this.enemies, this.hitEnemy, null, this);
        // 玩家与敌人碰撞
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
    }

    setInputs() {
        // 设置键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD键
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        // 射箭键
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // 监听方向键事件
        this.input.keyboard.on('keydown-LEFT', () => {
            this.player.moveLeft();
        });
        this.input.keyboard.on('keydown-RIGHT', () => {
            this.player.moveRight();
        });
        this.input.keyboard.on('keyup-LEFT', () => {
            if (!this.input.keyboard.checkDown(this.cursors.right) && !this.input.keyboard.checkDown(this.keyD)) {
                this.player.stopMoving();
            }
        });
        this.input.keyboard.on('keyup-RIGHT', () => {
            if (!this.input.keyboard.checkDown(this.cursors.left) && !this.input.keyboard.checkDown(this.keyA)) {
                this.player.stopMoving();
            }
        });
        
        // 监听WASD键事件
        this.input.keyboard.on('keydown-A', () => {
            this.player.moveLeft();
        });
        this.input.keyboard.on('keydown-D', () => {
            this.player.moveRight();
        });
        this.input.keyboard.on('keyup-A', () => {
            if (!this.input.keyboard.checkDown(this.cursors.right) && !this.input.keyboard.checkDown(this.keyD)) {
                this.player.stopMoving();
            }
        });
        this.input.keyboard.on('keyup-D', () => {
            if (!this.input.keyboard.checkDown(this.cursors.left) && !this.input.keyboard.checkDown(this.keyA)) {
                this.player.stopMoving();
            }
        });
        
        // 监听空格键射箭
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shootArrow();
        });
        
        // 监听鼠标点击事件（射箭）
        this.input.on('pointerdown', this.shootArrow, this);
    }
    
    shootArrow(pointer) {
        // 如果没有箭矢或游戏结束，则不发射
        if (this.player.arrows <= 0 || this.isGameOver) return;
        
        // 减少箭矢数量
        this.player.arrows--;
        this.updateArrowUI();
        
        // 播放射箭音效
        this.audioManager.playShootSound();
        
        // 播放射箭动画
        this.player.play('shoot', true);
        
        // 计算射击方向
        let targetX, targetY;
        if (pointer) {
            // 如果是鼠标/触摸点击，使用点击位置
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            targetX = worldPoint.x;
            targetY = worldPoint.y;
        } else {
            // 如果是键盘射击，使用玩家朝向
            const direction = this.player.flipX ? -1 : 1;
            targetX = this.player.x + direction * 100;
            targetY = this.player.y;
        }
        
        // 计算角度
        const angle = Phaser.Math.Angle.Between(
            this.player.x, 
            this.player.y - 15, // 从玩家上半身发射
            targetX, 
            targetY
        );
        
        // 创建箭矢
        const arrow = new Arrow(
            this, 
            this.player.x, 
            this.player.y - 15, 
            angle
        );
        
        // 将箭矢添加到组中
        this.arrows.add(arrow);
        
        // 为箭矢添加拖尾效果
        this.particleManager.createArrowTrail(arrow);
        
        // 自动恢复箭矢（每10秒恢复1支，最多10支）
        this.time.delayedCall(10000, () => {
            if (this.player.arrows < 10) {
                this.player.arrows++;
                this.updateArrowUI();
            }
        });
    }

    hitEnemy(arrow, enemy) {
        // 如果箭矢已经击中目标，则忽略
        if (arrow.hasHit) return;
        // 标记箭矢已击中
        arrow.hasHit = true;
        // 停止箭矢拖尾效果
        this.particleManager.stopArrowTrail(arrow);
        // 播放击中音效
        this.audioManager.playEnemyHitSound();
        // 创建击中效果
        this.createHitEffect(arrow.x, arrow.y);
        this.particleManager.createHitEffect(arrow.x, arrow.y, 1.0);
        // 对敌人造成伤害
        const damage = 25 + Math.floor(Math.random() * 10); // 25-34点伤害
        const killed = enemy.takeDamage(damage);
        // 如果敌人被击杀
        if (killed) {
            // 播放死亡音效
            this.audioManager.playEnemyDeathSound();
            // 增加分数
            this.score += 100 * this.currentLevel;
            this.scoreText.setText(`分数: ${this.score}`);
            // 增加击杀数
            this.enemiesKilled++;
            this.targetText.setText(`目标: ${this.enemiesKilled}/${this.targetEnemies}`);
            // 创建爆炸效果和血液效果
            this.createExplosion(enemy.x, enemy.y);
            this.particleManager.createBloodEffect(enemy.x, enemy.y, 1.5);
            // 添加屏幕震动
            this.cameras.main.shake(150, 0.008);
        }
        // 销毁箭矢
        arrow.destroy();
    }

    hitPlayer(player, enemy) {
        // 如果玩家处于无敌状态，则忽略
        if (this.player.isInvulnerable) return;
        // 设置玩家无敌状态（短暂时间内不会再次受伤）
        this.player.isInvulnerable = true;
        // 播放受伤音效
        this.audioManager.playPlayerHitSound();
        // 播放受伤动画
        this.player.play('hurt', true);
        // 减少生命值
        this.health -= 10;
        // 更新生命值显示
        this.healthBar.width = Math.max(0, this.health * 2);
        // 创建受伤效果
        this.player.setTint(0xff0000);
        this.particleManager.createHitEffect(this.player.x, this.player.y, 0.8);
        // 添加屏幕震动
        this.cameras.main.shake(100, 0.005);
        // 击退效果
        const knockbackDirection = this.player.x < enemy.x ? -1 : 1;
        this.player.setVelocityX(knockbackDirection * 200);
        this.player.setVelocityY(-200);
        // 检查是否游戏结束
        if (this.health <= 0) {
            this.gameOver();
            return;
        }
        // 恢复正常状态
        this.time.delayedCall(1000, () => {
            this.player.clearTint();
            this.player.isInvulnerable = false;
        });
    }

    createHitEffect(x, y) {
        // 使用HitEffect类创建击中特效
        return new HitEffect(this, x, y);
    }
    
    createExplosion(x, y) {
        // 创建爆炸动画
        const explosion = this.add.sprite(x, y, 'explosion');
        explosion.play('explode');
        // 动画播放完毕后销毁
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
    }

    updateArrowUI() {
        // 更新箭矢数量显示
        this.arrowText.setText(`x ${this.player.arrows}`);
    }

    checkLevelComplete() {
        // 检查是否达到关卡目标
        if (this.enemiesKilled >= this.targetEnemies) {
            // 停止环境音效
            this.audioManager.stopAmbienceSound();
            // 播放关卡完成音效
            this.audioManager.playLevelCompleteSound();
            // 添加胜利的屏幕闪光效果
            this.cameras.main.flash(500, 255, 255, 255, true);
            // 延迟一下再跳转，让玩家感受到胜利的喜悦
            this.time.delayedCall(1000, () => {
                // 跳转到关卡完成场景
                this.scene.start('LevelCompleteScene', {
                    level: this.currentLevel,
                    score: this.score,
                    health: this.health
                });
            });
        }
    }

    gameOver() {
        // 设置游戏结束标志
        this.isGameOver = true;
        
        // 停止环境音效
        this.audioManager.stopAmbienceSound();
        
        // 播放游戏结束音效
        this.audioManager.playGameOverSound();
        
        // 添加强烈的屏幕震动
        this.cameras.main.shake(500, 0.02);
        
        // 延迟一下再跳转，让玩家感受到游戏结束的震撼
        this.time.delayedCall(1000, () => {
            // 跳转到游戏结束场景
            this.scene.start('GameOverScene', {
                level: this.currentLevel,
                score: this.score
            });
        });
    }
}
