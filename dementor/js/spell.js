// 子弹类
class Spell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.speed = 10;
    }

    update() {
        this.y -= this.speed;
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, '#f00');  // 红色御札
        gradient.addColorStop(1, 'rgba(255,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default Spell;
