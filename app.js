(function () {
'use strict';
const D = window.SHARK_DATA;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const NA = '__na__';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Field definitions ---------- */
const F = [
  { k: 'year', l: 'Year', t: 'num', g: 'When', int: 1, bin: 10, d: 'Calendar year of the incident. 2026 is a partial year.' },
  { k: 'decade', l: 'Decade', t: 'num', g: 'When', int: 1, bin: 10, d: 'Decade of the incident (e.g. 1990 = the 1990s).' },
  { k: 'month', l: 'Month', t: 'num', g: 'When', int: 1, bin: 1, fmt: (v) => MONTHS[v - 1], d: 'Month of the incident (1 = January).' },
  { k: 'season', l: 'Season', t: 'cat', g: 'When', order: ['Summer', 'Autumn', 'Winter', 'Spring'], d: 'Southern-hemisphere season, worked out from the month.' },
  { k: 'hour', l: 'Hour of day', t: 'num', g: 'When', int: 1, bin: 1, fmt: (v) => v + ':00', d: 'Hour (0-23) of the incident. Only recorded for some incidents.' },
  { k: 'tod', l: 'Time of day', t: 'cat', g: 'When', order: ['Night (9pm-5am)', 'Early morning (5-9am)', 'Morning (9am-12pm)', 'Afternoon (12-5pm)', 'Evening (5-9pm)'], d: 'Time-of-day band worked out from the hour.' },
  { k: 'state', l: 'State / territory', t: 'cat', g: 'Where', d: 'Australian state or territory.' },
  { k: 'site', l: 'Site category', t: 'cat', g: 'Where', d: 'Type of water body where the incident happened.' },
  { k: 'location', l: 'Location', t: 'text', g: 'Where', d: 'Place name (free text).' },
  { k: 'lat', l: 'Latitude', t: 'num', g: 'Where', d: 'Latitude in degrees (negative = south).' },
  { k: 'lon', l: 'Longitude', t: 'num', g: 'Where', d: 'Longitude in degrees east.' },
  { k: 'dist_shore', l: 'Distance to shore', t: 'num', g: 'Where', unit: 'm', int: 1, d: 'Distance from the shore in metres.' },
  { k: 'species', l: 'Shark species', t: 'cat', g: 'Shark', d: 'Common name of the shark. "Unidentified" includes unknown and uncertain.' },
  { k: 'length', l: 'Shark length', t: 'num', g: 'Shark', unit: 'm', d: 'Estimated shark length in metres (ranges averaged).' },
  { k: 'n_sharks', l: 'Number of sharks', t: 'num', g: 'Shark', int: 1, d: 'How many sharks were involved.' },
  { k: 'captured', l: 'Shark captured?', t: 'cat', g: 'Shark', d: 'Was the shark captured afterwards?' },
  { k: 'gender', l: 'Victim gender', t: 'cat', g: 'Victim', d: 'Recorded gender of the victim.' },
  { k: 'age', l: 'Victim age', t: 'num', g: 'Victim', unit: 'years', int: 1, d: 'Age in years. Decade ranges (e.g. "60s") become the middle (65); "teen" = 16.' },
  { k: 'agegrp', l: 'Victim age group', t: 'cat', g: 'Victim', order: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70+'], d: 'Age grouped into decades.' },
  { k: 'activity', l: 'Victim activity', t: 'cat', g: 'Victim', d: 'What the victim was doing. Similar activities have been grouped.' },
  { k: 'clothing', l: 'Victim clothing', t: 'cat', g: 'Victim', d: 'What the victim was wearing (rarely recorded).' },
  { k: 'aware', l: 'Victim aware of shark?', t: 'cat', g: 'Victim', d: 'Was the victim aware of the shark before the incident?' },
  { k: 'outcome', l: 'Outcome', t: 'cat', g: 'Incident', order: ['Fatal', 'Injured', 'Uninjured', 'Unknown'], d: 'Whether the victim died, was injured or was uninjured.' },
  { k: 'provoked', l: 'Provoked or unprovoked', t: 'cat', g: 'Incident', d: 'Whether the victim did something to provoke the shark.' },
  { k: 'severity', l: 'Injury severity', t: 'cat', g: 'Incident', d: 'Type of injury (grouped).' },
  { k: 'injloc', l: 'Main injury location', t: 'cat', g: 'Incident', d: 'First body part listed as injured.' },
  { k: 'n_areas', l: 'Body areas injured', t: 'num', g: 'Incident', int: 1, d: 'How many body areas were injured.' },
  { k: 'object', l: 'Object bitten', t: 'cat', g: 'Incident', d: 'Object the shark bit (only recorded when an object was involved).' },
  { k: 'direction', l: 'Direction of first strike', t: 'cat', g: 'Incident', d: 'Where the shark first struck from.' },
  { k: 'depth', l: 'Depth of incident', t: 'num', g: 'Conditions', unit: 'm', d: 'Depth at which the incident happened.' },
  { k: 'water_depth', l: 'Total water depth', t: 'num', g: 'Conditions', unit: 'm', d: 'Total depth of water at the site.' },
  { k: 'water_temp', l: 'Water temperature', t: 'num', g: 'Conditions', unit: '°C', d: 'Water temperature (rarely recorded).' },
  { k: 'air_temp', l: 'Air temperature', t: 'num', g: 'Conditions', unit: '°C', d: 'Air temperature (rarely recorded).' },
  { k: 'vis', l: 'Water visibility', t: 'num', g: 'Conditions', unit: 'm', d: 'Water visibility in metres.' },
  { k: 'time_in_water', l: 'Time in water', t: 'num', g: 'Conditions', unit: 'min', d: 'Minutes the victim had been in the water.' },
  { k: 'weather', l: 'Weather', t: 'cat', g: 'Conditions', d: 'Weather condition (rarely recorded).' },
  { k: 'ppl3', l: 'People within 3 m', t: 'num', g: 'Conditions', int: 1, d: 'Number of other people within 3 m.' },
  { k: 'ppl15', l: 'People 3-15 m away', t: 'num', g: 'Conditions', int: 1, d: 'Number of other people 3 to 15 m away.' },
  { k: 'source', l: 'Data source', t: 'cat', g: 'Data', d: 'Where the information came from.' },
  { k: 'id', l: 'Record ID', t: 'text', g: 'Data', d: 'Unique incident number in the database.' },
];
const FB = {}; F.forEach((f) => (FB[f.k] = f));
const GROUPS = ['When', 'Where', 'Shark', 'Victim', 'Incident', 'Conditions', 'Data'];
const lab = (f) => f.l + (f.unit ? ' (' + f.unit + ')' : '');

/* palette (validated default categorical palette; see dataviz skill) */
const PAL = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'],
  other: { light: '#8a8f98', dark: '#8a919b' }, nr: { light: '#c3c8ce', dark: '#4b525b' },
};
const SHAPES = ['circle', 'triangle', 'rect', 'rectRot', 'cross', 'star', 'crossRot', 'rectRounded'];

F.forEach((f) => {
  const vs = D.map((r) => r[f.k]).filter((v) => v != null);
  f.n = vs.length; f.miss = D.length - vs.length;
  if (f.t === 'num') { f.min = Math.min(...vs); f.max = Math.max(...vs); }
  if (f.t === 'cat') {
    const c = {}; vs.forEach((v) => (c[v] = (c[v] || 0) + 1));
    f.counts = c;
    f.vals = Object.keys(c).sort((a, b) => (f.order ? f.order.indexOf(a) - f.order.indexOf(b) : c[b] - c[a]));
    f.slot = {};
    if (f.order && f.vals.length <= 8) f.order.forEach((v, i) => { if (c[v]) f.slot[v] = i; });
    else { const rank = Object.keys(c).sort((a, b) => c[b] - c[a]); const keep = rank.length <= 8 ? rank.length : 7; rank.slice(0, keep).forEach((v, i) => (f.slot[v] = i)); }
  }
});

/* ---------- State ---------- */
const DEF_COLS = ['id', 'year', 'month', 'state', 'location', 'species', 'length', 'outcome', 'activity', 'gender', 'age', 'provoked'];
const S = {
  tab: 'chart', colors: { scheme: 'default', over: {} }, pred: null, _cols: [],
  chart: { type: 'column', x: 'species', y: 'length', measure: 'count', vf: 'length', split: '', bin: '', sort: 'desc', top: 10, trend: false, stack: true, horiz: false, jitter: true, vals: true, title: '' },
  table: { cols: DEF_COLS.slice(), sort: [], page: 0, size: 25, q: '' },
  piv: { row: 'state', col: 'outcome', measure: 'count', vf: 'age', show: 'values', bin: '' },
  prof: 'age',
};
let RF = D.slice();
let chart = null;

/* ---------- Helpers ---------- */
const isDark = () => document.documentElement.dataset.theme === 'dark' || (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const palette = () => (S.colors.scheme !== 'default' && SCHEMES[S.colors.scheme] ? SCHEMES[S.colors.scheme].c.slice() : isDark() ? PAL.dark : PAL.light);
const ov = (name, base) => S.colors.over[name] || base;
const otherCol = () => (isDark() ? PAL.other.dark : PAL.other.light);
const nrCol = () => (isDark() ? PAL.nr.dark : PAL.nr.light);
const fmtN = (v) => {
  if (v == null || isNaN(v)) return '–';
  const a = Math.abs(v);
  if (a >= 1000) return Math.round(v).toLocaleString();
  if (Number.isInteger(v)) return String(v);
  return String(+v.toPrecision(3));
};
const fmtV = (f, v) => {
  if (v == null) return '–';
  if (f.t === 'num') { if (f.k === 'decade') return v + 's'; if (f.fmt) return f.fmt(v); if (f.k === 'year' || f.k === 'id') return String(v); return fmtN(v); }
  return String(v);
};
const fieldOpts = (sel, filt, none, cur) => {
  let h = none ? '<option value="">' + esc(none) + '</option>' : '';
  GROUPS.forEach((g) => {
    const fs = F.filter((f) => f.g === g && filt(f));
    if (fs.length) h += '<optgroup label="' + g + '">' + fs.map((f) => '<option value="' + f.k + '">' + esc(lab(f)) + '</option>').join('') + '</optgroup>';
  });
  sel.innerHTML = h; sel.value = cur == null ? '' : cur;
  if (sel.value !== (cur == null ? '' : cur)) sel.selectedIndex = 0;
};
const toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); };
const median = (a) => { const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const quant = (s, q) => { const p = (s.length - 1) * q, b = Math.floor(p); return s[b] + (s[b + 1] !== undefined ? (p - b) * (s[b + 1] - s[b]) : 0); };
function regress(xs, ys) {
  const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  if (!sxx || !syy) return null;
  const slope = sxy / sxx, r = sxy / Math.sqrt(sxx * syy);
  return { slope, icpt: my - slope * mx, r, r2: r * r, n };
}
const strength = (r) => { const a = Math.abs(r); return (a < 0.3 ? 'weak' : a < 0.7 ? 'moderate' : 'strong') + (r < 0 ? ' negative' : ' positive'); };
const trendHTML = (rg, xl, yl, what) => rg
  ? '<div class="stat"><b>Trendline:</b> ' + esc(yl) + ' ≈ ' + fmtN(rg.slope) + ' × ' + esc(xl) + ' ' + (rg.icpt < 0 ? '− ' : '+ ') + fmtN(Math.abs(rg.icpt)) +
    '<br><b>r</b> = ' + rg.r.toFixed(2) + ' (' + strength(rg.r) + ' correlation) · <b>R²</b> = ' + rg.r2.toFixed(2) + ' (' + Math.round(rg.r2 * 100) + '% of the variation is explained by the line) · <b>n</b> = ' + rg.n + ' ' + what +
    '<br><span class="hint">Correlation is not causation: a trend can come from a third factor, from how the data was collected, or from chance.</span></div>'
  : '<div class="stat warn">Not enough varied data points to fit a trendline.</div>';

/* ---------- Filtering (all fields listed; expand to use) ---------- */
const FL = {};
const blankFilter = (f) => ({ key: f.k, sel: f.t === 'cat' ? new Set(f.vals.concat([NA])) : null, min: null, max: null, q: '' });
F.forEach((f) => (FL[f.k] = blankFilter(f)));
const isActive = (fl) => { const f = FB[fl.key]; return f.t === 'cat' ? fl.sel.size !== f.vals.length + 1 : f.t === 'num' ? fl.min != null || fl.max != null : !!fl.q; };
function passOne(fl, r) {
  const f = FB[fl.key], v = r[fl.key];
  if (f.t === 'cat') return fl.sel.has(v == null ? NA : v);
  if (f.t === 'num') { if (v == null) return false; return !(fl.min != null && v < fl.min) && !(fl.max != null && v > fl.max); }
  return v != null && String(v).toLowerCase().includes(fl.q.toLowerCase());
}
function applyFilters() {
  const act = F.map((f) => FL[f.k]).filter(isActive);
  RF = act.length ? D.filter((r) => act.every((fl) => passOne(fl, r))) : D.slice();
  const n = RF.length;
  $('countNum').textContent = n.toLocaleString();
  $('countOf').textContent = 'of ' + D.length.toLocaleString() + ' incidents';
  $('countSub').textContent = act.length ? act.length + ' filter' + (act.length > 1 ? 's' : '') + ' active · ' + Math.round((n / D.length) * 100) + '% of the database' : 'No filters applied';
  $('countBar').style.width = (n / D.length) * 100 + '%';
  $('clearFilters').hidden = !act.length;
  S.table.page = 0;
}
function ruleSummary(fl) {
  const f = FB[fl.key];
  if (!isActive(fl)) return '';
  if (f.t === 'cat') return fl.sel.size === 1 ? [...fl.sel][0] === NA ? 'not recorded' : [...fl.sel][0] : fl.sel.size + ' of ' + (f.vals.length + 1);
  if (f.t === 'num') return (fl.min ?? '…') + ' – ' + (fl.max ?? '…');
  return '“' + fl.q + '”';
}
const CHEV = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const openKeys = new Set();
function renderFilters() {
  const box = $('filters'); box.innerHTML = '';
  GROUPS.forEach((g) => {
    const h = document.createElement('div'); h.className = 'fgroup'; h.textContent = g; h.dataset.g = g; box.appendChild(h);
    F.filter((f) => f.g === g).forEach((f) => {
      const fl = FL[f.k], row = document.createElement('div'); row.className = 'frow'; row.dataset.k = f.k; row.dataset.g = g; row.dataset.name = f.l.toLowerCase();
      row.innerHTML = '<button class="fhead" aria-expanded="false"><span class="fl">' + esc(f.l) + '</span><span class="fbadge"></span>' + CHEV + '</button><div class="fbody" hidden></div>';
      const head = row.querySelector('.fhead'), badge = row.querySelector('.fbadge'), body = row.querySelector('.fbody');
      const mark = () => { badge.textContent = ruleSummary(fl); row.classList.toggle('active', isActive(fl)); };
      const upd = () => { mark(); applyFilters(); renderActive(); };
      const toggle = (on) => { row.classList.toggle('open', on); body.hidden = !on; head.setAttribute('aria-expanded', on); on ? openKeys.add(f.k) : openKeys.delete(f.k); };
      head.onclick = () => toggle(body.hidden);
      const reset = () => { Object.assign(fl, blankFilter(f)); renderFilters(); applyFilters(); renderActive(); };
      if (f.t === 'cat') {
        const vals = f.vals.concat([NA]);
        body.innerHTML = (vals.length > 10 ? '<input type="search" placeholder="Search values…" style="margin:4px 0">' : '') +
          '<div style="margin-top:4px"><button class="link" data-a="all">Select all</button> &nbsp;·&nbsp; <button class="link" data-a="none">Select none</button></div><div class="checks"></div>';
        const ch = body.querySelector('.checks');
        vals.forEach((v) => {
          const lb = document.createElement('label'), c = v === NA ? D.length - f.n : f.counts[v];
          lb.innerHTML = '<input type="checkbox"><span>' + esc(v === NA ? '(not recorded)' : v) + '</span><em>' + c + '</em>';
          const cb = lb.querySelector('input'); cb.checked = fl.sel.has(v);
          cb.onchange = () => { cb.checked ? fl.sel.add(v) : fl.sel.delete(v); upd(); };
          lb.dataset.v = (v === NA ? 'not recorded' : v).toLowerCase(); ch.appendChild(lb);
        });
        body.querySelectorAll('button.link').forEach((b) => (b.onclick = () => {
          const all = b.dataset.a === 'all'; fl.sel = new Set(all ? vals : []);
          ch.querySelectorAll('input').forEach((i) => (i.checked = all)); upd();
        }));
        const s = body.querySelector('input[type=search]');
        if (s) s.oninput = () => ch.querySelectorAll('label').forEach((l) => (l.style.display = l.dataset.v.includes(s.value.toLowerCase()) ? '' : 'none'));
      } else if (f.t === 'num') {
        body.innerHTML = '<div class="row2" style="margin-top:6px"><div><label class="f">From</label><input type="number" step="any" class="mn" placeholder="' + fmtN(f.min) + '"></div><div><label class="f">To</label><input type="number" step="any" class="mx" placeholder="' + fmtN(f.max) + '"></div></div>' +
          '<div class="hint">' + f.n + ' incidents have a value (' + fmtN(f.min) + ' to ' + fmtN(f.max) + '). ' + f.miss + ' have none and are removed while a limit is set. <button class="link" data-r="1">Reset</button></div>';
        const mn = body.querySelector('.mn'), mx = body.querySelector('.mx');
        mn.value = fl.min ?? ''; mx.value = fl.max ?? '';
        mn.oninput = () => { fl.min = mn.value === '' ? null : +mn.value; upd(); };
        mx.oninput = () => { fl.max = mx.value === '' ? null : +mx.value; upd(); };
        body.querySelector('[data-r]').onclick = reset;
      } else {
        body.innerHTML = '<input type="search" placeholder="Contains…" style="margin-top:6px">';
        const q = body.querySelector('input'); q.value = fl.q; q.oninput = () => { fl.q = q.value; upd(); };
      }
      mark(); if (isActive(fl) || openKeys.has(f.k)) toggle(true);
      box.appendChild(row);
    });
  });
  filterList();
}
function filterList() {
  const q = $('fsearch').value.trim().toLowerCase(), vis = {};
  document.querySelectorAll('#filters .frow').forEach((r) => { const ok = !q || r.dataset.name.includes(q); r.style.display = ok ? '' : 'none'; if (ok) vis[r.dataset.g] = 1; });
  document.querySelectorAll('#filters .fgroup').forEach((g) => (g.style.display = vis[g.dataset.g] ? '' : 'none'));
}
function resetFilters() { F.forEach((f) => (FL[f.k] = blankFilter(f))); }
function setFilter(key, preset) { Object.assign(FL[key], preset); }

/* ---------- Binning / grouping ---------- */
function niceW(range, k) {
  const raw = range / k, e = Math.pow(10, Math.floor(Math.log10(raw)));
  return [1, 2, 2.5, 5, 10].map((m) => m * e).reduce((a, b) => (Math.abs(Math.log(b / raw)) < Math.abs(Math.log(a / raw)) ? b : a));
}
function binWidth(f, vals, user) {
  if (user > 0) return user;
  if (f.bin) return f.bin;
  if (!vals.length) return 1;
  let mn = Infinity, mx = -Infinity; vals.forEach((v) => { if (v < mn) mn = v; if (v > mx) mx = v; });
  const range = mx - mn;
  if (f.int && range <= 40) return 1;
  const k = Math.max(5, Math.min(20, Math.ceil(Math.log2(vals.length) + 1)));
  let w = niceW(range || 1, k);
  if (f.int) w = Math.max(1, Math.round(w));
  return w;
}
function binLabel(f, a, w) {
  const r = (v) => +v.toFixed(2);
  if (f.k === 'decade' && w === 10) return a + 's';
  if (f.fmt && w === 1) return f.fmt(a);
  if (w === 1 && f.int) return String(a);
  if (f.int && Number.isInteger(w)) return r(a) + '–' + r(a + w - 1);
  return r(a) + '–' + r(a + w);
}
function groupsFor(f, recs, userBin) {
  const have = recs.filter((r) => r[f.k] != null), missing = recs.length - have.length;
  if (f.t === 'cat') {
    const m = new Map(); have.forEach((r) => { const v = r[f.k]; if (!m.has(v)) m.set(v, []); m.get(v).push(r); });
    const groups = [...m].map(([k, rs]) => ({ key: k, label: k, recs: rs }));
    if (f.order) groups.sort((a, b) => f.order.indexOf(a.key) - f.order.indexOf(b.key)); else groups.sort((a, b) => b.recs.length - a.recs.length);
    return { groups, missing, numeric: false };
  }
  if (!have.length) return { groups: [], missing, numeric: true, w: 1 };
  const vals = have.map((r) => r[f.k]); let mn = Infinity, mx = -Infinity; vals.forEach((v) => { if (v < mn) mn = v; if (v > mx) mx = v; });
  let w = binWidth(f, vals, userBin); let start = Math.floor(mn / w + 1e-9) * w, nb = Math.floor((mx - start) / w + 1e-9) + 1;
  while (nb > 300) { w *= 2; start = Math.floor(mn / w + 1e-9) * w; nb = Math.floor((mx - start) / w + 1e-9) + 1; }
  const groups = [];
  for (let i = 0; i < nb; i++) { const a = +(start + i * w).toFixed(6); groups.push({ key: a, label: binLabel(f, a, w), x: f.int && w >= 1 ? a + (w - 1) / 2 : a + w / 2, recs: [] }); }
  have.forEach((r) => { const i = Math.min(nb - 1, Math.floor((r[f.k] - start) / w + 1e-9)); groups[i].recs.push(r); });
  return { groups, missing, numeric: true, w };
}
const MEAS = { count: 'Number of incidents', pct: '% of incidents', avg: 'Average', med: 'Median', sum: 'Total', min: 'Minimum', max: 'Maximum', fatal: 'Fatality rate (%)' };
const needsVf = (m) => ['avg', 'med', 'sum', 'min', 'max'].includes(m);
function measure(m, recs, vf, total) {
  if (m === 'count') return recs.length;
  if (m === 'pct') return total ? (recs.length / total) * 100 : 0;
  if (m === 'fatal') {
    const k = recs.filter((r) => r.outcome === 'Fatal' || r.outcome === 'Injured' || r.outcome === 'Uninjured');
    return k.length ? (k.filter((r) => r.outcome === 'Fatal').length / k.length) * 100 : null;
  }
  const v = recs.map((r) => r[vf]).filter((x) => x != null);
  if (m === 'sum') return v.reduce((a, b) => a + b, 0);
  if (!v.length) return null;
  if (m === 'avg') return v.reduce((a, b) => a + b, 0) / v.length;
  if (m === 'med') return median(v);
  if (m === 'min') return Math.min(...v);
  return Math.max(...v);
}
const measLabel = (m, vf) => (needsVf(m) ? MEAS[m] + ' ' + lab(FB[vf]).toLowerCase() : m === 'fatal' ? 'Fatality rate (% of known outcomes)' : MEAS[m]);

/* split series */
function makeSeries(sf, recs) {
  const OTH = 'Other', NR = 'Not recorded';
  const key = (r) => { const v = r[sf.k]; if (v == null) return NR; return sf.slot[v] === undefined ? OTH : v; };
  const seen = new Set(recs.map(key)); const pal = palette();
  const names = [...seen].sort((a, b) => {
    const rank = (n) => (n === NR ? 1002 : n === OTH ? 1001 : sf.slot[n]);
    return rank(a) - rank(b);
  });
  return names.map((n) => ({ name: n, test: (r) => key(r) === n, color: ov(n, n === NR ? nrCol() : n === OTH ? otherCol() : pal[sf.slot[n]]), slot: sf.slot[n] ?? 0 }));
}

/* ---------- Charts ---------- */
const valueLabels = {
  id: 'valueLabels',
  afterDatasetsDraw(ch, _a, o) {
    if (!o || !o.on) return;
    const ctx = ch.ctx; ctx.save(); ctx.fillStyle = o.color; ctx.font = '11px system-ui,sans-serif';
    ch.data.datasets.forEach((ds, i) => {
      if (ds.isTrend) return;
      ch.getDatasetMeta(i).data.forEach((el, j) => {
        const v = ds.data[j]; if (v == null) return; const t = o.fmt(v);
        if (ch.options.indexAxis === 'y') { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, el.x + 5, el.y); }
        else { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(t, el.x, el.y - 4); }
      });
    });
    ctx.restore();
  },
};
const bgPlugin = { id: 'bg', beforeDraw(ch) { const c = ch.ctx; c.save(); c.globalCompositeOperation = 'destination-over'; c.fillStyle = css('--card'); c.fillRect(0, 0, ch.width, ch.height); c.restore(); } };

const AUS = [[142.5, -10.7], [143.5, -14], [145.3, -15], [146, -17.5], [148.5, -20.3], [150.5, -22.5], [153.2, -25.5], [153.5, -28.5], [153, -31], [151.3, -33.8], [150, -37], [148, -37.8], [146.3, -39], [144, -38.3], [141.5, -38.3], [139.5, -36], [138.5, -35.5], [137.8, -33], [137.2, -34.9], [136, -34.8], [134.2, -32.7], [131, -31.5], [128, -32], [124, -33.5], [121.5, -33.8], [118, -35], [115.2, -34.3], [115, -33], [115.7, -31.8], [114.9, -29.5], [113.5, -26], [114, -22], [116, -20.7], [120, -19.5], [122.3, -17.5], [123.5, -16.2], [125.5, -14.2], [127, -13.5], [129.5, -14.8], [130.2, -12.5], [132.5, -11.5], [135.5, -12], [136.8, -12.2], [135.8, -15], [137.5, -16], [140, -17.6], [141.5, -15], [141.8, -12.5], [142.5, -10.7], [null, null],
  [144.7, -40.7], [148.3, -40.9], [148, -43], [146.5, -43.6], [145.2, -42.2], [144.7, -40.7]];

let lastModel = null; // {head:[], rows:[[]]} for graph-data table
function jitter(id, amt) { const x = Math.sin(id * 12.9898) * 43758.5453; return ((x - Math.floor(x)) - 0.5) * amt; }

function buildChart() {
  const c = S.chart, type = c.type, ink = css('--ink'), muted = css('--muted'), grid = css('--grid'), surface = css('--card');
  const pal = palette();
  const opts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 220 },
    layout: { padding: { top: 18, right: 22 } },
    plugins: { legend: { labels: { color: ink, usePointStyle: true, boxWidth: 8, padding: 14 } }, tooltip: {}, valueLabels: { on: false } },
    scales: {},
  };
  const axis = (title, o) => Object.assign({ title: { display: true, text: title, color: muted, font: { weight: '600' } }, ticks: { color: muted }, grid: { color: grid }, border: { color: grid } }, o || {});
  let cfg, notes = [], stats = '', title = '';
  lastModel = null;
  const xf = FB[c.x], total = RF.length;

  if (type === 'map' || type === 'scatter') {
    const isMap = type === 'map';
    const fx = isMap ? FB.lon : FB[c.x], fy = isMap ? FB.lat : FB[c.y];
    if (fx.t !== 'num' || fy.t !== 'num') return { cfg: null, msg: 'Scatter plots need two numeric fields.' };
    const recs = RF.filter((r) => r[fx.k] != null && r[fy.k] != null);
    const miss = RF.length - recs.length;
    if (miss) notes.push(miss + ' of ' + RF.length + ' filtered incidents have no value for ' + fx.l + ' and/or ' + fy.l + ' and are not shown.');
    const sf = c.split ? FB[c.split] : null;
    const series = sf ? makeSeries(sf, recs) : [{ name: isMap ? 'Incident' : fy.l + ' vs ' + fx.l, test: () => true, color: ov(isMap ? 'Incident' : fy.l + ' vs ' + fx.l, pal[0]), slot: 0 }];
    S._cols = series.map((x) => ({ name: x.name, color: x.color }));
    const amtX = fx.int ? 0.7 : 0, amtY = fy.int ? 0.7 : 0; const jit = !isMap && c.jitter;
    const ds = series.map((s, i) => ({
      label: s.name, data: recs.filter(s.test).map((r) => ({ x: r[fx.k] + (jit ? jitter(r.id, amtX) : 0), y: r[fy.k] + (jit ? jitter(r.id + 7, amtY) : 0), r })),
      backgroundColor: s.color + 'b3', borderColor: surface, borderWidth: 1, pointRadius: isMap ? 3.5 : 4.5, pointHoverRadius: 7,
      pointStyle: sf ? SHAPES[s.slot % 8] : 'circle',
    }));
    if (series.length > 3) notes.push('With more than 3 colour groups, points are also given different shapes to help tell them apart.');
    if (isMap) {
      ds.unshift({ label: 'Australia (rough outline)', data: AUS.map((p) => ({ x: p[0], y: p[1] })), showLine: true, borderColor: muted, borderWidth: 1.2, pointRadius: 0, backgroundColor: 'transparent', isOutline: true, spanGaps: false, order: 10 });
      opts.scales.x = axis('Longitude (°E)', { min: 112, max: 155 }); opts.scales.y = axis('Latitude (°N)', { min: -45, max: -9 });
      title = 'Where shark incidents have happened';
    } else {
      opts.scales.x = axis(lab(fx), { type: 'linear' }); opts.scales.y = axis(lab(fy), { type: 'linear' });
      title = lab(fy) + ' vs ' + lab(fx);
      if (c.trend) {
        const rg = regress(recs.map((r) => r[fx.k]), recs.map((r) => r[fy.k]));
        if (rg) { const xs = recs.map((r) => r[fx.k]), a = Math.min(...xs), b = Math.max(...xs); ds.push({ label: 'Line of best fit', data: [{ x: a, y: rg.icpt + rg.slope * a }, { x: b, y: rg.icpt + rg.slope * b }], type: 'line', borderColor: ink, borderDash: [7, 5], borderWidth: 2.2, pointRadius: 0, backgroundColor: 'transparent', isTrend: true, order: -1 }); }
        stats = trendHTML(rg, fx.l, fy.l, 'incidents');
      }
    }
    opts.plugins.tooltip.callbacks = {
      title: (items) => { const p = items[0].raw; return p && p.r ? (p.r.location || 'Unknown location') + ' (' + p.r.year + ')' : items[0].dataset.label; },
      label: (it) => { const p = it.raw; if (!p || !p.r) return it.dataset.label; const l = [fx.l + ': ' + fmtV(fx, p.r[fx.k]), fy.l + ': ' + fmtV(fy, p.r[fy.k])]; if (sf) l.push(sf.l + ': ' + (p.r[sf.k] ?? 'not recorded')); return l; },
    };
    opts.plugins.legend.labels.filter = (item) => item.text !== 'Australia (rough outline)';
    cfg = { type: 'scatter', data: { datasets: ds }, options: opts };
    if (series.length === 1 && !c.trend) opts.plugins.legend.display = false;
    lastModel = null;
    S._pts = { x: fx.k, y: fy.k };
    return { cfg, notes, stats, title: c.title || title, wrapRatio: isMap ? 0.82 : null, n: recs.length };
  }

  /* group-based charts: column, line, hist, pie */
  const ft = type === 'hist' ? FB[c.x] : xf;
  if (type === 'hist' && ft.t !== 'num') return { cfg: null, msg: 'Histograms need a numeric X field.' };
  const rec0 = RF.filter((r) => r[ft.k] != null);
  const sf = c.split && type !== 'pie' ? FB[c.split] : null;
  const gr = groupsFor(ft, RF, +c.bin);
  let groups = gr.groups;
  if (gr.missing) notes.push(gr.missing + ' of ' + RF.length + ' filtered incidents have no ' + ft.l.toLowerCase() + ' recorded and are not shown.');
  if (!groups.length) return { cfg: null, msg: 'No data to graph with the current filters.' };
  let meas = c.measure;
  if (type === 'hist' && !['count', 'pct'].includes(meas)) meas = 'count';
  if (type === 'pie' && !['count', 'sum'].includes(meas)) meas = 'count';
  const catNat = ft.t === 'cat' && ft.order;
  if (ft.t === 'cat' && type !== 'line') {
    const top = Math.max(2, +c.top || 10);
    if (!catNat && groups.length > top) {
      const keep = groups.slice(0, top - 1), rest = groups.slice(top - 1);
      keep.push({ key: 'Other', label: 'Other (' + rest.length + ' groups)', recs: rest.flatMap((g) => g.recs), isOther: true }); groups = keep;
    }
    if (type === 'column' && c.sort !== 'natural' && !catNat) {
      const val = (g) => { const v = measure(meas, g.recs, c.vf, rec0.length); return v == null ? -Infinity : v; };
      const main = groups.filter((g) => !g.isOther), oth = groups.filter((g) => g.isOther);
      if (c.sort === 'desc') main.sort((a, b) => val(b) - val(a)); else if (c.sort === 'asc') main.sort((a, b) => val(a) - val(b)); else main.sort((a, b) => String(a.label).localeCompare(b.label));
      groups = main.concat(oth);
    }
  }
  const labels = groups.map((g) => g.label);
  const mlab = measLabel(meas, c.vf);
  const unitSuffix = needsVf(meas) && FB[c.vf].unit ? '' : '';
  const series = sf ? makeSeries(sf, rec0) : [{ name: mlab, test: () => true, color: ov(mlab, pal[0]), slot: 0 }];
  S._cols = series.map((x) => ({ name: x.name, color: x.color }));
  const valueFmt = (v) => (meas === 'pct' || meas === 'fatal' ? fmtN(v) + '%' : fmtN(v));
  const model = { head: [ft.l].concat(series.map((s) => s.name)), rows: [] };

  if (type === 'pie') {
    const vals = groups.map((g) => measure(meas, g.recs, c.vf, rec0.length));
    const tot = vals.reduce((a, b) => a + (b || 0), 0);
    const slotOf = (g, i) => (g.isOther ? -1 : ft.t === 'cat' && ft.slot[g.key] !== undefined ? ft.slot[g.key] : i % 8);
    const cols = groups.map((g, i) => ov(g.label, slotOf(g, i) < 0 || slotOf(g, i) > 7 ? otherCol() : pal[slotOf(g, i)]));
    S._cols = groups.map((g, i) => ({ name: g.label, color: cols[i] }));
    const pl = groups.map((g, i) => g.label + ' · ' + fmtN(vals[i]) + ' (' + Math.round((vals[i] / tot) * 100) + '%)');
    opts.scales = {}; opts.layout.padding = 8;
    opts.plugins.legend.position = 'right'; opts.plugins.legend.labels.generateLabels = undefined;
    opts.plugins.tooltip.callbacks = { label: (it) => ' ' + groups[it.dataIndex].label + ': ' + fmtN(it.raw) + ' (' + ((it.raw / tot) * 100).toFixed(1) + '%)' };
    model.head = [ft.l, mlab, '% of total']; groups.forEach((g, i) => model.rows.push([g.label, fmtN(vals[i]), ((vals[i] / tot) * 100).toFixed(1) + '%']));
    lastModel = model;
    cfg = { type: 'pie', data: { labels: pl, datasets: [{ data: vals, backgroundColor: cols, borderColor: surface, borderWidth: 2 }] }, options: opts };
    opts.plugins.legend.labels.usePointStyle = false;
    S._pts = { x: ft.k };
    return { cfg, notes, stats: '', title: c.title || mlab + ' by ' + ft.l, n: rec0.length, pie: true };
  }

  const datasets = series.map((s) => {
    const data = groups.map((g) => { const rs = sf ? g.recs.filter(s.test) : g.recs; const v = measure(meas, rs, c.vf, rec0.length); return v == null ? null : +v.toFixed(3); });
    return { label: s.name, data, backgroundColor: s.color, borderColor: s.color };
  });
  groups.forEach((g, i) => model.rows.push([g.label].concat(datasets.map((d) => (d.data[i] == null ? '–' : valueFmt(d.data[i]))))));
  lastModel = model;
  const horiz = type === 'column' && c.horiz;
  const cat = horiz ? 'y' : 'x', val = horiz ? 'x' : 'y';
  const stacked = datasets.length > 1 && c.stack && ['count', 'pct', 'sum'].includes(meas) && type !== 'line';
  const xTitle = lab(ft) + (gr.numeric && gr.w !== 1 ? ' (groups of ' + fmtN(gr.w) + ')' : '');
  const yTitle = mlab;
  opts.scales[cat] = axis(xTitle, { stacked, grid: { display: false }, ticks: { color: muted, maxRotation: 60, autoSkip: true } });
  opts.scales[val] = axis(yTitle, { stacked, beginAtZero: true });
  opts.indexAxis = horiz ? 'y' : 'x';
  opts.interaction = { mode: horiz ? 'nearest' : 'index', intersect: false, axis: horiz ? 'y' : 'x' };
  opts.plugins.tooltip.callbacks = { label: (it) => ' ' + it.dataset.label + ': ' + (it.raw == null ? 'no data' : valueFmt(it.raw)) };
  if (datasets.length === 1) opts.plugins.legend.display = false;
  if (c.vals && datasets.length === 1 && groups.length <= 30) { opts.plugins.valueLabels = { on: true, color: ink, fmt: valueFmt }; if (horiz) opts.layout.padding = { top: 8, right: 40 }; }
  datasets.forEach((d) => {
    if (type === 'line') { Object.assign(d, { type: 'line', borderWidth: 2.5, pointRadius: groups.length > 60 ? 0 : 3.5, pointBackgroundColor: d.backgroundColor, pointBorderColor: surface, pointBorderWidth: 1.5, tension: 0, backgroundColor: d.backgroundColor, spanGaps: false }); }
    else { Object.assign(d, { borderWidth: stacked ? 1.5 : 0, borderColor: surface, borderRadius: stacked ? 0 : 4, borderSkipped: false, maxBarThickness: 64 }); if (type === 'hist') { d.barPercentage = 1; d.categoryPercentage = 1; d.borderWidth = 1.5; d.borderRadius = 0; } }
  });
  if (c.trend && gr.numeric && !horiz) {
    const pts = groups.map((g, i) => ({ g, i, y: measure(meas, g.recs, c.vf, rec0.length) })).filter((p) => p.y != null);
    const rg = regress(pts.map((p) => p.g.x), pts.map((p) => p.y));
    if (rg) datasets.push({ label: 'Trendline (line of best fit)', type: 'line', data: groups.map((g) => rg.icpt + rg.slope * g.x), borderColor: ink, borderDash: [7, 5], borderWidth: 2.2, pointRadius: 0, backgroundColor: 'transparent', isTrend: true, stack: 'trend', order: -1 });
    stats = trendHTML(rg, ft.l, yTitle.toLowerCase(), 'groups (each point is one ' + (gr.w === 1 ? 'value' : 'group of ' + fmtN(gr.w)) + ' of ' + ft.l.toLowerCase() + ')');
    if (rg && datasets.length > 2) opts.plugins.legend.display = true;
    else if (rg) opts.plugins.legend.display = true;
  }
  if (ft.t === 'cat' && type !== 'line' && c.sort === 'desc' && !catNat) notes.push('Groups are sorted by the measure being graphed.');
  const ttl = type === 'hist' ? 'Distribution of ' + ft.l.toLowerCase() : type === 'line' ? mlab + ' over ' + ft.l.toLowerCase() : mlab + ' by ' + ft.l.toLowerCase();
  S._pts = { x: ft.k };
  cfg = { type: type === 'line' ? 'line' : 'bar', data: { labels, datasets }, options: opts };
  return { cfg, notes, stats, title: c.title || ttl + (sf ? ', split by ' + sf.l.toLowerCase() : ''), n: rec0.length };
}

