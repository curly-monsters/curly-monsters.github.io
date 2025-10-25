// themes/hexo-theme-last/source/js/logo-loop.js
document.addEventListener('DOMContentLoaded', () => {
  // 配置参数（和 React 版本保持保持一致）
  const ANIMATION_CONFIG = {
    SMOOTH_TAU: 0.25,
    MIN_COPIES: 2,
    COPY_HEADROOM: 2
  };

  // 获取容器元素
  const container = document.getElementById('logo-loop');
  if (!container) return;

  const track = container.querySelector('.logoloop__track');
  const originalList = container.querySelector('.logoloop__list--original');
  if (!track || !originalList) return;

  // 状态变量
  let seqWidth = 0;
  let copyCount = ANIMATION_CONFIG.MIN_COPIES;
  let isHovered = false;
  let offset = 0;
  let velocity = 0;
  let lastTimestamp = null;
  let rafId = null;

  // 从 HTML 数据属性读取配置（和 React props 对应）
  const config = {
    speed: parseInt(container.dataset.speed) || 120,
    direction: container.dataset.direction || 'left',
    pauseOnHover: container.dataset.pauseOnHover === 'true',
    scaleOnHover: container.dataset.scaleOnHover === 'true',
    fadeOut: container.dataset.fadeOut === 'true',
    fadeOutColor: container.dataset.fadeOutColor || ''
  };

  // 计算目标速度（适配方向）
  const getTargetVelocity = () => {
    const magnitude = Math.abs(config.speed);
    const directionMultiplier = config.direction === 'left' ? 1 : -1;
    return magnitude * directionMultiplier;
  };

  // 更新复制 LOGO 列表（实现无缝循环）
  const updateCopies = () => {
    // 清空现有复制项（保留原始列表）
    while (track.children.length > 1) {
      track.removeChild(track.lastChild);
    }

    // 计算需要的复制份数
    const containerWidth = container.clientWidth;
    seqWidth = originalList.offsetWidth;
    if (seqWidth === 0) return;

    const copiesNeeded = Math.ceil(containerWidth / seqWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
    copyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);

    // 复制列表
    for (let i = 1; i < copyCount; i++) {
      const clone = originalList.cloneNode(true);
      clone.classList.remove('logoloop__list--original');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  };

  // 动画循环（和 React hooks 逻辑对应）
  const animate = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = Math.max(0, timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    // 计算目标速度（悬停逻辑）
    const targetVelocity = config.pauseOnHover && isHovered ? 0 : getTargetVelocity();

    // 平滑缓动（和 React 中的 easing 对应）
    const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
    velocity += (targetVelocity - velocity) * easingFactor;

    // 更新偏移量（循环逻辑）
    if (seqWidth > 0) {
      offset += velocity * deltaTime;
      offset = ((offset % seqWidth) + seqWidth) % seqWidth; // 循环重置
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }

    rafId = requestAnimationFrame(animate);
  };

  // 事件监听
  container.addEventListener('mouseenter', () => {
    isHovered = true;
  });
  container.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  // 窗口大小变化时重新计算
  const resizeObserver = new ResizeObserver(() => {
    updateCopies();
  });
  resizeObserver.observe(container);
  resizeObserver.observe(originalList);

  // 图片加载完成后初始化
  const images = originalList.querySelectorAll('img');
  let loadedCount = 0;
  const checkLoaded = () => {
    loadedCount++;
    if (loadedCount === images.length) {
      updateCopies();
      rafId = requestAnimationFrame(animate);
    }
  };

  if (images.length === 0) {
    updateCopies();
    rafId = requestAnimationFrame(animate);
  } else {
    images.forEach(img => {
      if (img.complete) checkLoaded();
      else {
        img.addEventListener('load', checkLoaded);
        img.addEventListener('error', checkLoaded);
      }
    });
  }

  // 清理函数
  window.addEventListener('unload', () => {
    resizeObserver.disconnect();
    cancelAnimationFrame(rafId);
  });
});