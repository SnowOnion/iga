class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, level = 1) {
        console.log("Enemy constructor 启动！")
        super(scene, x, y, 'enemies');
        console.log("Enemy constructor super 了")
        
        // 将敌人添加到场景中
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置物理属性，参考主角的设置
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setSize(24, 28);
        this.setOffset(4, 4);


        // console.log("before  this.physics.add.collider(this, this.platformLayer);")
        // // 2025-07-16 10:25:37 瞎试试：敌人与平台碰撞
        // this.physics.add.collider(this, this.platformLayer);

        // this.setAllowGravity(false);
        
        // // 确保敌人不会立即开始移动，直到第一次着地
        // this.setVelocityX(0);
        
        
        // // 延迟一帧再启用重力，确保与平台的碰撞器先初始化
        // scene.time.delayedCall(100, () => {
        //     if (this.body) {
        //         this.body.setAllowGravity(true);
        //     }
        // });
        
        // 敌人属性（根据关卡难度调整）
        this.health = 50 + (level * 25); // 关卡越高，生命值越高
        this.maxHealth = this.health;
        this.moveSpeed = 80 + (level * 10); // 关卡越高，移动速度越快
        this.attackDamage = 10 + (level * 5); // 关卡越高，攻击伤害越高
        this.attackRange = 40; // 攻击范围
        this.detectionRange = 300; // 检测玩家范围
        this.level = level;
        
        // 敌人状态
        this.isAttacking = false;
        this.isDead = false;
        this.direction = Phaser.Math.Between(0, 1) ? 1 : -1; // 随机初始方向
        this.patrolDistance = Phaser.Math.Between(100, 200); // 随机巡逻距离
        this.startX = x;
        
        // 保存场景引用
        this.scene = scene;
        
        // 创建生命值条
        this.createHealthBar();
        
        // 播放行走动画
        this.play('enemy-walk');
        
        // AI行为更新定时器
        this.updateTimer = scene.time.addEvent({
            delay: 100, // 每100ms更新一次AI
            callback: this.updateAI,
            callbackScope: this,
            loop: true
        });
    }
    
    createHealthBar() {
        // 创建生命值条容器
        this.healthBarContainer = this.scene.add.container(0, -20);
        
        // 创建背景
        const barBg = this.scene.add.rectangle(0, 0, 30, 4, 0x000000);
        
        // 创建生命值条
        this.healthBar = this.scene.add.rectangle(0, 0, 30, 4, 0xff0000);
        this.healthBar.setOrigin(0.5, 0.5);
        
        // 添加到容器
        this.healthBarContainer.add([barBg, this.healthBar]);
        
        // 将容器添加为敌人的子对象
        this.healthBarContainer.setVisible(false); // 默认隐藏，受伤时显示
    }
    
    updateHealthBar() {
        // 更新生命值条宽度
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 30 * healthPercent;
        
        // 根据生命值百分比改变颜色
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // 绿色
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xffff00; // 黄色
        } else {
            this.healthBar.fillColor = 0xff0000; // 红色
        }
    }
    
    update() {
        // 如果敌人已死亡，不进行更新
        if (this.isDead) return;
        
        // 更新生命值条位置
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 20;
        
        // 根据方向翻转敌人
        this.flipX = this.direction < 0;
    }
    
    updateAI() {
        // 如果敌人已死亡或正在攻击，不更新AI
        if (this.isDead || this.isAttacking) return;
        
        // 获取玩家引用
        const player = this.scene.player;
        if (!player) return;
        
        // 计算与玩家的距离
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        // 如果玩家在检测范围内，追击玩家
        if (distanceToPlayer <= this.detectionRange) {
            // 显示生命值条
            this.healthBarContainer.setVisible(true);
            
            // 确定追击方向
            this.direction = player.x < this.x ? -1 : 1;
            
            // 如果在攻击范围内，进行攻击
            if (distanceToPlayer <= this.attackRange) {
                this.attack();
            } else {
                // 否则向玩家移动
                this.setVelocityX(this.direction * this.moveSpeed);
                
                // 播放行走动画
                if (this.anims.currentAnim.key !== 'enemy-walk') {
                    this.play('enemy-walk', true);
                }
            }
        } else {
            // 隐藏生命值条
            this.healthBarContainer.setVisible(false);
            
            // 玩家不在范围内，执行巡逻行为
            this.patrol();
        }
    }
    
    patrol() {
        // 巡逻行为
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
            // 超出巡逻范围，改变方向
            this.direction *= -1;
        }
        
        // 设置移动速度
        this.setVelocityX(this.direction * (this.moveSpeed * 0.5)); // 巡逻时速度较慢
        
        // 播放行走动画
        if (this.anims.currentAnim.key !== 'enemy-walk') {
            this.play('enemy-walk', true);
        }
    }
    
    attack() {
        // 如果已经在攻击中，不重复攻击
        if (this.isAttacking) return;
        
        // 设置攻击状态
        this.isAttacking = true;
        
        // 停止移动
        this.setVelocityX(0);
        
        // 播放攻击动画
        this.play('enemy-attack', true);
        
        // 攻击动画完成后恢复正常状态
        this.on('animationcomplete', () => {
            // 只有当前动画是攻击动画时才重置状态
            if (this.anims.currentAnim.key === 'enemy-attack') {
                this.isAttacking = false;
                this.play('enemy-walk', true);
            }
        }, this);
        
        // 攻击判定（在动画中间帧进行）
        this.scene.time.delayedCall(300, () => {
            if (this.isDead) return;
            
            // 获取玩家引用
            const player = this.scene.player;
            if (!player) return;
            
            // 计算与玩家的距离
            const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            
            // 如果玩家仍在攻击范围内，造成伤害
            if (distanceToPlayer <= this.attackRange) {
                // 在GameScene中处理玩家受伤逻辑
                this.scene.hitPlayer(player, this);
            }
        });
    }
    
    takeDamage(damage) {
        // 减少生命值
        this.health -= damage;
        
        // 显示生命值条
        this.healthBarContainer.setVisible(true);
        
        // 更新生命值条
        this.updateHealthBar();
        
        // 受伤闪烁效果
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // 受伤击退效果
        const knockbackDirection = this.scene.player.x < this.x ? 1 : -1;
        this.setVelocityX(knockbackDirection * 150);
        this.setVelocityY(-100);
        
        // 检查是否死亡
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    die() {
        // 设置死亡状态
        this.isDead = true;
        
        // 停止AI更新
        this.updateTimer.remove();
        
        // 停止移动
        this.setVelocity(0, 0);
        this.body.allowGravity = false;
        
        // 隐藏生命值条
        this.healthBarContainer.setVisible(false);
        
        // 死亡效果
        this.setTint(0x666666);
        this.setAlpha(0.8);
        
        // 渐隐效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 20,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    destroy() {
        // 销毁生命值条
        if (this.healthBarContainer) {
            this.healthBarContainer.destroy();
        }
        
        // 销毁AI更新定时器
        if (this.updateTimer) {
            this.updateTimer.remove();
        }
        
        // 调用父类的销毁方法
        super.destroy();
    }
}
