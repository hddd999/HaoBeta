import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPlanner, addDays, cooldownFor } from '../js/rotation.js';
import { SLOTS, DISHES, DISH_BY_ID } from '../js/dishes.js';

const pools = {};
for (const d of DISHES) (pools[d.pool] ??= []).push(d);

const START = '2026-01-01';
const DAYS = 400;

function plans(planner) {
  const out = [];
  for (let i = 0; i < DAYS; i++) out.push(planner.planFor(addDays(START, i)));
  return out;
}

test('cùng ngày luôn ra cùng thực đơn', () => {
  const a = createPlanner(SLOTS, pools);
  const b = createPlanner(SLOTS, pools);
  // b hỏi theo thứ tự ngược để chắc kết quả không phụ thuộc thứ tự truy vấn
  const late = b.planFor(addDays(START, DAYS));
  assert.deepEqual(a.planFor(addDays(START, DAYS)), late);
  assert.deepEqual(plans(a), plans(b));
});

test('bữa trưa và tối không bao giờ trùng món', () => {
  for (const p of plans(createPlanner(SLOTS, pools))) assert.notEqual(p.trua, p.toi);
});

test('món không lặp lại trước khi hết thời gian nghỉ', () => {
  const all = plans(createPlanner(SLOTS, pools));
  for (const [poolId, dishes] of Object.entries(pools)) {
    const cd = cooldownFor(dishes.length);
    const seq = [];
    for (const p of all) for (const s of SLOTS) if (s.pool === poolId) seq.push(p[s.id]);
    for (let i = 0; i < seq.length; i++) {
      for (let j = Math.max(0, i - cd); j < i; j++) {
        assert.notEqual(seq[i], seq[j], `${poolId}: ${seq[i]} lặp ở lượt ${j} và ${i}`);
      }
    }
  }
});

test('mọi món đều được xếp vào thực đơn', () => {
  const seen = new Set();
  for (const p of plans(createPlanner(SLOTS, pools))) Object.values(p).forEach((id) => seen.add(id));
  for (const d of DISHES) assert.ok(seen.has(d.id), `${d.id} chưa từng xuất hiện`);
});

test('trưa và tối thường khác nguồn đạm', () => {
  const all = plans(createPlanner(SLOTS, pools));
  const same = all.filter((p) => DISH_BY_ID[p.trua].protein === DISH_BY_ID[p.toi].protein).length;
  assert.ok(same / all.length < 0.1, `trùng đạm ${same}/${all.length} ngày`);
});

test('vẫn chạy khi tắt bớt món', () => {
  const small = { ...pools, chinh: pools.chinh.slice(0, 4), khuya: pools.khuya.slice(0, 2) };
  const all = plans(createPlanner(SLOTS, small));
  for (const p of all) {
    assert.notEqual(p.trua, p.toi);
    assert.ok(small.chinh.some((d) => d.id === p.trua));
  }
});
