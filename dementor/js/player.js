// 玩家类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.power = 0;
    }

    draw(ctx, castingSpell) {
        ctx.save();
        ctx.fillStyle = '#f00';  // 红白色调
        
        // 绘制裙子（三角形）
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size/3);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.closePath();
        ctx.fill();

        // 绘制头部（圆形）
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size/3, this.size/3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制蝴蝶结
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size/6, this.size/6, 0, Math.PI * 2);
        ctx.fill();

        // 如果正在施法，添加发光效果
        if (castingSpell) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export default Player;
