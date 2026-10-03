import { SLOTS, POOLS, DISHES, DISH_BY_ID } from './dishes.js';
import { createPlanner, toKey, fromKey, addDays, dayNumber, cooldownFor } from './rotation.js';
import { drawWeightChart } from './chart.js';

// ---------- Lưu trữ (localStorage) ----------
const STORE_KEY = 'tangcan.v1';
const DEFAULT_STATE = { overrides: {}, eaten: {}, disabled: [], weights: [], goal: null, shop: {} };

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    /* bộ nhớ trình duyệt bị chặn — chạy tạm trong phiên */
  }
  return structuredClone(DEFAULT_STATE);
}

let state = load();

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    toast('Không lưu được — trình duyệt đang chặn bộ nhớ.');
  }
}

// ---------- Thực đơn ----------
let planner = null;
function getPlanner() {
  if (!planner) {
    const pools = {};
    for (const id of Object.keys(POOLS)) pools[id] = [];
    for (const d of DISHES) if (!state.disabled.includes(d.id)) pools[d.pool].push(d);
    planner = createPlanner(SLOTS, pools);
  }
  return planner;
}

function mealsFor(key) {
  const plan = getPlanner().planFor(key);
  const over = state.overrides[key] || {};
  return SLOTS.map((slot) => {
    const id = over[slot.id] || plan[slot.id];
    return { slot, dish: DISH_BY_ID[id] || null, swapped: Boolean(over[slot.id]) };
  });
}

