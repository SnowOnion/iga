class Arrow extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY) {
        super(scene, x, y, 'arrow');
        
        // 将箭矢添加到场景中
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置物理属性
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setFriction(1);
        
        // 禁用重力，避免箭矢下落
        this.body.setAllowGravity(false);
        
        // 箭矢属性
        this.speed = 600;
        this.hasHit = false;
        this.lifespan = 10000; // 10秒后消失
        
        // 保存场景引用
        this.scene = scene;
        
        // 计算发射方向
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        
        // 设置箭矢角度
        this.rotation = angle;
        
        // 计算速度向量
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        // 设置箭矢大小
        this.setSize(28, 4);
        this.setOffset(2, 2);
        
        // 添加拖尾效果
        this.createTrail();
        
        // 设置生命周期
        scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        });
    }
    
    createTrail() {
        // 创建粒子发射器
        this.particles = this.scene.add.particles(0, 0, 'arrow', {
            frame: 0,
            quantity: 1,
            lifespan: 200,
            alpha: { start: 0.5, end: 0 },
            scale: { start: 0.5, end: 0.1 },
            follow: this,
            blendMode: 'ADD'
        });
    }
    
    stick() {
        if (this.hasHit) return;
        
        // 标记箭矢已击中
        this.hasHit = true;
        
        // 停止移动
        this.setVelocity(0, 0);
        this.setImmovable(true);
        this.body.allowGravity = false;
        
        // 停止粒子效果
        if (this.particles) {
            this.particles.destroy();
        }
        
        // 箭矢插入墙壁后一段时间消失
        this.scene.time.delayedCall(5000, () => {
            this.destroy();
        });
    }
    
    update() {
        // 如果箭矢已经击中目标，则不更新
        if (this.hasHit) return;
        
        // 根据速度方向更新箭矢角度
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
    }
    
    destroy() {
        // 销毁粒子效果
        if (this.particles) {
            this.particles.destroy();
        }
        
        // 调用父类的销毁方法
        super.destroy();
    }
}