function renderChart(skipColors) {
  const c = S.chart;
  const res = buildChart();
  if (chart) { chart.destroy(); chart = null; }
  const wrap = $('chartWrap');
  if (!res.cfg) { $('chartStats').innerHTML = '<div class="stat warn">' + esc(res.msg) + '</div>'; $('chartNote').textContent = ''; $('chartTable').innerHTML = ''; return; }
  const w = wrap.clientWidth || 800;
  wrap.style.height = res.wrapRatio ? Math.round(Math.min(Math.max(w * res.wrapRatio, 380), 720)) + 'px' : '';
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = css('--muted');
  res.cfg.options.plugins.title = { display: true, text: res.title, color: css('--ink'), font: { size: 15, weight: '650' }, padding: { bottom: 8 } };
  res.cfg.plugins = [valueLabels, bgPlugin];
  if (S.pred && S.pred.revealed && S.pred.spec.kind === 'sketch' && S.pred.sig === sigOf() && !res.pie && res.cfg.data.labels) addSketchOverlay(res.cfg);
  if (!skipColors) renderColorBox();
  chart = new Chart($('chart'), res.cfg);
  $('chart').ondblclick = (e) => { if (!chart) return; const el = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true)[0]; if (!el) return; const p = chart.data.datasets[el.datasetIndex].data[el.index]; if (p && p.r) openRecord(p.r.id, [...new Set(chart.data.datasets.flatMap((d) => (d.data || []).map((q) => q && q.r && q.r.id).filter(Boolean)))]); };
  if (S.pred && S.pred.revealed && S.pred.spec.kind === 'sketch' && !$('predResult').hidden && S.pred.sig === sigOf()) renderPredResult();
  $('chart').setAttribute('aria-label', res.title);
  $('chartStats').innerHTML = res.stats || '';
  $('chartNote').textContent = 'Graphing ' + res.n.toLocaleString() + ' of ' + RF.length.toLocaleString() + ' filtered incidents (' + D.length.toLocaleString() + ' in the full database). ' + res.notes.join(' ');
  if (lastModel) {
    $('chartTable').innerHTML = '<table class="t"><thead><tr>' + lastModel.head.map((h, i) => '<th class="nosort' + (i ? ' n' : '') + '">' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
      lastModel.rows.map((r) => '<tr>' + r.map((v, i) => '<td class="' + (i ? 'n' : '') + '">' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  } else $('chartTable').innerHTML = '<p class="note" style="padding:8px">For scatter plots and maps, use “See these records in the table”.</p>';
}

/* ---------- Chart controls ---------- */
const TYPES = [['column', '📊 Column / bar'], ['line', '📈 Line'], ['pie', '🥧 Pie'], ['hist', '▮▮ Histogram'], ['scatter', '⚬ Scatter'], ['map', '🗺 Map']];
function setupChartControls() {
  const tb = $('typeBar');
  TYPES.forEach(([k, l]) => { const b = document.createElement('button'); b.textContent = l; b.dataset.t = k; b.onclick = () => { S.chart.type = k; syncControls(); renderChart(); }; tb.appendChild(b); });
  const map = { 'c-x': 'x', 'c-y': 'y', 'c-measure': 'measure', 'c-vf': 'vf', 'c-split': 'split', 'c-bin': 'bin', 'c-sort': 'sort', 'c-top': 'top', 'c-title': 'title' };
  Object.keys(map).forEach((id) => { $(id).addEventListener(id === 'c-title' || id === 'c-bin' || id === 'c-top' ? 'input' : 'change', () => { S.chart[map[id]] = $(id).value; if (id === 'c-x' || id === 'c-measure') syncControls(); renderChart(); }); });
  const cks = { 'c-trend': 'trend', 'c-stack': 'stack', 'c-horiz': 'horiz', 'c-jitter': 'jitter', 'c-vals': 'vals' };
  Object.keys(cks).forEach((id) => $(id).addEventListener('change', () => { S.chart[cks[id]] = $(id).checked; renderChart(); }));
  $('dlPng').onclick = () => { if (!chart) return; const a = document.createElement('a'); a.href = chart.toBase64Image('image/png', 1); a.download = 'shark-graph.png'; a.click(); };
  $('toTable').onclick = () => {
    const keys = [S._pts && S._pts.x, S._pts && S._pts.y, S.chart.split].filter(Boolean);
    const cols = ['id', 'year', 'state', 'location'].concat(keys); S.table.cols = [...new Set(cols)];
    if (S._pts && S._pts.y) S.table.sort = [{ key: S._pts.x, dir: 1 }];
    setTab('table');
  };
  $('notes').addEventListener('input', () => { try { localStorage.setItem('shark_notes', $('notes').value); } catch (e) { } });
  try { $('notes').value = localStorage.getItem('shark_notes') || ''; } catch (e) { }
}
function syncControls() {
  const c = S.chart, t = c.type, show = (id, on) => ($(id).hidden = !on);
  document.querySelectorAll('#typeBar button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === t));
  const numOnly = t === 'hist' || t === 'scatter';
  fieldOpts($('c-x'), (f) => f.t !== 'text' && (!numOnly || f.t === 'num'), null, c.x);
  if (numOnly && FB[c.x].t !== 'num') c.x = t === 'hist' ? 'age' : 'age'; $('c-x').value = c.x;
  fieldOpts($('c-y'), (f) => f.t === 'num', null, c.y); if (FB[c.y].t !== 'num') c.y = 'length';
  fieldOpts($('c-vf'), (f) => f.t === 'num', null, c.vf);
  fieldOpts($('c-split'), (f) => f.t === 'cat', 'None', c.split);
  const ms = t === 'hist' ? ['count', 'pct'] : t === 'pie' ? ['count', 'sum'] : Object.keys(MEAS);
  if (!ms.includes(c.measure)) c.measure = ms[0];
  $('c-measure').innerHTML = ms.map((m) => '<option value="' + m + '">' + MEAS[m] + (needsVf(m) ? ' of…' : '') + '</option>').join(''); $('c-measure').value = c.measure;
  $('l-x').textContent = { column: 'Group by (X axis)', line: 'X axis (time or order)', pie: 'Slices (compare by)', hist: 'Field to bin (X axis)', scatter: 'X axis' }[t] || 'X axis';
  show('r-x', t !== 'map'); show('r-y', t === 'scatter'); show('r-measure', numOnly ? t === 'hist' : t !== 'map');
  show('r-vf', t !== 'map' && t !== 'scatter' && t !== 'hist' && needsVf(c.measure));
  show('r-split', t !== 'pie'); show('r-title', true);
  const xnum = t !== 'map' && t !== 'scatter' && FB[c.x].t === 'num';
  show('r-bin', xnum && t !== 'scatter'); show('r-sort', t === 'column' && !xnum && !FB[c.x].order); show('r-top', (t === 'column' || t === 'pie') && !xnum && !FB[c.x].order);
  show('r-trend', t !== 'pie' && t !== 'map'); show('r-stack', (t === 'column' || t === 'hist') && !!c.split); show('r-horiz', t === 'column' && !xnum); show('r-jitter', t === 'scatter');
  show('r-vals', t === 'column' || t === 'line' || t === 'hist');
  const trendOk = t === 'scatter' || ((t === 'column' || t === 'line' || t === 'hist') && xnum && !(t === 'column' && c.horiz));
  $('c-trend').disabled = !trendOk; $('r-trend').style.opacity = trendOk ? 1 : 0.5;
  $('l-trend').textContent = trendOk ? 'Add trendline (line of best fit)' : 'Trendline (needs a numeric X axis, e.g. year or age)';
  if (!trendOk) c.trend = false;
  $('c-bin').value = c.bin; $('c-top').value = c.top; $('c-sort').value = c.sort; $('c-title').value = c.title;
  ['trend', 'stack', 'horiz', 'jitter', 'vals'].forEach((k) => ($('c-' + k).checked = !!c[k]));
  if (t === 'map' && !c.split) { c.split = 'outcome'; $('c-split').value = 'outcome'; }
}
/* ---------- Colours ---------- */
const SCHEMES = {
  ocean: { n: 'Ocean', c: ['#0b6e99', '#2bb3c0', '#7fd1b9', '#f2c14e', '#f78154', '#4d5061', '#5fa8d3', '#b8c0ff'] },
  sunset: { n: 'Sunset', c: ['#d1495b', '#edae49', '#00798c', '#30638e', '#66a182', '#8d6a9f', '#e07a5f', '#3d405b'] },
  cvd: { n: 'Colour-blind safe', c: ['#0072b2', '#e69f00', '#009e73', '#d55e00', '#cc79a7', '#56b4e9', '#f0e442', '#999999'] },
  pastel: { n: 'Pastel', c: ['#6baed6', '#ffb347', '#8fd694', '#ff9aa2', '#b8a1d9', '#7fd1d6', '#e8d36a', '#b0b7c3'] },
  mono: { n: 'Blues', c: ['#08306b', '#2171b5', '#6baed6', '#c6dbef', '#4292c6', '#9ecae1', '#084594', '#deebf7'] },
  bold: { n: 'Bold', c: ['#e63946', '#1d3557', '#2a9d8f', '#f4a261', '#7b2cbf', '#118ab2', '#ffb703', '#06d6a0'] },
};
function renderColorBox() {
  const cur = S.colors.scheme;
  let h = '<div class="schemes" style="margin-top:12px">' + ['default'].concat(Object.keys(SCHEMES)).map((k) => {
    const cols = k === 'default' ? (isDark() ? PAL.dark : PAL.light) : SCHEMES[k].c;
    return '<button class="scheme" data-s="' + k + '" aria-pressed="' + (k === cur) + '">' + (k === 'default' ? 'Default' : SCHEMES[k].n) + '<i>' + cols.slice(0, 6).map((c) => '<b style="background:' + c + '"></b>').join('') + '</i></button>';
  }).join('') + '</div>';
  h += '<div class="swatches">' + (S._cols || []).map((s) => '<label class="sw" title="Pick a colour"><input type="color" data-n="' + esc(s.name) + '" value="' + s.color + '"><span>' + esc(s.name) + '</span></label>').join('') + '</div>' +
    '<p class="hint">Choose a colour set, or click a swatch to pick your own colour for one series. <button class="link" id="resetColors">Reset colours</button></p>';
  $('colorInner').innerHTML = h;
  $('colorInner').querySelectorAll('.scheme').forEach((b) => (b.onclick = () => { S.colors.scheme = b.dataset.s; S.colors.over = {}; renderChart(); }));
  $('colorInner').querySelectorAll('input[type=color]').forEach((i) => (i.oninput = () => { S.colors.over[i.dataset.n] = i.value; renderChart(true); }));
  $('resetColors').onclick = () => { S.colors = { scheme: 'default', over: {} }; renderChart(); };
}

/* ---------- Predictions + investigation ideas ---------- */
const corr = (a, b) => { const p = D.filter((r) => r[a] != null && r[b] != null); const g = regress(p.map((r) => r[a]), p.map((r) => r[b])); return g ? g.r : 0; };
const itemVal = (sp, it) => measure(sp.m, D.filter((r) => r[sp.field] === it), sp.vf, D.length);
const ACT6 = ['Swimming', 'Board sports', 'Spearfishing', 'Snorkelling', 'Diving', 'Fishing'];
const PRESETS = [
  { t: 'Which sharks are involved most?', q: 'Rank six species', c: { type: 'pie', x: 'species', measure: 'count', top: 7 },
    pred: { kind: 'rank', field: 'species', m: 'count', items: ['White shark', 'Tiger shark', 'Bull shark', 'Wobbegong', 'Whaler shark', 'Bronze whaler shark'], hi: 'Most incidents', lo: 'Fewest incidents', ask: 'Rank these sharks from the MOST to the FEWEST recorded incidents. Drag the cards, or use the arrows.' } },
  { t: 'Are incidents becoming more common?', q: 'Sketch the trend', c: { type: 'line', x: 'decade', measure: 'count', trend: true },
    pred: { kind: 'sketch', pts: 9, xlab: 'Earliest records → most recent', ylab: 'Few → many incidents', ask: 'Sketch how the number of incidents per decade has changed since records began. Click and drag across the graph to draw your line.' } },
  { t: 'Which activity leads to most incidents?', q: 'Rank six activities', c: { type: 'column', x: 'activity', measure: 'count', sort: 'desc', horiz: true },
    pred: { kind: 'rank', field: 'activity', m: 'count', items: ACT6, hi: 'Most incidents', lo: 'Fewest incidents', ask: 'Rank these activities from the MOST to the FEWEST recorded shark incidents.' } },
  { t: 'Which activity is most often fatal?', q: 'Rank by fatality rate', c: { type: 'column', x: 'activity', measure: 'fatal', sort: 'desc', horiz: true },
    pred: { kind: 'rank', field: 'activity', m: 'fatal', items: ACT6, hi: 'Highest % fatal', lo: 'Lowest % fatal', ask: 'Rank these activities by how often an incident ends in a death (the percentage of incidents that were fatal, not the number).' } },
  { t: 'Which months are busiest?', q: 'Sketch the year', c: { type: 'column', x: 'month', measure: 'count', split: 'state', stack: true },
    pred: { kind: 'sketch', pts: 12, xlab: 'Start of year → end of year', ylab: 'Few → many incidents', ask: 'Sketch how the number of incidents changes across the 12 months of the year (all states together). Click and drag to draw.' } },
  { t: 'Do bigger sharks cause worse outcomes?', q: 'Rank by average shark size', c: { type: 'column', x: 'outcome', measure: 'avg', vf: 'length', sort: 'natural' },
    pred: { kind: 'rank', field: 'outcome', m: 'avg', vf: 'length', items: ['Fatal', 'Injured', 'Uninjured'], hi: 'Biggest sharks', lo: 'Smallest sharks', ask: 'Rank the three outcomes by the AVERAGE size of the shark involved.' } },
  { t: 'Does victim age relate to shark length?', q: 'Predict the correlation', c: { type: 'scatter', x: 'age', y: 'length', trend: true },
    pred: { kind: 'sliders', ask: 'Is the age of the victim related to the length of the shark? Set the correlation you expect between the two.', sliders: [{ label: 'Correlation (r) between victim age and shark length', min: -1, max: 1, step: 0.05, start: 0, dec: 2, lo: '−1 · bigger sharks bite younger people', mid: '0 · no relationship', hi: '+1 · bigger sharks bite older people', actual: () => corr('age', 'length') }] } },
  { t: 'How far from shore do incidents happen?', q: 'Sketch the shape', c: { type: 'hist', x: 'dist_shore', measure: 'count', bin: 50 },
    pred: { kind: 'sketch', pts: 8, xlab: 'Close to shore → far from shore', ylab: 'Few → many incidents', ask: 'Sketch the shape of the distribution: how many incidents happen at each distance from shore? Click and drag to draw.' } },
  { t: 'What time of day do incidents happen?', q: 'Sketch the day', c: { type: 'column', x: 'hour', measure: 'count' },
    pred: { kind: 'sketch', pts: 12, xlab: 'Midnight → following midnight', ylab: 'Few → many incidents', ask: 'Sketch how the number of incidents changes over the 24 hours of the day. Click and drag to draw.' } },
  { t: 'Victim age, by gender', q: 'Predict the split', c: { type: 'hist', x: 'age', measure: 'count', bin: 5, split: 'gender', stack: false },
    pred: { kind: 'sliders', ask: 'Of the victims whose age and gender were recorded, what percentage were male?', sliders: [{ label: 'Percentage of victims who were male', min: 0, max: 100, step: 1, start: 50, unit: '%', dec: 0, lo: '0% (all female)', hi: '100% (all male)', actual: () => { const p = D.filter((r) => r.age != null && r.gender); return (p.filter((r) => r.gender === 'Male').length / p.length) * 100; } }] } },
  { t: 'Provoked vs unprovoked outcomes', q: 'Predict two percentages', c: { type: 'column', x: 'provoked', measure: 'count', split: 'outcome', stack: true },
    pred: { kind: 'sliders', ask: 'Of the incidents with a known outcome, what percentage ended in a death? Make a prediction for each type of incident.', sliders: [
      { label: 'Unprovoked incidents that were fatal', min: 0, max: 100, step: 1, start: 50, unit: '%', dec: 0, lo: '0%', hi: '100%', actual: () => itemVal({ field: 'provoked', m: 'fatal' }, 'Unprovoked') },
      { label: 'Provoked incidents that were fatal', min: 0, max: 100, step: 1, start: 50, unit: '%', dec: 0, lo: '0%', hi: '100%', actual: () => itemVal({ field: 'provoked', m: 'fatal' }, 'Provoked') }] } },
  { t: 'Where do incidents happen? (map)', q: 'Rank the states', c: { type: 'map', split: 'outcome' },
    pred: { kind: 'rank', field: 'state', m: 'count', items: ['NSW', 'QLD', 'WA', 'SA', 'VIC', 'TAS', 'NT'], hi: 'Most incidents', lo: 'Fewest incidents', ask: 'Rank the states and territories from the MOST to the FEWEST recorded incidents.' } },
  { t: 'Is the fatality rate changing over time?', q: 'Predict two eras', c: { type: 'line', x: 'decade', measure: 'fatal', trend: true },
    pred: { kind: 'sliders', ask: 'What percentage of incidents (with a known outcome) were fatal in each era?', sliders: [
      { label: 'Fatal incidents, 1900 to 1949', min: 0, max: 100, step: 1, start: 50, unit: '%', dec: 0, lo: '0%', hi: '100%', actual: () => measure('fatal', D.filter((r) => r.year >= 1900 && r.year <= 1949), null, 0) },
      { label: 'Fatal incidents, 2000 to 2026', min: 0, max: 100, step: 1, start: 50, unit: '%', dec: 0, lo: '0%', hi: '100%', actual: () => measure('fatal', D.filter((r) => r.year >= 2000), null, 0) }] } },
  { t: 'Water temperature and shark length', q: 'Predict the correlation', c: { type: 'scatter', x: 'water_temp', y: 'length', trend: true },
    pred: { kind: 'sliders', ask: 'Do warmer waters have longer sharks involved? Set the correlation you expect. (Careful: few incidents have a recorded water temperature.)', sliders: [{ label: 'Correlation (r) between water temperature and shark length', min: -1, max: 1, step: 0.05, start: 0, dec: 2, lo: '−1 · warmer = shorter sharks', mid: '0 · no relationship', hi: '+1 · warmer = longer sharks', actual: () => corr('water_temp', 'length') }] } },
];
const KIND = { rank: 'Ranking', sketch: 'Sketch', sliders: 'Slider' };
const shuffle = (a, avoid) => { let b; do { b = a.slice().sort(() => Math.random() - 0.5); } while (avoid && b.join() === avoid.join() && a.length > 1); return b; };
const rankActual = (sp) => sp.items.slice().sort((a, b) => (itemVal(sp, b) ?? -1) - (itemVal(sp, a) ?? -1));
const rankFmt = (sp, v) => (v == null ? '–' : sp.m === 'fatal' ? fmtN(v) + '%' : sp.m === 'avg' ? fmtN(v) + ' m' : fmtN(v));
function newPredState(sp) {
  if (sp.kind === 'rank') return { order: shuffle(sp.items, rankActual(sp)), touched: false };
  if (sp.kind === 'sliders') return { vals: sp.sliders.map((s) => s.start), touched: sp.sliders.map(() => false) };
  return { ys: Array(sp.pts).fill(0.5), moved: new Set() };
}
const sigOf = () => JSON.stringify([S.chart.type, S.chart.x, S.chart.measure]);

function setupPresets() {
  const g = $('presetGrid');
  PRESETS.forEach((p, i) => {
    const b = document.createElement('button'); b.className = 'preset';
    b.innerHTML = '<span class="tag">🔮 ' + KIND[p.pred.kind] + ' prediction</span><b>' + esc(p.t) + '</b><span class="q">' + esc(p.q) + '</span>';
    b.onclick = () => startPreset(i); g.appendChild(b);
  });
}
function startPreset(i) {
  const p = PRESETS[i];
  resetFilters(); (p.f || []).forEach((x) => setFilter(x.key, { sel: new Set(x.sel) }));
  Object.assign(S.chart, { trend: false, stack: true, horiz: false, title: '', bin: '', vals: true, split: '', sort: p.c.sort || 'desc' }, p.c);
  S.colors.over = {};
  S.pred = { i, spec: p.pred, revealed: false, sig: sigOf(), st: newPredState(p.pred) };
  $('starters').open = false;
  renderFilters(); applyFilters();
  $('chartArea').hidden = true; $('predResult').hidden = true; $('predCard').hidden = false;
  renderPred();
  $('predCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderPred() {
  const P = S.pred, sp = P.spec, st = P.st, host = $('predCard');
  host.innerHTML = '<div class="eyebrow">🔮 Predict first</div><h3>' + esc(PRESETS[P.i].t) + '</h3><p class="ask">' + esc(sp.ask) + '</p><div id="predWidget"></div>' +
    '<div class="revealbar"><button class="btn cta" id="revealBtn" disabled>Lock in my prediction and reveal the data</button><p class="hint" id="revealHint"></p></div>';
  const w = $('predWidget'), btn = $('revealBtn');
  const ready = () => {
    const ok = sp.kind === 'rank' ? st.touched : sp.kind === 'sliders' ? st.touched.every(Boolean) : st.moved.size >= Math.ceil(sp.pts / 2);
    btn.disabled = !ok;
    $('revealHint').textContent = ok ? 'Once you reveal, you cannot change this prediction (but you can start again).' : sp.kind === 'rank' ? 'Rearrange the cards to make your ranking first.' : sp.kind === 'sliders' ? 'Move every slider to make your prediction.' : 'Draw your line across most of the graph first.';
  };
  if (sp.kind === 'rank') rankWidget(w, sp, st, ready); else if (sp.kind === 'sliders') sliderWidget(w, sp, st, ready); else sketchWidget(w, sp, st, ready);
  ready();
  btn.onclick = () => {
    P.revealed = true; $('predCard').hidden = true; $('chartArea').hidden = false;
    syncControls(); renderChart(); renderPredResult(); $('predResult').hidden = false;
    $('predResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}
function rankWidget(w, sp, st, ready) {
  w.innerHTML = '<div class="rankwrap"><div class="rankends"><span>▲ ' + esc(sp.hi) + '</span><span>▼ ' + esc(sp.lo) + '</span></div><ol class="rank" style="flex:1"></ol></div>';
  const ol = w.querySelector('ol');
  const num = () => [...ol.children].forEach((li, i) => (li.querySelector('.no').textContent = i + 1));
  const sync = () => { st.order = [...ol.children].map((li) => li.dataset.it); num(); };
  st.order.forEach((it) => {
    const li = document.createElement('li'); li.dataset.it = it;
    li.innerHTML = '<span class="no"></span><span class="grip">⋮⋮</span><span class="lbl">' + esc(it) + '</span><span class="mv"><button data-d="-1" aria-label="Move up">▲</button><button data-d="1" aria-label="Move down">▼</button></span>';
    li.querySelectorAll('button').forEach((b) => (b.onclick = () => {
      const d = +b.dataset.d, sib = d < 0 ? li.previousElementSibling : li.nextElementSibling; if (!sib) return;
      d < 0 ? ol.insertBefore(li, sib) : ol.insertBefore(sib, li); st.touched = true; sync(); ready();
    }));
    li.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; li.setPointerCapture(e.pointerId); li.classList.add('drag'); li._start = st.order.join(); });
    li.addEventListener('pointermove', (e) => {
      if (!li.classList.contains('drag')) return;
      const nx = li.nextElementSibling, pv = li.previousElementSibling, mid = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
      if (nx && e.clientY > mid(nx)) ol.insertBefore(nx, li); else if (pv && e.clientY < mid(pv)) ol.insertBefore(pv, li.nextSibling);
    });
    const end = () => { if (!li.classList.contains('drag')) return; li.classList.remove('drag'); const before = li._start; sync(); if (st.order.join() !== before) st.touched = true; ready(); };
    li.addEventListener('pointerup', end); li.addEventListener('pointercancel', end);
    ol.appendChild(li);
  });
  num();
}
function sliderWidget(w, sp, st, ready) {
  w.innerHTML = sp.sliders.map((s, i) => '<div class="slidebox"><div class="lab">' + esc(s.label) + '</div><div class="val" id="sv' + i + '">?</div>' +
    '<input type="range" id="sl' + i + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + s.start + '" aria-label="' + esc(s.label) + '">' +
    '<div class="ends"><span>' + esc(s.lo) + '</span>' + (s.mid ? '<span>' + esc(s.mid) + '</span>' : '') + '<span>' + esc(s.hi) + '</span></div></div>').join('');
  sp.sliders.forEach((s, i) => {
    const el = $('sl' + i), out = $('sv' + i);
    if (st.touched[i]) out.textContent = (+el.value).toFixed(s.dec) + (s.unit || '');
    el.oninput = () => { st.vals[i] = +el.value; st.touched[i] = true; out.textContent = (+el.value).toFixed(s.dec) + (s.unit || ''); ready(); };
  });
}
function sketchWidget(w, sp, st, ready) {
  const W = 420, H = 250, L = 46, R = 406, T = 16, B = 206, n = sp.pts;
  const X = (i) => L + ((R - L) * i) / (n - 1), Y = (v) => B - v * (B - T);
  w.innerHTML = '<svg class="sketch" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Drawing area for your prediction">' +
    [0.25, 0.5, 0.75, 1].map((v) => '<line class="gl" x1="' + L + '" x2="' + R + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/>').join('') +
    '<path class="ax" d="M' + L + ' ' + (T - 6) + 'V' + B + 'H' + (R + 6) + 'M' + (L - 4) + ' ' + (T + 2) + 'L' + L + ' ' + (T - 6) + 'L' + (L + 4) + ' ' + (T + 2) + 'M' + (R - 2) + ' ' + (B - 4) + 'L' + (R + 6) + ' ' + B + 'L' + (R - 2) + ' ' + (B + 4) + '"/>' +
    '<text x="' + (L + R) / 2 + '" y="' + (H - 12) + '" text-anchor="middle">' + esc(sp.xlab) + '</text>' +
    '<text transform="translate(13 ' + (T + B) / 2 + ') rotate(-90)" text-anchor="middle">' + esc(sp.ylab) + '</text>' +
    '<polyline class="ln" points=""/>' + Array.from({ length: n }, () => '<circle r="7" style="pointer-events:none"/>').join('') + '</svg>' +
    '<p class="hint">Click and drag across the graph to draw your prediction. <button class="link" id="skReset">Start again</button></p>';
  const svg = w.querySelector('svg'), ln = svg.querySelector('polyline'), cs = [...svg.querySelectorAll('circle')];
  const draw = () => { ln.setAttribute('points', st.ys.map((v, i) => X(i) + ',' + Y(v)).join(' ')); cs.forEach((c, i) => { c.setAttribute('cx', X(i)); c.setAttribute('cy', Y(st.ys[i])); c.classList.toggle('on', st.moved.has(i)); }); };
  const pt = (e) => { const r = svg.getBoundingClientRect(), x = ((e.clientX - r.left) * W) / r.width, y = ((e.clientY - r.top) * H) / r.height; const i = Math.max(0, Math.min(n - 1, Math.round(((x - L) / (R - L)) * (n - 1)))); st.ys[i] = Math.max(0, Math.min(1, (B - y) / (B - T))); st.moved.add(i); draw(); ready(); };
  let down = false;
  svg.addEventListener('pointerdown', (e) => { down = true; svg.setPointerCapture(e.pointerId); pt(e); });
  svg.addEventListener('pointermove', (e) => { if (down) pt(e); });
  svg.addEventListener('pointerup', () => (down = false)); svg.addEventListener('pointercancel', () => (down = false));
  $('skReset').onclick = () => { st.ys.fill(0.5); st.moved.clear(); draw(); ready(); };
  draw();
}
function renderPredResult() {
  const P = S.pred, sp = P.spec, st = P.st, el = $('predResult'); let h = '<div class="res"><div class="eyebrow" style="font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)">Your prediction vs the data</div>';
  if (sp.kind === 'rank') {
    const act = rankActual(sp); let exact = 0, big = null;
    act.forEach((it, i) => { const yr = st.order.indexOf(it); if (yr === i) exact++; const d = Math.abs(yr - i); if (!big || d > big.d) big = { it, d, yr: yr + 1, ar: i + 1 }; });
    h += '<div class="banner">' + exact + ' of ' + act.length + ' in exactly the right place' + (exact === act.length ? ' 🎯 perfect!' : exact >= act.length / 2 ? ' · good instincts' : ' · the data surprised you') + '</div>';
    h += '<div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th class="nosort n">Actual rank</th><th class="nosort">' + esc(FB[sp.field].l) + '</th><th class="nosort n">Actual value</th><th class="nosort n">Your rank</th></tr></thead><tbody>' +
      act.map((it, i) => { const yr = st.order.indexOf(it) + 1; return '<tr><td class="n">' + (i + 1) + '</td><td>' + esc(it) + '</td><td class="n"><b>' + rankFmt(sp, itemVal(sp, it)) + '</b></td><td class="n ' + (yr === i + 1 ? 'ok' : 'off') + '">' + yr + (yr === i + 1 ? ' ✓' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    if (big && big.d > 0) h += '<p class="note">Biggest surprise: <b>' + esc(big.it) + '</b>. You ranked it ' + big.yr + ', but it is actually number ' + big.ar + '.</p>';
  } else if (sp.kind === 'sliders') {
    h += sp.sliders.map((s, i) => {
      const a = s.actual(), y = st.vals[i], pos = (v) => Math.max(0, Math.min(100, ((v - s.min) / (s.max - s.min)) * 100)), diff = Math.abs(a - y), tol = (s.max - s.min) * 0.1;
      const f = (v) => v.toFixed(s.dec) + (s.unit || '');
      return '<div><div style="font-weight:600">' + esc(s.label) + '</div><div class="track"><div class="mk you" style="left:' + pos(y) + '%">You: ' + f(y) + '<i></i></div><div class="mk act" style="left:' + pos(a) + '%;top:17px"><i style="margin-top:-6px"></i><span style="display:block;margin-top:2px;color:var(--accent)">Actual: ' + f(a) + '</span></div></div>' +
        '<div style="margin-top:22px" class="' + (diff <= tol ? 'ok' : 'off') + '">' + (diff <= tol ? '✓ Very close' : diff <= tol * 3 ? 'Fairly close' : 'Quite different') + ' · off by ' + f(diff) + '</div></div>';
    }).join('');
  } else {
    const m = P.match;
    h += '<div class="banner">' + (m == null ? '' : m >= 0.85 ? 'Your sketch has almost the same shape as the data' : m >= 0.5 ? 'Your sketch follows part of the real pattern' : m >= 0 ? 'Your sketch is quite different from the real pattern' : 'Your sketch is close to the opposite of the real pattern') + '</div>' +
      '<p class="note" style="margin:0">Shape match: <b>r = ' + (m == null ? '–' : m.toFixed(2)) + '</b>. The dotted ' + (P.colour ? P.colour.name : '') + ' line with diamond markers is your prediction, scaled to the same height. Only the shape counts.</p>';
  }
  h += '<p class="note" style="margin-top:6px">Were you surprised? Think about <i>why</i>, then use the controls below to dig deeper: add a filter, change the graph, or split by another field.</p><div><button class="btn ghost" id="predAgain">↺ Try this prediction again</button></div></div>';
  el.innerHTML = h;
  $('predAgain').onclick = () => { P.revealed = false; P.st = newPredState(sp); $('chartArea').hidden = true; $('predResult').hidden = true; $('predCard').hidden = false; renderPred(); $('predCard').scrollIntoView({ behavior: 'smooth' }); };
}
const PRED_CANDS = [['hot pink', '#ff1fb4'], ['electric yellow', '#ffd400'], ['cyan', '#00e5ff'], ['lime green', '#7cff00'], ['violet', '#8b00ff'], ['bright orange', '#ff6a00'], ['black', '#000000'], ['white', '#ffffff']];
const rgbOf = (c) => { c = String(c || '').trim(); if (/^#[0-9a-f]{6}/i.test(c)) return [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16)); const m = c.match(/\d+(\.\d+)?/g); return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null; };
const cDist = (a, b) => { const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
function predColour(used) {
  const u = used.map(rgbOf).filter(Boolean); let best = null;
  PRED_CANDS.forEach(([name, hex]) => { const d = Math.min(...u.map((x) => cDist(rgbOf(hex), x)), 999); if (!best || d > best.d) best = { name, hex, d }; });
  return best;
}
function addSketchOverlay(cfg) {
  const P = S.pred, st = P.st, ds = cfg.data.datasets.filter((d) => !d.isTrend), G = cfg.data.labels.length;
  const tot = Array.from({ length: G }, (_, j) => ds.reduce((a, d) => a + (d.data[j] || 0), 0)), max = Math.max(...tot) || 1;
  const n = st.ys.length, at = (t) => { const p = t * (n - 1), a = Math.floor(p), b = Math.min(n - 1, a + 1); return st.ys[a] + (st.ys[b] - st.ys[a]) * (p - a); };
  const mine = Array.from({ length: G }, (_, j) => at(G > 1 ? j / (G - 1) : 0));
  const rg = regress(mine, tot); P.match = rg ? rg.r : null;
  const pc = predColour(cfg.data.datasets.filter((d) => !d.isOverlay).map((d) => d.borderColor || d.backgroundColor).concat([css('--ink')]));
  P.colour = pc;
  cfg.data.datasets.push({ label: 'Your prediction (shape only)', type: 'line', data: mine.map((v) => +(v * max).toFixed(3)), borderColor: pc.hex, backgroundColor: pc.hex, borderWidth: 4, borderDash: [3, 6], borderCapStyle: 'round', pointStyle: 'rectRot', pointRadius: 6, pointBorderColor: css('--card'), pointBorderWidth: 2, isTrend: true, isOverlay: true, stack: 'trend', order: -2 });
  cfg.options.plugins.legend.display = true;
}

/* ---------- Full record pop-up ---------- */
const BYID = {}; D.forEach((r) => (BYID[r.id] = r));
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let recPromise = null; const recCur = { id: null, list: [], showEmpty: false };
const loadRecords = () => recPromise || (recPromise = new Promise((res, rej) => { if (window.SHARK_RECORDS) return res(); const sc = document.createElement('script'); sc.src = 'records.js'; sc.onload = res; sc.onerror = () => { recPromise = null; rej(); }; document.head.appendChild(sc); }));
const REC_SECTIONS = [
  ['The incident', [2, 1, 42, 3, 16, 17, 18, 39]],
  ['Location', [4, 5, 6, 7, 8, 9, 49]],
  ['The shark', [10, 11, 14, 15, 12, 13, 25, 24, 27, 44]],
  ['The victim', [30, 31, 19, 20, 21, 26, 32, 33, 34, 35, 36, 37]],
  ['Injury and response', [28, 29, 22, 23, 38, 55, 56]],
  ['Conditions', [43, 45, 46, 47, 48, 50, 51, 52, 53, 54, 40, 41]],
  ['Sources', [57, 58]],
];
function recVal(i, v) {
  if (i === 1 && typeof v === 'number') return MONTHS_LONG[v - 1] + ' (' + v + ')';
  if (i === 42) { const d = String(v).replace(/\D/g, ''); if (d.length >= 3) { const z = d.padStart(4, '0'); return z.slice(0, 2) + ':' + z.slice(2) + ' (' + v + ')'; } }
  return String(v);
}
function ensureModal() {
  if ($('recModal')) return;
  const m = document.createElement('div'); m.id = 'recModal'; m.className = 'modal-back'; m.hidden = true;
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="recTitle"><div class="mhead"><div><div class="meyebrow" id="recEye"></div><h2 id="recTitle"></h2><div class="msub" id="recSub"></div><div class="mchips" id="recChips"></div></div><button class="mclose" id="recClose" aria-label="Close">✕</button></div><div class="mbody" id="recBody"></div><div class="mfoot"><label class="chk"><input type="checkbox" id="recEmpty"><span>Show fields with no data</span></label><span style="flex:1"></span><button class="btn ghost" id="recPrev">◀ Previous</button><span class="hint" id="recPos" style="margin:0"></span><button class="btn ghost" id="recNext">Next ▶</button></div></div>';
  document.body.appendChild(m);
  const close = () => { m.hidden = true; document.body.style.overflow = ''; };
  $('recClose').onclick = close; m.addEventListener('click', (e) => { if (e.target === m) close(); });
  document.addEventListener('keydown', (e) => { if (m.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1); });
  $('recPrev').onclick = () => step(-1); $('recNext').onclick = () => step(1);
  $('recEmpty').onchange = () => { recCur.showEmpty = $('recEmpty').checked; renderRecord(); };
}
function step(d) { const i = recCur.list.indexOf(recCur.id) + d; if (i >= 0 && i < recCur.list.length) { recCur.id = recCur.list[i]; renderRecord(); } }
function openRecord(id, list) {
  ensureModal(); recCur.id = id; recCur.list = list && list.length ? list : [id];
  $('recModal').hidden = false; document.body.style.overflow = 'hidden';
  $('recBody').innerHTML = '<p class="note">Loading the full record…</p>';
  loadRecords().then(renderRecord, () => { $('recBody').innerHTML = '<div class="stat warn">Could not load the full records file (records.js).</div>'; });
}
function renderRecord() {
  const id = recCur.id, R = window.SHARK_RECORDS, rec = R.rows[id] || {}, c = BYID[id] || {};
  $('recEye').textContent = 'Incident record #' + id;
  $('recTitle').textContent = (c.location || 'Unknown location') + (c.state ? ', ' + c.state : '');
  $('recSub').textContent = (c.month ? MONTHS_LONG[c.month - 1] + ' ' : '') + c.year + (c.tod ? ' · ' + c.tod : '');
  $('recChips').innerHTML = [c.outcome, c.provoked, c.species, c.activity].filter(Boolean).map((x) => '<span class="chip">' + esc(x) + '</span>').join('');
  const filled = Object.keys(rec).length; let h = '<p class="note" style="margin:0 0 12px">' + filled + ' of ' + R.cols.length + ' fields recorded. Values are shown exactly as originally recorded (graphs use a tidied version).</p>';
  REC_SECTIONS.forEach(([title, idx]) => {
    const items = idx.filter((i) => recCur.showEmpty || rec[i] !== undefined);
    if (!items.length) return;
    h += '<h3 class="msec">' + title + '</h3><dl class="mdl">' + items.map((i) => '<dt>' + esc(R.cols[i]) + '</dt><dd' + (rec[i] === undefined ? ' class="na"' : '') + '>' + (rec[i] === undefined ? 'not recorded' : esc(recVal(i, rec[i]))) + '</dd>').join('') + '</dl>';
  });
  $('recBody').innerHTML = h; $('recBody').scrollTop = 0;
  const i = recCur.list.indexOf(id); $('recPos').textContent = (i + 1) + ' of ' + recCur.list.length;
  $('recPrev').disabled = i <= 0; $('recNext').disabled = i >= recCur.list.length - 1;
}

/* ---------- Table ---------- */
const cmp = (f, a, b) => {
  if (a == null && b == null) return 0; if (a == null) return 1; if (b == null) return -1;
  if (f.t === 'num') return a - b;
  if (f.order) return f.order.indexOf(a) - f.order.indexOf(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true });
};
function tableRows() {
  const T = S.table, cols = T.cols.map((k) => FB[k]); let rows = RF;
  if (T.q) { const q = T.q.toLowerCase(); rows = rows.filter((r) => cols.some((f) => r[f.k] != null && fmtV(f, r[f.k]).toLowerCase().includes(q))); }
  if (T.sort.length) rows = rows.slice().sort((a, b) => { for (const s of T.sort) { const f = FB[s.key]; const x = a[s.key], y = b[s.key]; if (x == null || y == null) { if (x == null && y == null) continue; return x == null ? 1 : -1; } const d = cmp(f, x, y); if (d) return d * s.dir; } return 0; });
  return { rows, cols };
}
function renderTable() {
  const T = S.table, { rows, cols } = tableRows(), pages = Math.max(1, Math.ceil(rows.length / T.size)); if (T.page >= pages) T.page = pages - 1;
  const slice = rows.slice(T.page * T.size, (T.page + 1) * T.size);
  let h = '<table class="t"><thead><tr>';
  cols.forEach((f) => { const s = T.sort.findIndex((x) => x.key === f.k); const arrow = s < 0 ? '' : (T.sort[s].dir > 0 ? ' ▲' : ' ▼') + (T.sort.length > 1 ? '<sup>' + (s + 1) + '</sup>' : ''); h += '<th data-k="' + f.k + '" class="' + (f.t === 'num' ? 'n' : '') + '" title="' + esc(f.d) + '">' + esc(lab(f)) + arrow + '</th>'; });
  h += '</tr></thead><tbody>';
  slice.forEach((r) => { h += '<tr data-id="' + r.id + '" title="Double-click for the full record">' + cols.map((f) => { const v = r[f.k]; if (f.k === 'id') return '<td><button class="idlink" data-id="' + r.id + '">#' + r.id + '</button></td>'; return v == null ? '<td class="na ' + (f.t === 'num' ? 'n' : '') + '">–</td>' : '<td class="' + (f.t === 'num' ? 'n' : '') + '">' + esc(fmtV(f, v)) + '</td>'; }).join('') + '</tr>'; });
  if (!slice.length) h += '<tr><td colspan="' + cols.length + '">No incidents match.</td></tr>';
  $('tblWrap').innerHTML = h + '</tbody></table>';
  $('tblWrap').querySelectorAll('th').forEach((th) => (th.onclick = (e) => {
    const k = th.dataset.k, i = T.sort.findIndex((x) => x.key === k);
    if (e.shiftKey) { if (i < 0) T.sort.push({ key: k, dir: 1 }); else if (T.sort[i].dir > 0) T.sort[i].dir = -1; else T.sort.splice(i, 1); }
    else { const d = i === 0 && T.sort.length === 1 ? -T.sort[0].dir : 1; T.sort = [{ key: k, dir: d }]; }
    renderTable();
  }));
  $('sortChips').innerHTML = T.sort.map((s, i) => '<span class="chip">' + (i + 1) + '. ' + esc(FB[s.key].l) + (s.dir > 0 ? ' ▲' : ' ▼') + ' <button data-i="' + i + '" aria-label="Remove sort">✕</button></span>').join('');
  $('sortChips').querySelectorAll('button').forEach((b) => (b.onclick = () => { T.sort.splice(+b.dataset.i, 1); renderTable(); }));
  $('pager').innerHTML = '<button class="btn ghost" id="pp">◀ Prev</button><span>Page ' + (T.page + 1) + ' of ' + pages + ' · ' + rows.length.toLocaleString() + ' incidents</span><button class="btn ghost" id="pn">Next ▶</button>';
  $('pp').disabled = T.page === 0; $('pn').disabled = T.page >= pages - 1;
  $('pp').onclick = () => { T.page--; renderTable(); }; $('pn').onclick = () => { T.page++; renderTable(); };
}
function setupTable() {
  $('tblWrap').addEventListener('click', (e) => { const b = e.target.closest('.idlink'); if (b) openRecord(+b.dataset.id, tableRows().rows.map((r) => r.id)); });
  $('tblWrap').addEventListener('dblclick', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) { getSelection().removeAllRanges(); openRecord(+tr.dataset.id, tableRows().rows.map((r) => r.id)); } });
  const cp = $('colpick'); let h = '';
  GROUPS.forEach((g) => { h += '<h4>' + g + '</h4>'; F.filter((f) => f.g === g).forEach((f) => (h += '<label><input type="checkbox" data-k="' + f.k + '">' + esc(lab(f)) + '</label>')); });
  cp.innerHTML = h;
  cp.querySelectorAll('input').forEach((i) => (i.onchange = () => {
    const k = i.dataset.k; S.table.cols = F.map((f) => f.k).filter((x) => (x === k ? i.checked : S.table.cols.includes(x)));
    S.table.sort = S.table.sort.filter((s) => S.table.cols.includes(s.key)); renderTable();
  }));
  $('t-q').oninput = () => { S.table.q = $('t-q').value; S.table.page = 0; renderTable(); };
  $('t-size').onchange = () => { S.table.size = +$('t-size').value; S.table.page = 0; renderTable(); };
  $('t-csv').onclick = () => {
    const { rows, cols } = tableRows(); const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = [cols.map((f) => q(lab(f))).join(',')].concat(rows.map((r) => cols.map((f) => (r[f.k] == null ? '' : q(fmtV(f, r[f.k])))).join(','))).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'shark-incidents-filtered.csv'; a.click();
  };
}
function syncTableControls() { $('colpick').querySelectorAll('input').forEach((i) => (i.checked = S.table.cols.includes(i.dataset.k))); $('t-size').value = S.table.size; $('t-q').value = S.table.q; }

/* ---------- Summary ---------- */
function renderPivot() {
  const P = S.piv, rf = FB[P.row], cf = P.col ? FB[P.col] : null, m = P.measure;
  show2('pr-vf', needsVf(m)); show2('pr-show', m === 'count'); show2('pr-bin', rf.t === 'num');
  const R = groupsFor(rf, RF, +P.bin); let rows = R.groups;
  if (rf.t === 'num') rows = rows.filter((g) => g.recs.length || true);
  let cols = null, cmiss = 0;
  if (cf) { const C = groupsFor(cf, RF, 0); cols = C.groups; cmiss = C.missing; if (cols.length > 10) { const k = cols.slice(0, 9), rest = cols.slice(9); k.push({ key: 'Other', label: 'Other', recs: rest.flatMap((g) => g.recs) }); cols = k; } }
  const used = RF.filter((r) => r[rf.k] != null && (!cf || r[cf.k] != null)), tot = used.length;
  const mode = m === 'count' ? P.show : 'values';
  const cellRecs = (g, c) => (c ? g.recs.filter((r) => c.recs.includes(r)) : g.recs);
  const cset = cols ? cols.map((c) => new Set(c.recs)) : null;
  const sub = (g, ci) => (ci == null ? g.recs.filter((r) => !cf || r[cf.k] != null) : g.recs.filter((r) => cset[ci].has(r)));
  const val = (recs, rowTot, colTot) => {
    if (m !== 'count') return measure(m, recs, P.vf, tot);
    if (mode === 'values') return recs.length; const den = mode === 'row' ? rowTot : mode === 'col' ? colTot : tot; return den ? (recs.length / den) * 100 : 0;
  };
  const f1 = (v) => (v == null ? '–' : mode !== 'values' && m === 'count' ? v.toFixed(1) + '%' : m === 'fatal' ? fmtN(v) + '%' : fmtN(v));
  const colTot = cols ? cols.map((c, ci) => rows.reduce((a, g) => a + sub(g, ci).length, 0)) : null;
  let max = 0; const body = rows.map((g) => {
    const rtot = sub(g, null).length;
    const cells = cols ? cols.map((c, ci) => { const rs = sub(g, ci); const v = val(rs, rtot, colTot[ci]); if (v != null && v > max) max = v; return v; }) : [];
    return { g, rtot, cells, all: val(sub(g, null), rtot, tot) };
  });
  let h = '<table class="t"><thead><tr><th class="nosort">' + esc(lab(rf)) + '</th>' + (cols ? cols.map((c) => '<th class="nosort n">' + esc(c.label) + '</th>').join('') : '') + '<th class="nosort n tot">' + (cols ? 'All' : esc(measLabel(m, P.vf))) + '</th></tr></thead><tbody>';
  body.forEach((b) => {
    h += '<tr><td>' + esc(b.g.label) + '</td>' + b.cells.map((v) => { const p = v && max ? Math.round((v / max) * 55) : 0; return '<td class="n" style="background:color-mix(in srgb,var(--accent) ' + p + '%,transparent)">' + f1(v) + '</td>'; }).join('') + '<td class="n tot">' + f1(b.all) + '</td></tr>';
  });
  if (cols) h += '<tr><td class="tot">All</td>' + cols.map((c, ci) => '<td class="n tot">' + f1(val(c.recs.filter((r) => r[rf.k] != null), tot, colTot[ci])) + '</td>').join('') + '<td class="n tot">' + f1(val(used, tot, tot)) + '</td></tr>';
  $('pivot').innerHTML = h + '</tbody></table>';
  const miss = RF.length - tot;
  $('pivotNote').textContent = tot.toLocaleString() + ' of ' + RF.length.toLocaleString() + ' filtered incidents used.' + (miss ? ' ' + miss + ' have no ' + rf.l.toLowerCase() + (cf ? ' or ' + cf.l.toLowerCase() : '') + ' recorded.' : '');
}
const show2 = (id, on) => ($(id).hidden = !on);
function renderProfile() {
  const f = FB[S.prof], box = $('profile');
  if (f.t === 'num') {
    const v = RF.map((r) => r[f.k]).filter((x) => x != null).sort((a, b) => a - b), n = v.length;
    if (!n) { box.innerHTML = '<p class="note">No values with the current filters.</p>'; return; }
    const mean = v.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1));
    const rows = [['Recorded values (n)', n], ['Missing', RF.length - n], ['Mean', fmtN(mean)], ['Median', fmtN(quant(v, .5))], ['Minimum', fmtN(v[0])], ['Lower quartile (Q1)', fmtN(quant(v, .25))], ['Upper quartile (Q3)', fmtN(quant(v, .75))], ['Maximum', fmtN(v[n - 1])], ['Standard deviation', fmtN(sd)]];
    box.innerHTML = '<p class="note" style="margin:0 0 8px">' + esc(f.d) + '</p><table class="t" style="max-width:420px"><tbody>' + rows.map((r) => '<tr><td>' + r[0] + '</td><td class="n"><b>' + r[1] + '</b></td></tr>').join('') + '</tbody></table>';
  } else if (f.t === 'cat') {
    const g = groupsFor(f, RF, 0), n = RF.length - g.missing, mx = Math.max(1, ...g.groups.map((x) => x.recs.length));
    box.innerHTML = '<p class="note" style="margin:0 0 8px">' + esc(f.d) + '</p><table class="t" style="max-width:560px"><thead><tr><th class="nosort">Value</th><th class="nosort n">Count</th><th class="nosort n">%</th><th class="nosort"></th></tr></thead><tbody>' +
      g.groups.map((x) => '<tr><td>' + esc(x.label) + '</td><td class="n">' + x.recs.length + '</td><td class="n">' + ((x.recs.length / n) * 100).toFixed(1) + '%</td><td><span class="bartiny" style="width:' + (x.recs[0] ? (x.recs.length / mx) * 140 : 0) + 'px"></span></td></tr>').join('') +
      '<tr><td class="na">(not recorded)</td><td class="n">' + g.missing + '</td><td></td><td></td></tr></tbody></table>';
  } else box.innerHTML = '<p class="note">Choose a numeric or category field.</p>';
}
function setupSummary() {
  fieldOpts($('p-row'), (f) => f.t !== 'text', null, S.piv.row); fieldOpts($('p-col'), (f) => f.t === 'cat', 'None', S.piv.col);
  fieldOpts($('p-vf'), (f) => f.t === 'num', null, S.piv.vf); fieldOpts($('pf-field'), (f) => f.t !== 'text', null, S.prof);
  $('p-measure').innerHTML = Object.keys(MEAS).map((m) => '<option value="' + m + '">' + MEAS[m] + (needsVf(m) ? ' of…' : '') + '</option>').join(''); $('p-measure').value = S.piv.measure;
  [['p-row', 'row'], ['p-col', 'col'], ['p-measure', 'measure'], ['p-vf', 'vf'], ['p-show', 'show'], ['p-bin', 'bin']].forEach(([id, k]) => $(id).addEventListener(id === 'p-bin' ? 'input' : 'change', () => { S.piv[k] = $(id).value; renderPivot(); }));
  $('pf-field').onchange = () => { S.prof = $('pf-field').value; renderProfile(); };
  $('pivotChart').onclick = () => {
    const P = S.piv; Object.assign(S.chart, { type: 'column', x: P.row, split: P.col, measure: P.measure, vf: P.vf, bin: P.bin, title: '', trend: false, sort: 'natural', horiz: false });
    if (P.show !== 'values' && P.measure === 'count') S.chart.measure = 'count';
    setTab('chart');
  };
}

/* ---------- About ---------- */
function setupAbout() {
  $('aboutBox').innerHTML = '<h2>About this tool</h2>' +
    '<p>This explorer lets you work like a data scientist with <b>' + D.length.toLocaleString() + ' recorded shark incidents</b> in Australian waters, from ' + Math.min(...D.map((r) => r.year)) + ' to ' + Math.max(...D.map((r) => r.year)) + '. Filter the data, graph it, sort it and summarise it to test your own predictions.</p>' +
    '<h3>How to investigate</h3><ol><li><b>Predict</b>: write down what you expect to find, and why.</li><li><b>Filter</b>: narrow the data to the incidents you care about (e.g. one state, one species, one time period).</li><li><b>Graph or table</b> the fields that can answer your question. Try several graph types.</li><li><b>Interpret</b>: does the evidence support your prediction? How strong is the pattern?</li><li><b>Question it</b>: what else could explain the result? Is the sample large enough?</li></ol>' +
    '<h3>Things to think about (the big data lessons)</h3><ul>' +
    '<li><b>Sample size matters.</b> A fatality rate of 50% from 4 incidents means far less than 15% from 400.</li>' +
    '<li><b>Missing data is everywhere.</b> Many fields (water temperature, victim clothing, time of day) are only recorded for some incidents. Charts only use incidents that have a value, and the note under each graph tells you how many were left out.</li>' +
    '<li><b>Records change over time.</b> Early records are mostly the severe, newsworthy incidents. Modern reporting is far more complete, and more people use the water. 2026 is only a part-year.</li>' +
    '<li><b>Counts are not risks.</b> More incidents in swimmers than in divers could simply mean far more people swim.</li>' +
    '<li><b>Correlation is not causation.</b> A trendline shows a relationship, not a reason. <b>r</b> measures direction and strength (-1 to +1); <b>R²</b> is the share of variation the line explains.</li>' +
    '<li><b>Trendlines</b> are available on scatter plots and on graphs whose X axis is numeric (year, month, age…), including histograms and line graphs.</li></ul>' +
    '<h3>How the data was prepared</h3><ul><li>Source: the <i>Australian Shark-Incident Database, Public Version</i> spreadsheet. Please cite the original database owner when you use these results.</li>' +
    '<li>Spelling and capitalisation were tidied and similar categories merged (e.g. “Snorkeling”/“snorkelling”; all surfing, bodyboarding, paddleboarding and wind sports are “Board sports”).</li>' +
    '<li>Ranges became midpoints (shark length “1.2–1.6” → 1.4; age “60s” → 65). Unclear values were left blank rather than guessed.</li>' +
    '<li>Season, decade, time-of-day band and age group were calculated from other fields. “Injury location” is the first body part listed.</li>' +
    '<li>The map is a simple scatter of longitude and latitude with a rough hand-drawn outline of Australia, not a precise map.</li></ul>' +
    '<h3>Field guide</h3><div class="tblwrap" style="max-height:420px"><table class="t"><thead><tr><th class="nosort">Field</th><th class="nosort">Type</th><th class="nosort n">Recorded</th><th class="nosort">What it means</th></tr></thead><tbody>' +
    F.map((f) => '<tr><td>' + esc(lab(f)) + '</td><td>' + (f.t === 'num' ? 'Number' : f.t === 'cat' ? 'Category' : 'Text') + '</td><td class="n">' + f.n + ' / ' + D.length + '</td><td style="white-space:normal">' + esc(f.d) + '</td></tr>').join('') + '</tbody></table></div>';
}

/* ---------- Tabs, theme, link ---------- */
function setTab(t) {
  S.tab = t;
  document.querySelectorAll('nav.tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === t));
  ['chart', 'table', 'summary', 'about'].forEach((k) => ($('tab-' + k).hidden = k !== t));
  if (t === 'chart') syncControls();
  if (t === 'table') syncTableControls();
  renderActive();
}
function renderActive() {
  if (S.tab === 'chart') { if (!$('chartArea').hidden) renderChart(); }
  else if (S.tab === 'table') renderTable();
  else if (S.tab === 'summary') { renderPivot(); renderProfile(); }
}
function saveLink() {
  const o = { c: S.chart, t: S.table.cols, col: S.colors, f: F.map((f) => FL[f.k]).filter(isActive).map((f) => ({ k: f.key, s: f.sel ? [...f.sel] : null, mn: f.min, mx: f.max, q: f.q })), tab: S.tab };
  return location.href.split('#')[0] + '#v1=' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function loadLink() {
  const m = location.hash.match(/v1=([^&]+)/); if (!m) return;
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    Object.assign(S.chart, o.c); if (o.t) S.table.cols = o.t.filter((k) => FB[k]);
    if (o.col) S.colors = { scheme: SCHEMES[o.col.scheme] ? o.col.scheme : 'default', over: o.col.over || {} };
    (o.f || []).filter((f) => FB[f.k]).forEach((f) => setFilter(f.k, { sel: f.s ? new Set(f.s) : null, min: f.mn, max: f.mx, q: f.q || '' }));
    if (o.tab) S.tab = o.tab;
  } catch (e) { /* ignore bad link */ }
}
function init() {
  loadLink();
  $('fsearch').oninput = filterList;
  $('clearFilters').onclick = () => { resetFilters(); renderFilters(); applyFilters(); renderActive(); };
  $('filtToggle').onclick = () => $('side').classList.toggle('closed');
  if (matchMedia('(max-width:980px)').matches) $('side').classList.add('closed');
  document.querySelectorAll('nav.tabs button').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
  $('themeBtn').onclick = () => { document.documentElement.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('shark_theme', document.documentElement.dataset.theme); } catch (e) { } renderActive(); };
  try { const th = localStorage.getItem('shark_theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) { }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => renderActive());
  $('copyLink').onclick = () => { const u = saveLink(); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Link copied. It restores your filters and graph.'), () => { history.replaceState(null, '', u.slice(u.indexOf('#'))); toast('Link is now in the address bar. Copy it from there.'); }); };
  setupChartControls(); setupPresets(); setupTable(); setupSummary(); setupAbout();
  renderFilters(); applyFilters(); setTab(S.tab);
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (S.tab === 'chart' && S.chart.type === 'map') renderChart(); }, 200); });
}
init();
window.__S = S;
})();
