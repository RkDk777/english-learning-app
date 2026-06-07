/**
 * Progress ring component using Canvas — a circular progress indicator
 */
export function createProgressRing({
  size = 120,
  strokeWidth = 10,
  progress = 0,     // 0-100
  color = 'var(--color-primary)',
  bgColor = 'var(--color-border-light)',
  text = '',
  subtext = '',
}) {
  const container = document.createElement('div');
  container.style.cssText = 'display:inline-flex;flex-direction:column;align-items:center;gap:4px;';

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  const ctx = canvas.getContext('2d');
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - strokeWidth) / 2;

  function draw() {
    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Progress arc
    if (progress > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * progress) / 100;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Center text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
    ctx.font = `bold ${size * 0.22}px -apple-system, "PingFang SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || `${Math.round(progress)}%`, centerX, centerY);
  }

  draw();
  container.appendChild(canvas);

  if (subtext) {
    const sub = document.createElement('span');
    sub.style.cssText = `font-size:var(--fs-sm);color:var(--color-text-muted);`;
    sub.textContent = subtext;
    container.appendChild(sub);
  }

  return {
    element: container,
    update: (newProgress, newText, newSubtext) => {
      progress = newProgress;
      text = newText || text;
      subtext = newSubtext || subtext;
      draw();
      if (newSubtext !== undefined) {
        const sub = container.querySelector('span');
        if (sub) sub.textContent = newSubtext;
      }
    },
  };
}
