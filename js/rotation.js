// Thuật toán xoay vòng thực đơn.
//
// Mỗi nhóm món (pool) được bốc lần lượt theo ngày, bắt đầu từ một mốc cố định,
// với bộ sinh số ngẫu nhiên có seed — nên cùng một ngày luôn ra cùng thực đơn
// (mở lại trang hay đổi máy cũng vậy), nhưng không theo vòng lặp cứng.
//
// Luật chống ngán:
//  - Một món vừa ăn sẽ bị "nghỉ" trong khoảng 2/3 số món của nhóm đó
//    (VD: 14 món chính → nghỉ 9 lượt ≈ 4,5 ngày mới được lặp lại).
//  - Bữa trưa và bữa tối không bao giờ trùng món, và ưu tiên khác nguồn đạm
//    (trưa ăn gà thì tối ưu tiên đậu hũ/trứng/...).

const DAY_MS = 86400000;
const ANCHOR = Math.floor(Date.UTC(2020, 0, 1) / DAY_MS);

export function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dayNumber(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function addDays(key, n) {
  const date = fromKey(key);
  date.setDate(date.getDate() + n);
  return toKey(date);
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cooldownFor(n) {
  if (n <= 1) return 0;
  return Math.min(n - 1, Math.max(1, n - Math.ceil(n / 3)));
}

/**
 * Tạo bộ lập lịch.
 * @param {Array<{id:string,pool:string}>} slots  các bữa trong ngày, theo thứ tự
 * @param {Record<string, Array<{id:string,protein?:string}>>} pools  món đang bật của từng nhóm
 */
export function createPlanner(slots, pools) {
  const signature = Object.keys(pools)
    .sort()
    .map((p) => `${p}:${pools[p].map((d) => d.id).join(',')}`)
    .join('|');
  const rand = mulberry32(hash(signature));

  const state = {};
  for (const [poolId, dishes] of Object.entries(pools)) {
    state[poolId] = {
      dishes,
      cooldown: cooldownFor(dishes.length),
      lastPick: new Map(), // dishId -> số thứ tự lượt bốc gần nhất
      count: 0,
    };
  }

  const days = []; // days[i] = { slotId: dishId }

  function pick(poolId, avoidProtein) {
    const st = state[poolId];
    if (!st || st.dishes.length === 0) return null;
    const rested = st.dishes.filter((d) => {
      const last = st.lastPick.get(d.id);
      return last === undefined || st.count - last > st.cooldown;
    });
    let candidates = rested.length ? rested : st.dishes;
    if (avoidProtein) {
      const varied = candidates.filter((d) => d.protein !== avoidProtein);
      if (varied.length) candidates = varied;
    }
    const chosen = candidates[Math.floor(rand() * candidates.length)];
    st.lastPick.set(chosen.id, st.count);
    st.count++;
    return chosen;
  }

  function extendTo(index) {
    while (days.length <= index) {
      const day = {};
      const proteinsToday = {};
      for (const slot of slots) {
        const dish = pick(slot.pool, proteinsToday[slot.pool]);
        day[slot.id] = dish ? dish.id : null;
        if (dish) proteinsToday[slot.pool] = dish.protein;
      }
      days.push(day);
    }
  }

  return {
    /** Thực đơn mặc định (chưa tính món người dùng tự đổi) của ngày `key`. */
    planFor(key) {
      let index = dayNumber(key) - ANCHOR;
      if (index < 0) index = ((index % 3650) + 3650) % 3650;
      extendTo(index);
      return days[index];
    },
  };
}