// ---------- Định dạng ----------
const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const todayKey = () => toKey(new Date());
const ddmm = (key) => key.slice(8, 10) + '/' + key.slice(5, 7);
const ddmmyyyy = (key) => ddmm(key) + '/' + key.slice(0, 4);
const kg = (n) => n.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const money = (n) => (n >= 1e6 ? (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu' : Math.round(n / 1000) + 'k');
const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±') + kg(Math.abs(n));

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function qty(n, unit) {
  if (unit === 'g' && n >= 1000) return `${(n / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} kg`;
  if (unit === 'ml' && n >= 1000) return `${(n / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} lít`;
  return `${n} ${unit}`;
}

function weekStart(key) {
  const day = fromKey(key).getDay(); // 0 = CN
  return addDays(key, day === 0 ? -6 : 1 - day);
}

function dishMeta(dish) {
  const parts = [];
  if (dish.outside) parts.push('<span class="tag tag-out">Ăn ngoài</span>');
  else parts.push(`<span>⏱ ${dish.minutes} phút</span>`);
  parts.push(`<span>≈ ${money(dish.cost)}</span>`);
  return parts.join('');
}

function recipeHtml(dish) {
  const ing = dish.ing.length
    ? `<h4>Nguyên liệu</h4><ul class="ing">${dish.ing.map(([n, q, u]) => `<li>${esc(n)} <span>${esc(qty(q, u))}</span></li>`).join('')}</ul>`
    : '';
  const spice = dish.spice.length ? `<p class="spice">Gia vị: ${dish.spice.map(esc).join(', ')}</p>` : '';
  const steps = `<h4>${dish.outside ? 'Ghi chú' : 'Cách làm'}</h4><ol class="steps">${dish.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
  const tip = dish.tip ? `<p class="tip">💡 ${esc(dish.tip)}</p>` : '';
  const prep = dish.prep ? `<p class="tip">🕗 ${esc(dish.prep)}</p>` : '';
  return ing + spice + steps + tip + prep;
}

// ---------- Điều hướng ----------
const view = document.getElementById('view');
let selectedDay = todayKey();
let chartRange = '90';
let showAllHistory = false;
const HISTORY_LIMIT = 10;

function currentTab() {
  const t = location.hash.replace('#', '');
  return ['today', 'week', 'weight', 'dishes'].includes(t) ? t : 'today';
}

function render() {
  const tab = currentTab();
  document.querySelectorAll('.tabs a').forEach((a) => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'));
  if (tab === 'today') renderToday();
  if (tab === 'week') renderWeek();
  if (tab === 'weight') renderWeight();
  if (tab === 'dishes') renderDishes();
}

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

// ---------- Tab: Hôm nay ----------
function renderToday() {
  const key = selectedDay;
  const isToday = key === todayKey();
  const meals = mealsFor(key);
  const eaten = state.eaten[key] || {};
  const done = meals.filter((m) => eaten[m.slot.id]).length;
  const hasWeight = state.weights.some((w) => w.date === key);

  const tomorrowPrep = mealsFor(addDays(key, 1))
    .filter((m) => m.dish?.prep)
    .map((m) => `<li><b>${esc(m.slot.name)}:</b> ${esc(m.dish.prep)}</li>`);
  const uniquePrep = [...new Set(tomorrowPrep)];

  view.innerHTML = `
    <section class="day-head">
      <button class="icon-btn" data-act="day" data-delta="-1" aria-label="Ngày trước">‹</button>
      <div class="day-title">
        <h1>${WEEKDAYS[fromKey(key).getDay()]}</h1>
        <p>${ddmmyyyy(key)}${isToday ? ' · Hôm nay' : ` · <button class="link" data-act="go-today">Về hôm nay</button>`}</p>
      </div>
      <button class="icon-btn" data-act="day" data-delta="1" aria-label="Ngày sau">›</button>
    </section>

    <div class="card progress-card">
      <div class="progress-label"><span>Đã ăn <b>${done}/${meals.length}</b> bữa</span>
        <span class="muted">${done === meals.length ? 'Tuyệt, đủ bữa rồi! 🎉' : 'Ăn đủ bữa là chìa khoá tăng cân'}</span></div>
      <div class="bar"><span style="width:${(done / meals.length) * 100}%"></span></div>
    </div>

    ${
      !hasWeight && dayNumber(key) <= dayNumber(todayKey())
        ? `<form class="card quick-weight" data-form="quick-weight">
            <label for="qw">⚖️ ${isToday ? 'Sáng nay' : 'Hôm đó'} cân bao nhiêu?</label>
            <div class="row"><input id="qw" name="kg" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]{2,3}([.,][0-9])?" placeholder="kg" required>
            <button class="btn">Lưu</button></div>
          </form>`
        : ''
    }

    <ol class="meals">
      ${meals.map((m) => mealCard(m, eaten[m.slot.id])).join('')}
    </ol>

    ${
      uniquePrep.length
        ? `<div class="card prep"><h3>🕗 Chuẩn bị cho ngày mai</h3><ul>${uniquePrep.join('')}</ul></div>`
        : ''
    }
  `;
}

function mealCard({ slot, dish, swapped }, isEaten) {
  if (!dish) return `<li class="card meal"><p class="muted">${esc(slot.name)}: chưa có món — bật thêm món trong tab Món ăn.</p></li>`;
  return `
    <li class="card meal${isEaten ? ' done' : ''}">
      <div class="meal-top">
        <span class="slot">${esc(slot.name)} · ${slot.time}</span>
        <label class="check"><input type="checkbox" data-act="eat" data-slot="${slot.id}" ${isEaten ? 'checked' : ''}><span>Đã ăn</span></label>
      </div>
      <div class="meal-main">
        <span class="emoji" aria-hidden="true">${dish.emoji}</span>
        <div>
          <h3>${esc(dish.name)}</h3>
          <p class="meta">${dishMeta(dish)}${swapped ? '<span class="tag">Đã đổi</span>' : ''}</p>
        </div>
      </div>
      <div class="meal-actions">
        <details><summary>${dish.outside ? 'Ghi chú' : 'Cách làm'}</summary><div class="recipe">${recipeHtml(dish)}</div></details>
        <button class="btn ghost small" data-act="swap" data-slot="${slot.id}">↻ Đổi món</button>
      </div>
    </li>`;
}

// ---------- Tab: Tuần ----------
function renderWeek() {
  const start = weekStart(selectedDay);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = todayKey();

  // Gộp nguyên liệu cả tuần
  const totals = new Map();
  const spices = new Set();
  let cost = 0;
  let outside = 0;
  for (const d of days) {
    for (const { dish } of mealsFor(d)) {
      if (!dish) continue;
      cost += dish.cost;
      if (dish.outside) outside++;
      dish.spice.forEach((s) => spices.add(s));
      for (const [name, q, unit] of dish.ing) {
        const k = name + '|' + unit;
        totals.set(k, { name, unit, q: (totals.get(k)?.q || 0) + q });
      }
    }
  }
  const items = [...totals.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const checked = new Set(state.shop[start] || []);

  view.innerHTML = `
    <section class="day-head">
      <button class="icon-btn" data-act="week" data-delta="-7" aria-label="Tuần trước">‹</button>
      <div class="day-title">
        <h1>Thực đơn tuần</h1>
        <p>${ddmm(start)} – ${ddmm(days[6])}${days.includes(today) ? ' · Tuần này' : ` · <button class="link" data-act="go-today">Về tuần này</button>`}</p>
      </div>
      <button class="icon-btn" data-act="week" data-delta="7" aria-label="Tuần sau">›</button>
    </section>

    <div class="week-grid">
      ${days
        .map((d) => {
          const eaten = state.eaten[d] || {};
          return `
          <button class="card week-day${d === today ? ' is-today' : ''}" data-act="open-day" data-day="${d}">
            <div class="wd-head"><b>${WEEKDAYS_SHORT[fromKey(d).getDay()]}</b> <span>${ddmm(d)}</span></div>
            <ul>${mealsFor(d)
              .map(
                ({ slot, dish }) =>
                  `<li class="${eaten[slot.id] ? 'done' : ''}"><span class="wd-slot">${slot.short}</span><span class="wd-dish">${dish ? dish.emoji + ' ' + esc(dish.name) : '—'}</span></li>`,
              )
              .join('')}</ul>
          </button>`;
        })
        .join('')}
    </div>

    <section class="card shop">
      <div class="shop-head">
        <h2>🛒 Đi chợ cho tuần này</h2>
        <p class="muted">Chi phí ước tính cả tuần ≈ <b>${money(cost)}</b>${outside ? ` (gồm ${outside} bữa ăn ngoài)` : ''}. Giá chỉ để tham khảo.</p>
      </div>
      <ul class="shop-list">
        ${items
          .map(
            (it) => `<li><label class="check"><input type="checkbox" data-act="shop" data-week="${start}" data-item="${esc(it.name)}" ${checked.has(it.name) ? 'checked' : ''}>
              <span>${esc(it.name)}</span></label><span class="qty">${esc(qty(it.q, it.unit))}</span></li>`,
          )
          .join('')}
      </ul>
      ${spices.size ? `<p class="spice">Gia vị nên có sẵn: ${[...spices].sort((a, b) => a.localeCompare(b, 'vi')).map(esc).join(', ')}</p>` : ''}
      <p class="tip">💡 Ức gà mua 1 lần cho cả tuần, chia túi 200g rồi cấp đông — tối hôm trước lấy 1 túi xuống ngăn mát.</p>
    </section>
  `;
}

// ---------- Tab: Cân nặng ----------
function sortedWeights() {
  return [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
}

// Tốc độ tăng (kg/tuần) bằng hồi quy tuyến tính trên 28 ngày gần nhất
function weeklyRate(ws) {
  if (ws.length < 3) return null;
  const lastDay = dayNumber(ws[ws.length - 1].date);
  const recent = ws.filter((w) => lastDay - dayNumber(w.date) <= 28);
  if (recent.length < 3 || lastDay - dayNumber(recent[0].date) < 7) return null;
  const xs = recent.map((w) => dayNumber(w.date));
  const ys = recent.map((w) => w.kg);
  const mx = xs.reduce((a, b) => a + b) / xs.length;
  const my = ys.reduce((a, b) => a + b) / ys.length;
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my);
    den += (x - mx) ** 2;
  });
  return den ? (num / den) * 7 : null;
}

function renderWeight() {
  const ws = sortedWeights();
  const latest = ws[ws.length - 1];
  const first = ws[0];
  const rate = weeklyRate(ws);
  const goal = state.goal;

  let advice = '';
  if (rate !== null) {
    if (rate < 0.1)
      advice = `Cân gần như đứng yên (${signed(rate)} kg/tuần). Thử thêm 1 ly sinh tố chuối – bơ đậu phộng mỗi ngày, hoặc ăn thêm nửa chén cơm mỗi bữa chính.`;
    else if (rate > 0.75)
      advice = `Đang tăng khá nhanh (${signed(rate)} kg/tuần). Mức 0,25–0,5 kg/tuần giúp tăng cơ nhiều hơn tăng mỡ — có thể bớt một chút đồ ngọt.`;
    else advice = `Đang tăng đều ${signed(rate)} kg/tuần — rất tốt, cứ giữ nhịp này!`;
  }

  let eta = '';
  if (goal && latest && rate && rate > 0.05 && goal > latest.kg) {
    const days = Math.ceil(((goal - latest.kg) / rate) * 7);
    eta = `Với tốc độ này, bạn sẽ đạt ${kg(goal)} kg vào khoảng <b>${ddmmyyyy(addDays(latest.date, days))}</b>.`;
  }

  const sevenAgo = latest ? [...ws].reverse().find((w) => dayNumber(latest.date) - dayNumber(w.date) >= 7) : null;
  const progressPct = goal && first && latest && goal > first.kg ? Math.max(0, Math.min(100, ((latest.kg - first.kg) / (goal - first.kg)) * 100)) : null;

  view.innerHTML = `
    <section class="day-head solo"><div class="day-title"><h1>Cân nặng</h1><p>Cân mỗi sáng, sau khi đi vệ sinh, trước khi ăn.</p></div></section>

    <div class="card hero">
      ${
        latest
          ? `<div class="hero-num"><span class="hero-value">${kg(latest.kg)}</span><span class="hero-unit">kg</span></div>
             <p class="muted">Lần cân gần nhất: ${ddmmyyyy(latest.date)}</p>
             <div class="stats">
               <div class="stat"><span class="stat-label">Từ lúc bắt đầu</span><span class="stat-value">${signed(latest.kg - first.kg)} kg</span><span class="stat-sub">từ ${ddmm(first.date)}</span></div>
               <div class="stat"><span class="stat-label">7 ngày qua</span><span class="stat-value">${sevenAgo ? signed(latest.kg - sevenAgo.kg) + ' kg' : '—'}</span><span class="stat-sub">${sevenAgo ? 'so với ' + ddmm(sevenAgo.date) : 'chưa đủ dữ liệu'}</span></div>
               <div class="stat"><span class="stat-label">Còn tới mục tiêu</span><span class="stat-value">${goal ? (goal > latest.kg ? kg(goal - latest.kg) + ' kg' : 'Đã đạt 🎉') : '—'}</span><span class="stat-sub">${goal ? 'mục tiêu ' + kg(goal) + ' kg' : 'chưa đặt mục tiêu'}</span></div>
             </div>
             ${progressPct !== null ? `<div class="bar goal-bar" title="${Math.round(progressPct)}%"><span style="width:${progressPct}%"></span></div><p class="muted small">Đã đi được ${Math.round(progressPct)}% chặng đường</p>` : ''}`
          : `<p class="empty">Chưa có lần cân nào. Nhập cân nặng đầu tiên bên dưới để bắt đầu theo dõi.</p>`
      }
    </div>

    ${advice || eta ? `<div class="card insight">${advice ? `<p>${advice}</p>` : ''}${eta ? `<p>${eta}</p>` : ''}</div>` : ''}

    <div class="two-col">
      <form class="card" data-form="weight">
        <h2>Ghi cân nặng</h2>
        <div class="field-row">
          <label>Ngày<input name="date" type="date" value="${todayKey()}" max="${todayKey()}" required></label>
          <label>Cân nặng (kg)<input name="kg" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]{2,3}([.,][0-9])?" required placeholder="VD: 52,4"></label>
        </div>
        <button class="btn">Lưu</button>
      </form>
      <form class="card" data-form="goal">
        <h2>Mục tiêu</h2>
        <label>Cân nặng muốn đạt (kg)<input name="goal" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]{2,3}([.,][0-9])?" value="${goal ?? ''}" placeholder="VD: 60"></label>
        <button class="btn ghost">Lưu mục tiêu</button>
      </form>
    </div>

    <section class="card chart-card">
      <div class="chart-head">
        <h2>Diễn biến cân nặng (kg)</h2>
        <div class="seg" role="group" aria-label="Khoảng thời gian">
          ${[['30', '30 ngày'], ['90', '90 ngày'], ['all', 'Tất cả']]
            .map(([v, l]) => `<button data-act="range" data-range="${v}" aria-pressed="${chartRange === v}">${l}</button>`)
            .join('')}
        </div>
      </div>
      <div class="chart" id="chart"></div>
    </section>

    <section class="card">
      <h2>Lịch sử</h2>
      ${
        ws.length
          ? `<table class="history"><thead><tr><th>Ngày</th><th>Cân nặng</th><th>Thay đổi</th><th></th></tr></thead><tbody>
            ${[...ws]
              .reverse()
              .slice(0, showAllHistory ? undefined : HISTORY_LIMIT + 1)
              .map((w, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? w.kg - prev.kg : null;
                if (i === HISTORY_LIMIT && !showAllHistory) return '';
                return `<tr><td>${WEEKDAYS_SHORT[fromKey(w.date).getDay()]} ${ddmmyyyy(w.date)}</td><td><b>${kg(w.kg)}</b> kg</td>
                  <td class="${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${diff === null ? '' : signed(diff)}</td>
                  <td><button class="icon-btn small" data-act="del-weight" data-date="${w.date}" aria-label="Xoá ngày ${ddmm(w.date)}">✕</button></td></tr>`;
              })
              .join('')}
          </tbody></table>
          ${ws.length > HISTORY_LIMIT ? `<button class="btn ghost small full" data-act="history">${showAllHistory ? 'Thu gọn' : `Xem tất cả ${ws.length} lần cân`}</button>` : ''}`
          : '<p class="muted">Chưa có dữ liệu.</p>'
      }
    </section>

    <section class="card backup">
      <h2>Sao lưu dữ liệu</h2>
      <p class="muted">Dữ liệu chỉ lưu trong trình duyệt của máy này. Thỉnh thoảng xuất file sao lưu để không bị mất khi xoá lịch sử duyệt web hoặc đổi máy.</p>
      <div class="row">
        <button class="btn ghost" data-act="export">⬇ Xuất file</button>
        <label class="btn ghost">⬆ Nhập file<input type="file" accept="application/json" data-act="import" hidden></label>
      </div>
    </section>
  `;
  paintChart();
}

function paintChart() {
  const el = document.getElementById('chart');
  if (!el) return;
  let ws = sortedWeights();
  if (chartRange !== 'all' && ws.length) {
    const cutoff = dayNumber(todayKey()) - Number(chartRange);
    ws = ws.filter((w) => dayNumber(w.date) >= cutoff);
  }
  drawWeightChart(el, ws, state.goal, { dayNumber, label: ddmm });
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(paintChart, 150);
});

// ---------- Tab: Món ăn ----------
function renderDishes() {
  view.innerHTML = `
    <section class="day-head solo"><div class="day-title"><h1>Món ăn</h1>
      <p>Tắt món bạn không thích — thực đơn sẽ tự xếp lại. Món vừa ăn sẽ được "nghỉ" vài ngày rồi mới quay lại.</p></div></section>
    ${Object.entries(POOLS)
      .map(([poolId, pool]) => {
        const dishes = DISHES.filter((d) => d.pool === poolId);
        const on = dishes.filter((d) => !state.disabled.includes(d.id)).length;
        const perDay = SLOTS.filter((s) => s.pool === poolId).length;
        const rest = Math.max(1, Math.floor(cooldownFor(on) / perDay));
        return `
        <section class="card pool">
          <div class="pool-head"><h2>${esc(pool.name)}</h2><span class="muted small">${on}/${dishes.length} món · lặp lại sau ≥ ${rest} ngày</span></div>
          <ul class="dish-list">
            ${dishes
              .map((d) => {
                const enabled = !state.disabled.includes(d.id);
                return `<li class="${enabled ? '' : 'off'}">
                  <div class="dish-row">
                    <span class="emoji" aria-hidden="true">${d.emoji}</span>
                    <div class="dish-info"><b>${esc(d.name)}</b><p class="meta">${dishMeta(d)}</p></div>
                    <label class="switch" title="${enabled ? 'Đang dùng' : 'Đã tắt'}"><input type="checkbox" data-act="toggle-dish" data-id="${d.id}" ${enabled ? 'checked' : ''} aria-label="Dùng món ${esc(d.name)}"><span></span></label>
                  </div>
                  <details><summary>${d.outside ? 'Ghi chú' : 'Cách làm'}</summary><div class="recipe">${recipeHtml(d)}</div></details>
                </li>`;
              })
              .join('')}
          </ul>
        </section>`;
      })
      .join('')}
  `;
}

// ---------- Đổi món ----------
const dialog = document.getElementById('swap-dialog');
let swapCtx = null;

function openSwap(slotId) {
  const slot = SLOTS.find((s) => s.id === slotId);
  const current = mealsFor(selectedDay).find((m) => m.slot.id === slotId);
  const options = DISHES.filter((d) => d.pool === slot.pool && !state.disabled.includes(d.id) && d.id !== current.dish?.id);
  swapCtx = { slotId, key: selectedDay };
  dialog.innerHTML = `
    <form method="dialog" class="swap">
      <div class="swap-head"><h2>Đổi ${esc(slot.name.toLowerCase())}</h2><button class="icon-btn" value="cancel" aria-label="Đóng">✕</button></div>
      <p class="muted small">${ddmmyyyy(selectedDay)} · đang là: ${current.dish ? esc(current.dish.name) : '—'}</p>
      <ul class="swap-list">
        ${options
          .map(
            (d) => `<li><button class="swap-opt" value="${d.id}"><span class="emoji" aria-hidden="true">${d.emoji}</span>
              <span><b>${esc(d.name)}</b><span class="meta">${dishMeta(d)}</span></span></button></li>`,
          )
          .join('')}
      </ul>
      ${current.swapped ? '<button class="btn ghost full" value="__reset">Dùng lại món gốc của lịch</button>' : ''}
    </form>`;
  dialog.showModal();
}

dialog.addEventListener('close', () => {
  const v = dialog.returnValue;
  if (!swapCtx || !v || v === 'cancel') return;
  const { key, slotId } = swapCtx;
  state.overrides[key] ??= {};
  if (v === '__reset') delete state.overrides[key][slotId];
  else state.overrides[key][slotId] = v;
  if (!Object.keys(state.overrides[key]).length) delete state.overrides[key];
  save();
  render();
  toast(v === '__reset' ? 'Đã dùng lại món gốc' : 'Đã đổi món');
});

// ---------- Sự kiện ----------
view.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'day') {
    selectedDay = addDays(selectedDay, Number(el.dataset.delta));
    render();
  } else if (act === 'week') {
    selectedDay = addDays(weekStart(selectedDay), Number(el.dataset.delta));
    render();
  } else if (act === 'go-today') {
    selectedDay = todayKey();
    render();
  } else if (act === 'open-day') {
    selectedDay = el.dataset.day;
    location.hash = 'today';
  } else if (act === 'swap') {
    openSwap(el.dataset.slot);
  } else if (act === 'range') {
    chartRange = el.dataset.range;
    view.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', b === el));
    paintChart();
  } else if (act === 'history') {
    showAllHistory = !showAllHistory;
    render();
  } else if (act === 'del-weight') {
    if (!confirm(`Xoá cân nặng ngày ${ddmmyyyy(el.dataset.date)}?`)) return;
    state.weights = state.weights.filter((w) => w.date !== el.dataset.date);
    save();
    render();
  } else if (act === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tang-can-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
});

view.addEventListener('change', (e) => {
  const el = e.target;
  const act = el.dataset.act;
  if (act === 'eat') {
    state.eaten[selectedDay] ??= {};
    if (el.checked) state.eaten[selectedDay][el.dataset.slot] = true;
    else delete state.eaten[selectedDay][el.dataset.slot];
    save();
    render();
  } else if (act === 'shop') {
    const list = new Set(state.shop[el.dataset.week] || []);
    el.checked ? list.add(el.dataset.item) : list.delete(el.dataset.item);
    state.shop[el.dataset.week] = [...list];
    save();
  } else if (act === 'toggle-dish') {
    const d = DISH_BY_ID[el.dataset.id];
    if (!el.checked) {
      const on = DISHES.filter((x) => x.pool === d.pool && !state.disabled.includes(x.id)).length;
      if (on <= POOLS[d.pool].min) {
        el.checked = true;
        toast(`Cần giữ ít nhất ${POOLS[d.pool].min} món để thực đơn còn xoay vòng được.`);
        return;
      }
      state.disabled.push(d.id);
    } else {
      state.disabled = state.disabled.filter((id) => id !== d.id);
    }
    planner = null;
    save();
    render();
  } else if (act === 'import') {
    const file = el.files[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const data = JSON.parse(text);
        if (!Array.isArray(data.weights)) throw new Error();
        if (!confirm('Thay toàn bộ dữ liệu hiện tại bằng file này?')) return;
        state = { ...structuredClone(DEFAULT_STATE), ...data };
        planner = null;
        save();
        render();
        toast('Đã nhập dữ liệu');
      } catch {
        toast('File không hợp lệ');
      }
    });
  }
});

view.addEventListener('submit', (e) => {
  const form = e.target;
  e.preventDefault();
  const data = new FormData(form);
  if (form.dataset.form === 'quick-weight' || form.dataset.form === 'weight') {
    const value = Math.round(parseFloat(String(data.get('kg')).replace(',', '.')) * 10) / 10;
    const date = form.dataset.form === 'weight' ? data.get('date') : selectedDay;
    if (!(value >= 20 && value <= 250) || !date) return toast('Cân nặng không hợp lệ');
    state.weights = state.weights.filter((w) => w.date !== date);
    state.weights.push({ date, kg: value });
    save();
    render();
    toast(`Đã lưu ${kg(value)} kg`);
  } else if (form.dataset.form === 'goal') {
    const raw = String(data.get('goal')).trim();
    const value = raw ? Math.round(parseFloat(raw.replace(',', '.')) * 10) / 10 : null;
    if (raw && !(value >= 20 && value <= 250)) return toast('Mục tiêu không hợp lệ');
    state.goal = value;
    save();
    render();
    toast(value ? `Mục tiêu: ${kg(value)} kg` : 'Đã xoá mục tiêu');
  }
});

// ---------- Thông báo ngắn ----------
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// Sang ngày mới khi để tab mở qua đêm
let lastToday = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || todayKey() === lastToday) return;
  if (selectedDay === lastToday) selectedDay = todayKey();
  lastToday = todayKey();
  render();
});

render();
