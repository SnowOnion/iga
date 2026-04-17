class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.initialize();
    }

    initialize() {
        // 创建粒子管理器
        this.hitParticles = this.scene.add.particles('particle');
        this.bloodParticles = this.scene.add.particles('blood_particle');
        this.arrowTrailParticles = this.scene.add.particles('arrow_trail');
        
        // 创建击中粒子发射器
        this.hitEmitter = this.hitParticles.createEmitter({
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            lifespan: { min: 300, max: 500 },
            blendMode: 'ADD',
            gravityY: 300,
            on: false
        });

        // 创建血液粒子发射器
        this.bloodEmitter = this.bloodParticles.createEmitter({
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: { min: 400, max: 600 },
            blendMode: 'NORMAL',
            gravityY: 300,
            on: false
        });

        // 创建箭矢拖尾粒子发射器
        this.arrowTrailEmitter = this.arrowTrailParticles.createEmitter({
            speed: 0,
            scale: { start: 0.4, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            on: false
        });
    }

    createHitEffect(x, y, intensity = 1) {
        // 播放击中粒子效果
        this.hitEmitter.setPosition(x, y);
        this.hitEmitter.explode(10 * intensity);
        
        // 添加屏幕震动效果
        if (intensity > 0.5) {
            this.scene.cameras.main.shake(100 * intensity, 0.01 * intensity);
        }
    }

    createBloodEffect(x, y, intensity = 1) {
        // 播放血液粒子效果
        this.bloodEmitter.setPosition(x, y);
        this.bloodEmitter.explode(8 * intensity);
    }

    createArrowTrail(arrow) {
        // 为箭矢添加拖尾效果
        this.arrowTrailEmitter.startFollow(arrow);
        this.arrowTrailEmitter.on = true;
    }

    stopArrowTrail(arrow) {
        // 停止箭矢拖尾效果
        this.arrowTrailEmitter.stopFollow();
        this.arrowTrailEmitter.on = false;
    }
}

// 挂载到全局作用域，供非模块脚本调用
window.ParticleManager = ParticleManager;
