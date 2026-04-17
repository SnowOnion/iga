// 游戏配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    pixelArt: true,
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        GameScene,
        LevelCompleteScene,
        GameOverScene
    ]
};
