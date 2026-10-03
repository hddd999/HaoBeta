// Biểu đồ đường cân nặng — SVG thuần, không dùng thư viện.
const NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function niceStep(range) {
  for (const s of [0.5, 1, 2, 5, 10, 20]) if (range / s <= 5) return s;
  return 50;
}

const fmt = (n) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });

/**
 * @param {HTMLElement} el
 * @param {{date:string,kg:number}[]} data  đã sắp xếp theo ngày
 * @param {number|null} goal
 * @param {{dayNumber:(k:string)=>number,label:(k:string)=>string}} helpers
 */
export function drawWeightChart(el, data, goal, { dayNumber, label }) {
  el.replaceChildren();
  if (!data.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Chưa có dữ liệu trong khoảng này.';
    el.append(p);
    return;
  }

  const W = Math.max(280, el.clientWidth);
  const H = 240;
  const m = { t: 16, r: 44, b: 28, l: 36 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;

  const xs = data.map((d) => dayNumber(d.date));
  let x0 = xs[0];
  let x1 = xs[xs.length - 1];
  if (x0 === x1) {
    x0 -= 3;
    x1 += 3;
  }

  const values = data.map((d) => d.kg);
  if (goal) values.push(goal);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = niceStep(Math.max(1, hi - lo));
  const y0 = Math.floor((lo - 0.3) / step) * step;
  const y1 = Math.ceil((hi + 0.3) / step) * step;

  const sx = (x) => m.l + ((x - x0) / (x1 - x0)) * iw;
  const sy = (y) => m.t + (1 - (y - y0) / (y1 - y0)) * ih;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': 'Biểu đồ cân nặng theo ngày' });

  // Lưới & trục Y
  for (let v = y0; v <= y1 + 1e-9; v += step) {
    const y = sy(v);
    svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: 'grid' }));
    const t = svgEl('text', { x: m.l - 6, y: y + 4, 'text-anchor': 'end', class: 'axis' });
    t.textContent = fmt(v);
    svg.append(t);
  }

  // Trục X: tối đa ~5 nhãn ngày
  const ticks = Math.min(5, data.length);
  const used = new Set();
  for (let i = 0; i < ticks; i++) {
    const idx = ticks === 1 ? 0 : Math.round((i * (data.length - 1)) / (ticks - 1));
    if (used.has(idx)) continue;
    used.add(idx);
    const x = sx(xs[idx]);
    const anchor = idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle';
    const t = svgEl('text', { x, y: H - 8, 'text-anchor': data.length === 1 ? 'middle' : anchor, class: 'axis' });
    t.textContent = label(data[idx].date);
    svg.append(t);
  }

  // Đường mục tiêu
  if (goal) {
    const y = sy(goal);
    svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: 'goal' }));
    const t = svgEl('text', { x: W - m.r - 4, y: y - 6, 'text-anchor': 'end', class: 'goal-label' });
    t.textContent = `Mục tiêu ${fmt(goal)} kg`;
    svg.append(t);
  }

  // Vùng nền + đường
  const pts = data.map((d, i) => [sx(xs[i]), sy(d.kg)]);
  if (pts.length > 1) {
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
    const base = m.t + ih;
    svg.append(svgEl('path', { d: `${line}L${pts[pts.length - 1][0]},${base}L${pts[0][0]},${base}Z`, class: 'area' }));
    svg.append(svgEl('path', { d: line, class: 'line' }));
  }

  // Chấm: hiện hết nếu ít điểm, nhiều điểm thì chỉ chấm cuối
  const showAll = pts.length <= 40;
  pts.forEach((p, i) => {
    if (showAll || i === pts.length - 1) svg.append(svgEl('circle', { cx: p[0], cy: p[1], r: 4, class: 'dot' }));
  });

  // Nhãn giá trị cuối
  const last = pts[pts.length - 1];
  const endLabel = svgEl('text', { x: last[0] + 8, y: last[1] + 4, class: 'end-label' });
  endLabel.textContent = fmt(data[data.length - 1].kg);
  svg.append(endLabel);

  // Lớp hover: crosshair bắt điểm gần nhất theo trục X
  const cross = svgEl('line', { y1: m.t, y2: m.t + ih, class: 'cross', visibility: 'hidden' });
  const hot = svgEl('circle', { r: 5, class: 'dot hot', visibility: 'hidden' });
  const hit = svgEl('rect', { x: m.l, y: 0, width: iw, height: H, fill: 'transparent' });
  svg.append(cross, hot, hit);

  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  const tipVal = document.createElement('b');
  const tipDate = document.createElement('span');
  tip.append(tipVal, tipDate);

  function show(clientX) {
    const r = svg.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * W;
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p[0] - px) < Math.abs(pts[best][0] - px)) best = i;
    });
    const [cx, cy] = pts[best];
    cross.setAttribute('x1', cx);
    cross.setAttribute('x2', cx);
    hot.setAttribute('cx', cx);
    hot.setAttribute('cy', cy);
    cross.setAttribute('visibility', 'visible');
    hot.setAttribute('visibility', 'visible');
    tipVal.textContent = `${fmt(data[best].kg)} kg`;
    tipDate.textContent = label(data[best].date);
    tip.hidden = false;
    const scale = r.width / W;
    const left = Math.min(Math.max(cx * scale, 50), r.width - 50);
    tip.style.left = `${left}px`;
    tip.style.top = `${cy * scale}px`;
  }
  function hide() {
    cross.setAttribute('visibility', 'hidden');
    hot.setAttribute('visibility', 'hidden');
    tip.hidden = true;
  }
  hit.addEventListener('pointermove', (e) => show(e.clientX));
  hit.addEventListener('pointerdown', (e) => show(e.clientX));
  hit.addEventListener('pointerleave', hide);

  el.append(svg, tip);
}
