import Player from './player.js';
import Dementor from './dementor.js';
import Spell from './spell.js';
import PowerUp from './powerup.js';
import { GAME_WIDTH, GAME_HEIGHT, DIFFICULTY, CONFIG } from './constants.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 800;

        // 设置游戏容器尺寸
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.style.width = this.canvas.width + 'px';
        gameContainer.style.height = this.canvas.height + 'px';

        // 确保 dementorContainer 存在
        const dementorContainer = document.getElementById('dementorContainer');
        if (!dementorContainer) {
            console.error('dementorContainer not found! Creating one...');
            const container = document.createElement('div');
            container.id = 'dementorContainer';
            container.style.position = 'absolute';
            container.style.left = '0';
            container.style.top = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '1';
            gameContainer.appendChild(container);
        }

        this.dementorContainer = document.getElementById('dementorContainer');
        this.startMessage = document.getElementById('startMessage');
        this.scoreElement = document.getElementById('score');
        this.powerLevelElement = document.getElementById('powerLevel');
        this.finalScoreElement = document.getElementById('finalScore');

        this.isGameOver = false;
        this.gameStarted = false;
        this.score = 0;
        this.difficulty = DIFFICULTY.NORMAL;
        this.lastSpawnTime = 0;
        this.lastShootTime = 0;
        this.lastFrameTime = 0;
        this.animationFrameId = null;

        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.dementors = [];
        this.spells = [];
        this.powerUps = [];

        this.setupEventListeners();
    }

    resizeCanvas() {
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        
        // 更新玩家位置，但保持在水平方向的相对位置
        const playerXRatio = this.player.x / GAME_WIDTH;
        this.player.x = GAME_WIDTH * playerXRatio;
        this.player.y = GAME_HEIGHT - 100;
    }

    setupEventListeners() {
        // 重启按钮事件监听
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }

        // 点击和触摸开始游戏
        const handleStart = () => {
            if (!this.gameStarted && !document.getElementById('difficulty').style.display === 'flex') {
                document.getElementById('difficulty').style.display = 'flex';
                this.startMessage.style.display = 'none';
            }
        };

        // 添加点击和触摸事件
        this.canvas.addEventListener('click', handleStart);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                handleStart();
                return;
            }
            touchStartX = e.touches[0].clientX;
            this.player.shooting = true;
        }, { passive: false });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.player.movingLeft = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.player.movingRight = true;
                    break;
                case ' ':
                    this.player.shooting = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (!this.gameStarted) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.player.movingLeft = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.player.movingRight = false;
                    break;
                case ' ':
                    this.player.shooting = false;
                    break;
            }
        });

        // 触摸控制
        let touchStartX = 0;

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.gameStarted) return;
            const touchX = e.touches[0].clientX;
            const diffX = touchX - touchStartX;
            
            if (Math.abs(diffX) > 10) {  // 添加一些阈值，避免微小移动
                this.player.movingLeft = diffX < 0;
                this.player.movingRight = diffX > 0;
                touchStartX = touchX;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameStarted) return;
            this.player.movingLeft = false;
            this.player.movingRight = false;
            this.player.shooting = false;
        }, { passive: false });
    }

    getCanvasX(screenX) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = GAME_WIDTH / rect.width;
        return (screenX - rect.left) * scale;
    }

    handleMove(screenX) {
        if (!this.isGameOver && this.gameStarted) {
            const canvasX = this.getCanvasX(screenX);
            this.player.x = Math.max(this.player.size / 2, Math.min(GAME_WIDTH - this.player.size / 2, canvasX));
        }
    }

    spawnDementor() {
        const pattern = Dementor.getPattern();
        const x = Math.random() * (this.canvas.width - 40);
        this.dementors.push(new Dementor(x, -40, pattern));
    }

    castSpell() {
        const now = Date.now();
        const shootInterval = Math.max(100, CONFIG.SPELL_COOLDOWN - this.player.power * 30);
        if (now - this.lastShootTime >= shootInterval) {
            this.spells.push(new Spell(this.player.x, this.player.y - this.player.size / 2));
            this.lastShootTime = now;
        }
    }

    spawnPowerUp(x, y) {
        this.powerUps.push(new PowerUp(x, y));
    }

    checkCollision(rect1, rect2) {
        const dx = rect1.x - rect2.x;
        const dy = rect1.y - rect2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (rect1.size + rect2.size) / 2;
    }

    updateSpells() {
        for (let i = this.spells.length - 1; i >= 0; i--) {
            const spell = this.spells[i];
            spell.update();
            if (spell.y < 0) {
                this.spells.splice(i, 1);
            }
        }
    }

    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();

            // 检查是否被收集
            if (this.checkCollision(powerUp, this.player)) {
                this.player.power = Math.min(CONFIG.MAX_POWER, this.player.power + 1);
                this.updatePowerLevel();
                powerUp.destroy();  // 调用 destroy 方法清理 DOM 元素
                this.powerUps.splice(i, 1);
                continue;
            }

            // 检查是否超出屏幕
            if (powerUp.y > this.canvas.height) {
                powerUp.destroy();  // 调用 destroy 方法清理 DOM 元素
                this.powerUps.splice(i, 1);
            }
        }
    }

    updatePowerLevel() {
        this.powerLevelElement.textContent = `火力: ${this.player.power}`;
    }

    startDementorSpawn() {
        // 清除可能存在的旧定时器
        if (window.spawnInterval) {
            clearInterval(window.spawnInterval);
        }
        
        // 设置新的定时器
        window.spawnInterval = setInterval(() => {
            if (!this.isGameOver && this.gameStarted) {
                // 根据难度生成怪物
                for (let i = 0; i < this.difficulty; i++) {
                    this.spawnDementor();
                }
            }
        }, CONFIG.SPAWN_INTERVAL);
    }

    clearDementors() {
        while (this.dementorContainer.firstChild) {
            this.dementorContainer.removeChild(this.dementorContainer.firstChild);
        }
    }

    gameLoop(currentTime) {
        if (!this.isGameOver) {
            // 计算帧间时间（秒）
            const deltaTime = this.lastFrameTime ? (currentTime - this.lastFrameTime) / 1000 : 0;
            this.lastFrameTime = currentTime;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.clearDementors();

            if (this.gameStarted) {
                this.castSpell();

                // 更新和绘制所有游戏对象
                this.updateSpells();
                this.updatePowerUps();
                this.spells.forEach(spell => spell.draw(this.ctx));
                this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));

                // 更新和绘制摄魂怪
                for (let i = this.dementors.length - 1; i >= 0; i--) {
                    const dementor = this.dementors[i];
                    dementor.update(deltaTime);

                    // 检查是否被击中
                    for (let j = this.spells.length - 1; j >= 0; j--) {
                        const spell = this.spells[j];
                        if (this.checkCollision(dementor, spell)) {
                            dementor.health--;
                            this.spells.splice(j, 1);

                            if (dementor.health <= 0) {
                                this.score++;
                                this.scoreElement.textContent = `分数: ${this.score}`;
                                this.spawnPowerUp(dementor.x, dementor.y);
                                dementor.destroy();  // 调用 destroy 方法清理 DOM 元素
                                this.dementors.splice(i, 1);
                                continue;
                            }
                        }
                    }

                    dementor.draw(this.ctx);

                    // 检查与玩家碰撞
                    if (this.checkCollision(dementor, this.player)) {
                        dementor.destroy();  // 调用 destroy 方法清理 DOM 元素
                        this.dementors.splice(i, 1);
                        this.gameOver();
                        return;
                    }

                    // 检查是否到达底部
                    if (dementor.y > this.canvas.height + dementor.size) {
                        dementor.destroy();  // 调用 destroy 方法清理 DOM 元素
                        this.dementors.splice(i, 1);
                    }
                }
            }

            this.player.draw(this.ctx, Date.now() - this.lastShootTime < 100);
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    startGame() {
        this.gameStarted = true;
        this.isGameOver = false;
        this.score = 0;
        this.scoreElement.textContent = '分数: 0';
        this.startMessage.style.display = 'none';
        document.getElementById('difficulty').style.display = 'none';

        // 清理所有游戏对象
        this.dementors.forEach(dementor => dementor.destroy());
        this.powerUps.forEach(powerUp => powerUp.destroy());
        this.dementors = [];
        this.spells = [];
        this.powerUps = [];
        this.clearDementors();

        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.updatePowerLevel();
        this.lastSpawnTime = Date.now();
        this.lastShootTime = Date.now();
        this.lastFrameTime = 0;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.gameLoop(0);
        this.startDementorSpawn();
    }

    gameOver() {
        this.isGameOver = true;
        this.gameStarted = false;
        this.finalScoreElement.textContent = this.score;
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('difficulty').style.display = 'none';
        if (window.spawnInterval) {
            clearInterval(window.spawnInterval);
        }
        // 清理所有游戏对象
        this.dementors.forEach(dementor => dementor.destroy());
        this.powerUps.forEach(powerUp => powerUp.destroy());
        this.dementors = [];
        this.powerUps = [];
        this.clearDementors();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    restart() {
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('difficulty').style.display = 'flex';
        // 清理所有游戏对象
        this.dementors.forEach(dementor => dementor.destroy());
        this.powerUps.forEach(powerUp => powerUp.destroy());
        this.dementors = [];
        this.powerUps = [];
        this.clearDementors();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.lastFrameTime = 0;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.startGame();
    }
}

export default Game;
