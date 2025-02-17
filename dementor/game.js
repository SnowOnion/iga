const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMessage = document.getElementById('startMessage');
const scoreElement = document.getElementById('score');
const powerLevelElement = document.getElementById('powerLevel');
const finalScoreElement = document.getElementById('finalScore');

let isGameOver = false;
let gameStarted = false;
let score = 0;
let lastSpawnTime = 0;
let lastShootTime = 0;
let spawnInterval = 1000;  // 默认生成间隔
let lastFrameTime = 0;     // 用于计算帧间时间
let animationFrameId = null;  // 用于存储 requestAnimationFrame 的 ID

// 游戏对象
let player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    size: 40,
    power: 0
};

let dementors = [];
let spells = [];
let powerUps = [];

const GAME_WIDTH = 400;
const GAME_HEIGHT = Math.min(window.innerHeight, 800);

function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    // 更新玩家位置，但保持在水平方向的相对位置
    const playerXRatio = player.x / GAME_WIDTH;
    player.x = GAME_WIDTH * playerXRatio;
    player.y = GAME_HEIGHT - 100;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnDementor() {
    const size = 40;
    const patterns = [
        // 直线下落+小幅摆动
        {
            speed: 2 + Math.random(),
            angle: Math.random() * Math.PI * 2,
            angleSpeed: (Math.random() - 0.5) * 0.08,
            amplitude: 10 + Math.random() * 15,
            pattern: 'swing',
            emoji: '👿'  // 摆动的恶魔
        },
        // 螺旋下降
        {
            speed: 1.5 + Math.random(),
            angle: Math.random() * Math.PI * 2,
            angleSpeed: (Math.random() < 0.5 ? 0.05 : -0.05),
            radius: 50 + Math.random() * 50,
            pattern: 'spiral',
            emoji: '💀'  // 旋转的骷髅
        },
        // Z字形
        {
            speed: 1.8 + Math.random(),
            direction: Math.random() < 0.5 ? 1 : -1,
            switchTime: Date.now(),
            switchInterval: 1000 + Math.random() * 1000,
            amplitude: 20 + Math.random() * 20,
            pattern: 'zigzag',
            emoji: '👾'  // Z字形移动的外星人
        }
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const x = Math.random() * (canvas.width - size);

    dementors.push({
        x: x,
        y: -size,
        size: size,
        health: 3,
        maxHealth: 3,
        initialX: x,
        ...pattern
    });
}

// 添加一个容器来管理所有怪物元素
const dementorContainer = document.createElement('div');
dementorContainer.style.position = 'fixed';
dementorContainer.style.left = '0';
dementorContainer.style.top = '0';
dementorContainer.style.width = '100%';
dementorContainer.style.height = '100%';
dementorContainer.style.pointerEvents = 'none';
document.body.appendChild(dementorContainer);

function getCanvasPosition(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: rect.left + (x / scaleX),
        y: rect.top + (y / scaleY)
    };
}

function drawDementor(x, y, size, health, emoji) {
    const pos = getCanvasPosition(x, y);
    const scaledSize = size * (canvas.getBoundingClientRect().width / canvas.width);

    // 获取或创建 dementor 元素
    let dementorEl = document.getElementById(`dementor-${x}-${y}`);
    if (!dementorEl) {
        dementorEl = document.createElement('div');
        dementorEl.id = `dementor-${x}-${y}`;
        dementorEl.className = 'dementor';
        dementorContainer.appendChild(dementorEl);
    }

    // 更新位置和样式
    dementorEl.style.left = pos.x + 'px';
    dementorEl.style.top = pos.y + 'px';
    dementorEl.style.fontSize = scaledSize + 'px';
    dementorEl.textContent = emoji;

    // 生命值条
    const healthBarWidth = scaledSize;
    const healthBarHeight = 3;
    const healthPercentage = health / 3;

    ctx.save();
    ctx.fillStyle = '#600';
    ctx.fillRect(x - healthBarWidth/2, y - scaledSize/2 - 10, healthBarWidth, healthBarHeight);
    ctx.fillStyle = '#f00';
    ctx.fillRect(x - healthBarWidth/2, y - scaledSize/2 - 10, healthBarWidth * healthPercentage, healthBarHeight);
    ctx.restore();
}

function clearDementors() {
    // 清除所有 dementor 元素
    while (dementorContainer.firstChild) {
        dementorContainer.removeChild(dementorContainer.firstChild);
    }
}

