// 道具类
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.emoji = '⚡';  // 闪电表示火力道具

        // 创建并添加 DOM 元素
        this.element = document.createElement('div');
        this.element.className = 'dementor';  // 复用 dementor 的样式
        this.element.style.position = 'absolute';
        this.element.style.fontSize = this.size + 'px';  // 道具比怪物小一些
        this.element.style.zIndex = '2';
        this.element.textContent = this.emoji;
        document.getElementById('dementorContainer').appendChild(this.element);

        // 立即更新位置
        this.updatePosition();
    }

    update() {
        this.y += this.speed;
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
}

export default PowerUp;
