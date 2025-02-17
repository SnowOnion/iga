// 敌人类
class Dementor {
    constructor(x, y, pattern) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.health = 3;
        this.maxHealth = 3;
        this.initialX = x;
        
        // 移动模式相关属性
        Object.assign(this, pattern);

        // 创建并添加 DOM 元素
        this.element = document.createElement('div');
        this.element.className = 'dementor';
        this.element.style.position = 'absolute';
        this.element.style.fontSize = this.size + 'px';
        this.element.style.zIndex = '2';
        this.element.textContent = pattern.emoji;  // 使用传入的 emoji

        // 创建生命值条容器
        this.healthBar = document.createElement('div');
        this.healthBar.style.position = 'absolute';
        this.healthBar.style.width = this.size + 'px';
        this.healthBar.style.height = '3px';
        this.healthBar.style.top = '-10px';
        this.healthBar.style.left = '50%';
        this.healthBar.style.transform = 'translateX(-50%)';
        this.healthBar.style.zIndex = '3';

        // 创建生命值条背景
        this.healthBarBg = document.createElement('div');
        this.healthBarBg.style.position = 'absolute';
        this.healthBarBg.style.width = '100%';
        this.healthBarBg.style.height = '100%';
        this.healthBarBg.style.backgroundColor = '#600';

        // 创建生命值条前景
        this.healthBarFg = document.createElement('div');
        this.healthBarFg.style.position = 'absolute';
        this.healthBarFg.style.width = '100%';
        this.healthBarFg.style.height = '100%';
        this.healthBarFg.style.backgroundColor = '#f00';
        this.healthBarFg.style.transition = 'width 0.1s';

        // 组装生命值条
        this.healthBar.appendChild(this.healthBarBg);
        this.healthBar.appendChild(this.healthBarFg);
        this.element.appendChild(this.healthBar);

        // 添加到容器
        const container = document.getElementById('dementorContainer');
        if (!container) {
            console.error('dementorContainer not found!');
            return;
        }
        container.appendChild(this.element);

        // 立即更新位置
        this.updatePosition();
    }

    update(deltaTime) {
        // 根据不同模式更新位置
        switch (this.pattern) {
            case 'swing':
                this.angle += this.angleSpeed * deltaTime;
                this.y += this.speed * deltaTime * 60;
                this.x += Math.sin(this.angle) * this.amplitude * 0.1 * deltaTime * 60;
                break;

            case 'spiral':
                this.angle += this.angleSpeed * deltaTime;
                this.y += this.speed * deltaTime * 60;
                this.x = this.initialX + Math.cos(this.angle) * this.radius;
                break;

            case 'zigzag':
                this.y += this.speed * deltaTime * 60;

                if (Date.now() - this.switchTime > this.switchInterval) {
                    this.direction *= -1;
                    this.switchTime = Date.now();
                }
                this.x += this.direction * this.amplitude * 0.1 * deltaTime * 60;
                break;
        }

        // 确保不会完全离开屏幕
        this.x = Math.max(this.size / 2, Math.min(400 - this.size / 2, this.x));

        // 更新位置
        this.updatePosition();
    }

    updatePosition() {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const pos = {
            x: rect.left + (this.x * rect.width / canvas.width),
            y: rect.top + (this.y * rect.height / canvas.height)
        };
        
        this.element.style.left = pos.x + 'px';
        this.element.style.top = pos.y + 'px';
        
        // 更新生命值条
        this.healthBarFg.style.width = (this.health / this.maxHealth * 100) + '%';
    }

    draw() {
        // 不再需要 canvas 绘制，位置更新已经在 update 中完成
    }

    destroy() {
        // 从 DOM 中移除元素
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    static getPattern() {
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

        return patterns[Math.floor(Math.random() * patterns.length)];
    }
}

export default Dementor;