function drawWizard(x, y, size, castingSpell) {
    ctx.save();
    ctx.fillStyle = '#f00';  // 红白色调
    
    // 绘制裙子（三角形）
    ctx.beginPath();
    ctx.moveTo(x, y - size/3);
    ctx.lineTo(x - size/2, y + size/2);
    ctx.lineTo(x + size/2, y + size/2);
    ctx.closePath();
    ctx.fill();

    // 绘制头部（圆形）
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y - size/3, size/3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制蝴蝶结
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(x, y - size/6, size/6, 0, Math.PI * 2);
    ctx.fill();

    // 如果正在施法，添加发光效果
    if (castingSpell) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function castSpell() {
    const now = Date.now();
    const shootInterval = Math.max(100, 400 - player.power * 30);
    if (now - lastShootTime >= shootInterval) {
        const spellSize = 10;
        spells.push({
            x: player.x,
            y: player.y - player.size / 2,
            size: spellSize,
            speed: 10
        });
        lastShootTime = now;
    }
}

function checkCollision(rect1, rect2) {
    const dx = rect1.x - rect2.x;
    const dy = rect1.y - rect2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (rect1.size + rect2.size) / 2;
}

function updateSpells() {
    for (let i = spells.length - 1; i >= 0; i--) {
        const spell = spells[i];
        spell.y -= spell.speed;
        if (spell.y < 0) {
            spells.splice(i, 1);
        }
    }
}

function drawSpells() {
    spells.forEach(spell => {
        const gradient = ctx.createRadialGradient(
            spell.x, spell.y, 0,
            spell.x, spell.y, spell.size
        );
        gradient.addColorStop(0, '#f00');  // 红色御札
        gradient.addColorStop(1, 'rgba(255,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(spell.x, spell.y, spell.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;

        // 检查是否被收集
        if (checkPowerUpCollision(powerUp, player)) {
            player.power++;
            updatePowerLevel();
            powerUps.splice(i, 1);
            continue;
        }

        // 检查是否超出屏幕
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        drawPowerUp(powerUp);
    });
}

function drawPowerUp(powerUp) {
    const pos = getCanvasPosition(powerUp.x, powerUp.y);
    const scaledSize = powerUp.size * (canvas.getBoundingClientRect().width / canvas.width);

    // 获取或创建 powerUp 元素
    let powerUpEl = document.getElementById(`powerup-${powerUp.x}-${powerUp.y}`);
    if (!powerUpEl) {
        powerUpEl = document.createElement('div');
        powerUpEl.id = `powerup-${powerUp.x}-${powerUp.y}`;
        powerUpEl.className = 'dementor';  // 复用 dementor 的样式
        dementorContainer.appendChild(powerUpEl);
    }

    // 更新位置和样式
    powerUpEl.style.left = pos.x + 'px';
    powerUpEl.style.top = pos.y + 'px';
    powerUpEl.style.fontSize = scaledSize + 'px';
    powerUpEl.textContent = powerUp.emoji;
}

function checkPowerUpCollision(powerUp, player) {
    const dx = powerUp.x - player.x;
    const dy = powerUp.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (powerUp.size + player.size) / 2;
}

function updatePowerLevel() {
    powerLevelElement.textContent = `火力: ${player.power}`;
}

function gameLoop(currentTime) {
    if (!isGameOver) {
        // 计算帧间时间（秒）
        const deltaTime = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0;
        lastFrameTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        clearDementors();  // 在每一帧开始时清除所有怪物元素

        if (gameStarted) {
            castSpell();

            // 更新和绘制所有游戏对象
            updateSpells();
            updatePowerUps();
            drawSpells();
            drawPowerUps();

            // 更新和绘制摄魂怪
            for (let i = dementors.length - 1; i >= 0; i--) {
                const dementor = dementors[i];

                // 根据不同模式更新位置，使用 deltaTime 使移动速度独立于帧率
                switch (dementor.pattern) {
                    case 'swing':
                        dementor.angle += dementor.angleSpeed * deltaTime;
                        dementor.y += dementor.speed * deltaTime * 60;  // 乘以 60 使速度与之前大致相同
                        dementor.x += Math.sin(dementor.angle) * dementor.amplitude * 0.1 * deltaTime * 60;
                        break;

                    case 'spiral':
                        dementor.angle += dementor.angleSpeed * deltaTime;
                        dementor.y += dementor.speed * deltaTime * 60;
                        dementor.x = dementor.initialX + Math.cos(dementor.angle) * dementor.radius;
                        break;

                    case 'zigzag':
                        dementor.y += dementor.speed * deltaTime * 60;

                        if (Date.now() - dementor.switchTime > dementor.switchInterval) {
                            dementor.direction *= -1;
                            dementor.switchTime = Date.now();
                        }
                        dementor.x += dementor.direction * dementor.amplitude * 0.1 * deltaTime * 60;
                        break;
                }

                // 确保摄魂怪不会完全离开屏幕
                dementor.x = Math.max(dementor.size / 2, Math.min(canvas.width - dementor.size / 2, dementor.x));

                // 检查是否被击中
                for (let j = spells.length - 1; j >= 0; j--) {
                    const spell = spells[j];
                    if (checkCollision(dementor, spell)) {
                        dementor.health--;
                        spells.splice(j, 1);

                        if (dementor.health <= 0) {
                            score++;
                            document.getElementById('score').textContent = `分数: ${score}`;
                            spawnPowerUp(dementor.x, dementor.y);
                            dementors.splice(i, 1);
                            continue;
                        }
                    }
                }

                // 绘制摄魂怪
                drawDementor(dementor.x, dementor.y, dementor.size, dementor.health, dementor.emoji);

                // 检查与玩家碰撞
                if (checkCollision(dementor, player
