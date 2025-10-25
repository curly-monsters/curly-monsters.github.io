// source/js/Waves.js
class Waves {
    constructor(container, options = {}) {
      // 默认配置
      this.config = {
        lineColor: "#fff",
        backgroundColor: "transparent",
        waveSpeedX: 0.015, // 稍慢的水平速度
        waveSpeedY: 0.008, // 稍慢的垂直速度
        waveAmpX: 25, // 减小水平振幅
        waveAmpY: 15, // 减小垂直振幅
        xGap: 8, // 横向点间距（更小=更密集）
        yGap: 20, // 纵向点间距（更小=更密集）
        friction: 0.92,    // 稍大的摩擦系数，让鼠标交互更平滑
        tension: 0.01,      //增大张力（原值0.01）：恢复力更强
        maxCursorMove: 10,
        cursorStrength: 0.01, // 新增：鼠标影响力系数（越小影响越弱）
        maxDist: 100, // 新增：鼠标影响范围（越小影响范围越窄）

        ...options
      };
  
      this.container = container;
      this.init();
    }
  
    // 初始化画布和事件
    init() {
      // 创建 canvas 元素
      this.canvas = document.createElement("canvas");
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
  
      // 适配容器大小
      this.resize();
      window.addEventListener("resize", () => this.resize());
  
      // 初始化噪声生成器（用于波浪动画）
      this.noise = new Noise(Math.random());
  
      // 初始化点坐标
      this.lines = this.createPoints();
  
      // 鼠标交互
      this.mouse = { x: 0, y: 0, lx: 0, ly: 0, vs: 0 };
      this.container.addEventListener("mousemove", (e) => this.handleMouseMove(e));
      this.container.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: false });
  
      // 启动动画
      this.animate();
    }
  
    // 适配容器大小
    resize() {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.lines = this.createPoints(); // 重新计算点坐标
    }
  
    // 创建网格点
    createPoints() {
      const lines = [];
      const totalLines = Math.ceil(this.width / this.config.xGap) + 2; // 横向点数
      const totalPoints = Math.ceil(this.height / this.config.yGap) + 2; // 纵向点数
  
      for (let i = 0; i < totalLines; i++) {
        const points = [];
        for (let j = 0; j < totalPoints; j++) {
          points.push({
            x: i * this.config.xGap - this.config.xGap, // 左移一个间隔，避免边缘空白
            y: j * this.config.yGap - this.config.yGap,
            wave: { x: 0, y: 0 }, // 波浪偏移
            cursor: { x: 0, y: 0, vx: 0, vy: 0 } // 鼠标影响偏移
          });
        }
        lines.push(points);
      }
      return lines;
    }
  
    // 处理鼠标移动
    handleMouseMove(e) {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }
  
    // 处理触摸移动
    handleTouchMove(e) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = touch.clientX + rect.left;
      this.mouse.y = touch.clientY + rect.top;
    }
  
    // 更新点的位置（波浪+鼠标影响）
    updatePoints(time) {
      const { waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove, cursorStrength, maxDist, } = this.config;
  
      this.lines.forEach((points) => {
        points.forEach((p) => {
          // 波浪动画（基于噪声函数）
          const noiseX = (p.x + time * waveSpeedX) * 0.002;
          const noiseY = (p.y + time * waveSpeedY) * 0.0015;
          const noiseVal = this.noise.perlin2(noiseX, noiseY) * 12;
          p.wave.x = Math.cos(noiseVal) * waveAmpX;
          p.wave.y = Math.sin(noiseVal) * waveAmpY;
  
          // 鼠标影响（引力效果）
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = Math.max(175, this.mouse.vs);
  
          if (dist < maxDist) {
            const strength = (1 - dist / maxDist) * cursorStrength; // 用新系数减弱强度
          p.cursor.vx += (dx / dist) * strength * maxCursorMove;
          p.cursor.vy += (dy / dist) * strength * maxCursorMove;
          }
  
          // 衰减鼠标影响，让动画平滑
          p.cursor.vx *= friction;
          p.cursor.vy *= friction;

          // 增强复位力：通过张力将点拉回原始位置
    p.cursor.vx += (0 - p.cursor.x) * tension;  // 更大的张力 → 拉回力量更强
    p.cursor.vy += (0 - p.cursor.y) * tension;

          p.cursor.x += p.cursor.vx;
          p.cursor.y += p.cursor.vy;
  
          // 限制最大偏移
          p.cursor.x = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.x));
          p.cursor.y = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.y));
        });
      });
  
      // 更新鼠标速度（用于动画强度）
      this.mouse.vs = Math.max(0, this.mouse.vs - 0.5);
      const dMouseX = this.mouse.x - this.mouse.lx;
      const dMouseY = this.mouse.y - this.mouse.ly;
      this.mouse.vs = Math.max(this.mouse.vs, Math.hypot(dMouseX, dMouseY) * 0.05);
      this.mouse.lx = this.mouse.x;
      this.mouse.ly = this.mouse.y;
    }
  
    // 绘制波浪线
    drawLines() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.strokeStyle = this.config.lineColor;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
  
      // 绘制横向网格线（改用贝塞尔曲线平滑连接）
    this.lines.forEach((points) => {
      if (points.length < 2) return; // 至少需要2个点

      // 第一个点作为起点
      let firstPoint = this.getMovedPoint(points[0]);
      this.ctx.moveTo(firstPoint.x, firstPoint.y);

      // 遍历点，用贝塞尔曲线连接（取当前点和下一个点的中点作为控制点）
      for (let i = 0; i < points.length - 1; i++) {
        const curr = this.getMovedPoint(points[i]);
        const next = this.getMovedPoint(points[i + 1]);
        // 计算控制点（当前点和下一个点的中点）
        const controlX = (curr.x + next.x) / 2;
        const controlY = (curr.y + next.y) / 2;
        // 用二次贝塞尔曲线连接，替代直线
        this.ctx.quadraticCurveTo(curr.x, curr.y, controlX, controlY);
      }
    });

    this.ctx.stroke();
  }
  
    // 计算点的最终位置（原始位置+波浪+鼠标影响）
    getMovedPoint(p) {
      return {
        x: p.x + p.wave.x + p.cursor.x,
        y: p.y + p.wave.y + p.cursor.y
      };
    }
  
    // 动画循环
    animate(timestamp = 0) {
      this.updatePoints(timestamp);
      this.drawLines();
      requestAnimationFrame((t) => this.animate(t));
    }
  }
  
  // 噪声生成器（用于波浪自然波动）
  class Noise {
    constructor(seed = 0) {
      this.grad3 = [
        { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 },
        { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 },
        { x: 0, y: 1, z: 1 }, { x: 0, y: -1, z: 1 }, { x: 0, y: 1, z: -1 }, { x: 0, y: -1, z: -1 }
      ];
      this.p = Array.from({ length: 256 }, (_, i) => i);
      this.shuffle(seed);
      this.perm = [...this.p, ...this.p];
    }
  
    shuffle(seed) {
      for (let i = 255; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor(seed / (233280 / (i + 1)));
        [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
      }
    }
  
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(a, b, t) { return a + t * (b - a); }
    grad(hash, x, y) {
      const g = this.grad3[hash % 12];
      return x * g.x + y * g.y;
    }
  
    perlin2(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      const u = this.fade(x);
      const v = this.fade(y);
      const A = this.perm[X] + Y;
      const B = this.perm[X + 1] + Y;
      return this.lerp(
        this.lerp(this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y), u),
        this.lerp(this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1), u),
        v
      );
    }
  }
  
  // 全局暴露，方便在页面中调用
  window.Waves = Waves;