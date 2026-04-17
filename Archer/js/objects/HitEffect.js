class HitEffect extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'hit_effect');
        
        // 添加到场景并设置动画
        scene.add.existing(this);
        
        // 设置原点为中心
        this.setOrigin(0.5, 0.5);
        
        // 创建动画（如果尚未创建）
        if (!scene.anims.exists('hit_flash')) {
            scene.anims.create({
                key: 'hit_flash',
                frames: scene.anims.generateFrameNumbers('hit_effect', { start: 0, end: 5 }),
                frameRate: 20,
                repeat: 0
            });
        }
        
        // 播放动画
        this.play('hit_flash');
        
        // 动画完成后销毁
        this.on('animationcomplete', () => {
            this.destroy();
        });
    }
}

export default HitEffect;
