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
  tab: 'chart', filters: [],
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
const palette = () => (isDark() ? PAL.dark : PAL.light);
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

/* ---------- Filtering ---------- */
function pass(r) {
  for (const fl of S.filters) {
    const f = FB[fl.key], v = r[fl.key];
    if (f.t === 'cat') { if (!fl.sel.has(v == null ? NA : v)) return false; }
    else if (f.t === 'num') {
      if (fl.min == null && fl.max == null) continue;
      if (v == null) return false;
      if (fl.min != null && v < fl.min) return false;
      if (fl.max != null && v > fl.max) return false;
    } else if (fl.q) { if (v == null || !String(v).toLowerCase().includes(fl.q.toLowerCase())) return false; }
  }
  return true;
}
function applyFilters() {
  RF = D.filter(pass);
  const n = RF.length;
  $('countTxt').firstChild.nodeValue = n.toLocaleString() + ' of ' + D.length.toLocaleString() + ' incidents';
  $('countSub').textContent = n === D.length ? 'No filters applied' : Math.round((n / D.length) * 100) + '% of the database match your filters';
  $('countBar').style.width = (n / D.length) * 100 + '%';
  S.table.page = 0;
}
function ruleSummary(fl) {
  const f = FB[fl.key];
  if (f.t === 'cat') return fl.sel.size + ' of ' + (f.vals.length + 1) + ' selected';
  if (f.t === 'num') return fl.min == null && fl.max == null ? 'no limits set' : (fl.min ?? '…') + ' to ' + (fl.max ?? '…');
  return fl.q ? '“' + fl.q + '”' : 'type to search';
}
function renderRules() {
  const box = $('rules'); box.innerHTML = '';
  S.filters.forEach((fl, idx) => {
    const f = FB[fl.key]; const el = document.createElement('div'); el.className = 'rule';
    el.innerHTML = '<header><span>' + esc(f.l) + '</span><span class="sub"></span><button aria-label="Remove filter" title="Remove filter">✕</button></header><div class="body"></div>';
    const sub = el.querySelector('.sub'), body = el.querySelector('.body');
    const upd = () => { sub.textContent = ruleSummary(fl); applyFilters(); renderActive(); };
    el.querySelector('button').onclick = () => { S.filters.splice(idx, 1); renderRules(); applyFilters(); renderActive(); };
    if (f.t === 'cat') {
      const vals = f.vals.concat([NA]);
      body.innerHTML = (vals.length > 12 ? '<input type="search" placeholder="Search values…" style="margin-bottom:4px">' : '') +
        '<div><button class="link" data-a="all">Select all</button> · <button class="link" data-a="none">Select none</button></div><div class="checks"></div>';
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
        ch.querySelectorAll('label').forEach((l) => (l.querySelector('input').checked = all)); upd();
      }));
      const s = body.querySelector('input[type=search]');
      if (s) s.oninput = () => ch.querySelectorAll('label').forEach((l) => (l.style.display = l.dataset.v.includes(s.value.toLowerCase()) ? '' : 'none'));
    } else if (f.t === 'num') {
      body.innerHTML = '<div class="row2"><div><label class="f">From</label><input type="number" step="any" class="mn" placeholder="' + fmtN(f.min) + '"></div><div><label class="f">To</label><input type="number" step="any" class="mx" placeholder="' + fmtN(f.max) + '"></div></div>' +
        '<div class="hint">' + f.n + ' incidents have a value (' + fmtN(f.min) + ' to ' + fmtN(f.max) + '). ' + f.miss + ' have none and are removed while a limit is set.</div>';
      const mn = body.querySelector('.mn'), mx = body.querySelector('.mx');
      mn.value = fl.min ?? ''; mx.value = fl.max ?? '';
      mn.oninput = () => { fl.min = mn.value === '' ? null : +mn.value; upd(); };
      mx.oninput = () => { fl.max = mx.value === '' ? null : +mx.value; upd(); };
    } else {
      body.innerHTML = '<input type="search" placeholder="Contains…">';
      const q = body.querySelector('input'); q.value = fl.q; q.oninput = () => { fl.q = q.value; upd(); };
    }
    sub.textContent = ruleSummary(fl); box.appendChild(el);
  });
}
function addFilter(key, preset) {
  if (!key) return;
  if (S.filters.some((x) => x.key === key)) { toast('You already have a filter on ' + FB[key].l); return; }
  const f = FB[key], fl = { key, sel: null, min: null, max: null, q: '' };
  if (f.t === 'cat') fl.sel = new Set(f.vals.concat([NA]));
  if (preset) Object.assign(fl, preset);
  S.filters.push(fl);
}

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
  return names.map((n) => ({ name: n, test: (r) => key(r) === n, color: n === NR ? nrCol() : n === OTH ? otherCol() : pal[sf.slot[n]], slot: sf.slot[n] ?? 0 }));
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
    const series = sf ? makeSeries(sf, recs) : [{ name: isMap ? 'Incident' : fy.l + ' vs ' + fx.l, test: () => true, color: pal[0], slot: 0 }];
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
  const series = sf ? makeSeries(sf, rec0) : [{ name: mlab, test: () => true, color: pal[0], slot: 0 }];
  const valueFmt = (v) => (meas === 'pct' || meas === 'fatal' ? fmtN(v) + '%' : fmtN(v));
  const model = { head: [ft.l].concat(series.map((s) => s.name)), rows: [] };

  if (type === 'pie') {
    const vals = groups.map((g) => measure(meas, g.recs, c.vf, rec0.length));
    const tot = vals.reduce((a, b) => a + (b || 0), 0);
    const slotOf = (g, i) => (g.isOther ? -1 : ft.t === 'cat' && ft.slot[g.key] !== undefined ? ft.slot[g.key] : i % 8);
    const cols = groups.map((g, i) => (slotOf(g, i) < 0 || slotOf(g, i) > 7 ? otherCol() : pal[slotOf(g, i)]));
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

function renderChart() {
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
  chart = new Chart($('chart'), res.cfg);
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
const PRESETS = [
  { t: 'Which sharks are involved most?', q: 'Predict the top 3 species first.', c: { type: 'pie', x: 'species', measure: 'count', top: 7 } },
  { t: 'Are incidents becoming more common?', q: 'Why might this be, besides sharks?', c: { type: 'line', x: 'decade', measure: 'count', trend: true, split: '' } },
  { t: 'Which activity leads to most incidents?', q: 'Is the most common activity the riskiest?', c: { type: 'column', x: 'activity', measure: 'count', sort: 'desc', horiz: true, split: '' } },
  { t: 'Which activity is most often fatal?', q: 'Compare with the count graph. Check sample sizes!', c: { type: 'column', x: 'activity', measure: 'fatal', sort: 'desc', horiz: true, split: '' } },
  { t: 'Which months are busiest, by state?', q: 'Does the season shift between states?', c: { type: 'column', x: 'month', measure: 'count', split: 'state', stack: true } },
  { t: 'Do bigger sharks cause worse outcomes?', q: 'Predict first: fatal, injured or uninjured?', c: { type: 'column', x: 'outcome', measure: 'avg', vf: 'length', split: '' } },
  { t: 'Does victim age relate to shark length?', q: 'Add a trendline. How strong is r?', c: { type: 'scatter', x: 'age', y: 'length', trend: true, split: '' } },
  { t: 'How far from shore do incidents happen?', q: 'Predict the shape of the distribution.', c: { type: 'hist', x: 'dist_shore', measure: 'count', bin: 50, split: '' } },
  { t: 'What time of day are incidents?', q: 'Is the pattern caused by sharks or people?', c: { type: 'column', x: 'hour', measure: 'count', split: '' }, },
  { t: 'Victim age, by gender', q: 'Compare the two distributions.', c: { type: 'hist', x: 'age', measure: 'count', bin: 5, split: 'gender', stack: false } },
  { t: 'Provoked vs unprovoked outcomes', q: 'Which is more likely to be fatal?', c: { type: 'column', x: 'provoked', measure: 'count', split: 'outcome', stack: true } },
  { t: 'Map of every incident', q: 'Where are the hot spots? Why?', c: { type: 'map', split: 'outcome' } },
  { t: 'Fatal incidents over time', q: 'Has the fatal share changed?', c: { type: 'line', x: 'decade', measure: 'count', trend: true, split: '' }, f: [{ key: 'outcome', sel: ['Fatal'] }] },
  { t: 'Water temperature and shark length', q: 'Warning: very few records. What does that mean?', c: { type: 'scatter', x: 'water_temp', y: 'length', trend: true, split: '' } },
];
function setupPresets() {
  const g = $('presetGrid');
  PRESETS.forEach((p) => {
    const b = document.createElement('button'); b.className = 'preset'; b.innerHTML = '<b>' + esc(p.t) + '</b><span>' + esc(p.q) + '</span>';
    b.onclick = () => {
      S.filters = []; (p.f || []).forEach((x) => addFilter(x.key, { sel: new Set(x.sel) }));
      Object.assign(S.chart, { trend: false, stack: true, horiz: false, title: '', bin: '', vals: true, split: '' }, p.c);
      S.chart.sort = p.c.sort || 'desc'; renderRules(); applyFilters(); syncControls(); renderChart(); $('chartWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    g.appendChild(b);
  });
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
  slice.forEach((r) => { h += '<tr>' + cols.map((f) => { const v = r[f.k]; return v == null ? '<td class="na ' + (f.t === 'num' ? 'n' : '') + '">–</td>' : '<td class="' + (f.t === 'num' ? 'n' : '') + '">' + esc(fmtV(f, v)) + '</td>'; }).join('') + '</tr>'; });
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
  if (S.tab === 'chart') renderChart();
  else if (S.tab === 'table') renderTable();
  else if (S.tab === 'summary') { renderPivot(); renderProfile(); }
}
function saveLink() {
  const o = { c: S.chart, t: S.table.cols, f: S.filters.map((f) => ({ k: f.key, s: f.sel ? [...f.sel] : null, mn: f.min, mx: f.max, q: f.q })), tab: S.tab };
  return location.href.split('#')[0] + '#v1=' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function loadLink() {
  const m = location.hash.match(/v1=([^&]+)/); if (!m) return;
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    Object.assign(S.chart, o.c); if (o.t) S.table.cols = o.t.filter((k) => FB[k]);
    S.filters = []; (o.f || []).filter((f) => FB[f.k]).forEach((f) => addFilter(f.k, { sel: f.s ? new Set(f.s) : null, min: f.mn, max: f.mx, q: f.q || '' }));
    if (o.tab) S.tab = o.tab;
  } catch (e) { /* ignore bad link */ }
}
function init() {
  loadLink();
  fieldOpts($('addFilter'), () => true, 'Choose a field…', ''); $('addFilter').onchange = () => { addFilter($('addFilter').value); $('addFilter').value = ''; renderRules(); applyFilters(); renderActive(); };
  $('clearFilters').onclick = () => { S.filters = []; renderRules(); applyFilters(); renderActive(); };
  $('filtToggle').onclick = () => $('side').classList.toggle('closed');
  if (matchMedia('(max-width:900px)').matches) $('side').classList.add('closed');
  document.querySelectorAll('nav.tabs button').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
  $('themeBtn').onclick = () => { document.documentElement.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('shark_theme', document.documentElement.dataset.theme); } catch (e) { } renderActive(); };
  try { const th = localStorage.getItem('shark_theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) { }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => renderActive());
  $('copyLink').onclick = () => { const u = saveLink(); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Link copied. It restores your filters and graph.'), () => { history.replaceState(null, '', u.slice(u.indexOf('#'))); toast('Link is now in the address bar. Copy it from there.'); }); };
  setupChartControls(); setupPresets(); setupTable(); setupSummary(); setupAbout();
  renderRules(); applyFilters(); setTab(S.tab);
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (S.tab === 'chart' && S.chart.type === 'map') renderChart(); }, 200); });
}
init();
window.__S = S;
})();
