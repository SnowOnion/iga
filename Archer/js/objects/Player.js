class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'archer');
        
        // 将玩家添加到场景中
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置物理属性
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setSize(40, 60);
        this.setOffset(12, 4);
        
        // 玩家属性
        this.moveSpeed = 200;
        this.jumpSpeed = 400;
        this.arrows = 10;
        this.isInvulnerable = false;
        
        // 玩家状态
        this.isJumping = false;
        this.isShooting = false;
        
        // 播放初始动画
        this.play('idle');
        
        // 保存场景引用
        this.scene = scene;
        
        // 获取输入控制
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }
    
    update() {
        // 如果正在射击，不处理移动
        if (this.isShooting) return;
        
        // 水平移动
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.moveLeft();
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.moveRight();
        } else {
            this.stopMoving();
        }
        
        // 跳跃
        if (this.cursors.up.isDown && this.body.onFloor()) {
            this.jump();
        }
        
        // 更新动画
        if (!this.body.onFloor()) {
            // 在空中时不播放跑步动画
            if (this.anims.currentAnim && this.anims.currentAnim.key === 'run') {
                this.play('idle');
            }
        } else if (this.body.velocity.x !== 0 && this.anims.currentAnim.key !== 'run') {
            // 在地面上移动时播放跑步动画
            this.play('run', true);
        } else if (this.body.velocity.x === 0 && this.body.onFloor() && this.anims.currentAnim.key !== 'idle') {
            // 在地面上静止时播放闲置动画
            this.play('idle', true);
        }
    }
    
    moveLeft() {
        this.setVelocityX(-this.moveSpeed);
        this.flipX = true;
        
        if (this.body.onFloor() && !this.isShooting && this.anims.currentAnim.key !== 'run') {
            this.play('run', true);
        }
    }
    
    moveRight() {
        this.setVelocityX(this.moveSpeed);
        this.flipX = false;
        
        if (this.body.onFloor() && !this.isShooting && this.anims.currentAnim.key !== 'run') {
            this.play('run', true);
        }
    }
    
    stopMoving() {
        this.setVelocityX(0);
        
        if (this.body.onFloor() && !this.isShooting && this.anims.currentAnim.key !== 'idle') {
            this.play('idle', true);
        }
    }
    
    jump() {
        if (this.body.onFloor()) {
            this.setVelocityY(-this.jumpSpeed);
            this.isJumping = true;
        }
    }
    
    shoot() {
        // 设置射击状态
        this.isShooting = true;
        
        // 播放射击动画
        this.play('shoot', true);
        
        // 射击动画完成后恢复正常状态
        this.on('animationcomplete', () => {
            this.isShooting = false;
            
            // 恢复之前的动画
            if (this.body.velocity.x !== 0 && this.body.onFloor()) {
                this.play('run', true);
            } else {
                this.play('idle', true);
            }
        }, this);
    }
    
    takeDamage(damage) {
        // 受伤效果在GameScene中处理
        return this.health <= 0;
    }
}
