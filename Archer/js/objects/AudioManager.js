class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.initialize();
    }

    initialize() {
        // 初始化音效
        this.sounds = {
            // 玩家相关音效
            shoot: this.scene.sound.add('shoot_sound', { volume: 0.5 }),
            jump: this.scene.sound.add('jump_sound', { volume: 0.4 }),
            playerHit: this.scene.sound.add('player_hit_sound', { volume: 0.6 }),
            playerDeath: this.scene.sound.add('player_death_sound', { volume: 0.7 }),
            
            // 敌人相关音效
            enemyHit: this.scene.sound.add('enemy_hit_sound', { volume: 0.5 }),
            enemyDeath: this.scene.sound.add('enemy_death_sound', { volume: 0.6 }),
            
            // 游戏状态音效
            levelComplete: this.scene.sound.add('level_complete_sound', { volume: 0.7 }),
            gameOver: this.scene.sound.add('game_over_sound', { volume: 0.7 }),
            
            // 界面音效
            buttonClick: this.scene.sound.add('button_click_sound', { volume: 0.4 }),
            
            // 环境音效
            ambience: this.scene.sound.add('ambience_sound', { volume: 0.3, loop: true })
        };
    }

    // 播放射箭音效
    playShootSound() {
        this.sounds.shoot.play();
    }

    // 播放跳跃音效
    playJumpSound() {
        this.sounds.jump.play();
    }

    // 播放玩家受伤音效
    playPlayerHitSound() {
        this.sounds.playerHit.play();
    }

    // 播放玩家死亡音效
    playPlayerDeathSound() {
        this.sounds.playerDeath.play();
    }

    // 播放敌人受伤音效
    playEnemyHitSound() {
        this.sounds.enemyHit.play();
    }

    // 播放敌人死亡音效
    playEnemyDeathSound() {
        this.sounds.enemyDeath.play();
    }

    // 播放关卡完成音效
    playLevelCompleteSound() {
        this.sounds.levelComplete.play();
    }

    // 播放游戏结束音效
    playGameOverSound() {
        this.sounds.gameOver.play();
    }

    // 播放按钮点击音效
    playButtonClickSound() {
        this.sounds.buttonClick.play();
    }

    // 播放环境音效
    playAmbienceSound() {
        if (!this.sounds.ambience.isPlaying) {
            this.sounds.ambience.play();
        }
    }

    // 停止环境音效
    stopAmbienceSound() {
        if (this.sounds.ambience.isPlaying) {
            this.sounds.ambience.stop();
        }
    }

    // 停止所有音效
    stopAll() {
        this.scene.sound.stopAll();
    }
}

// 挂载到全局作用域，便于非模块化脚本直接访问
window.AudioManager = AudioManager;
