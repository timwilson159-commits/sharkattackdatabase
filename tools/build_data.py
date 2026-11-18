"""Cleans the ASID spreadsheet and writes data.js.
Usage: python tools/build_data.py <xlsx> <out data.js>"""
import sys, re, json, openpyxl

src, out = sys.argv[1], sys.argv[2]
ws = openpyxl.load_workbook(src, read_only=True, data_only=True).active
rows = list(ws.iter_rows(values_only=True))
H = {h: i for i, h in enumerate(rows[0][:59]) if h}
H['wtemp'] = 46
H['atemp'] = 54


def g(r, name):
    v = r[H[name]]
    if isinstance(v, str):
        v = v.replace('\xa0', ' ').strip()
    return None if v in (None, '') else v


def low(v):
    return None if v is None else str(v).strip().lower()


def cap(v):
    return None if v is None else v[:1].upper() + v[1:]


def num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return v
    s = str(v).strip().lower()
    if s == 'surface':
        return 0
    m = re.fullmatch(r'(-?\d*\.?\d+)\s*-\s*(-?\d*\.?\d+)', s)
    if m:
        return round((float(m[1]) + float(m[2])) / 2, 2)
    m = re.fullmatch(r'(-?\d*\.?\d+)\s*m?', s)
    return float(m[1]) if m else None


SEASON = {12: 'Summer', 1: 'Summer', 2: 'Summer', 3: 'Autumn', 4: 'Autumn', 5: 'Autumn',
          6: 'Winter', 7: 'Winter', 8: 'Winter', 9: 'Spring', 10: 'Spring', 11: 'Spring'}


def species(v):
    v = low(v)
    if v in (None, 'unknown', 'reef shark') or ' or ' in v:
        return 'Unidentified'
    return cap(v)


def activity(v):
    v = low(v)
    if v is None:
        return None
    v = v.replace('other: ', '')
    if 'jetski' in v or 'motorised' in v and 'un' not in v:
        return 'Motorised boating'
    if v == 'swimming':
        return 'Swimming'
    if v in ('boarding', 'surfing', 'body boarding', 'paddleboarding', 'wind surfing', 'windsurfing',
             'wing foiler', 'wind foiling'):
        return 'Board sports'
    if 'snorkel' in v:
        return 'Snorkelling'
    if 'diving' in v or v == 'scuba':
        return 'Diving'
    if v == 'spearfishing':
        return 'Spearfishing'
    if v == 'fishing':
        return 'Fishing'
    if v in ('unmotorised boating', 'kayaking', 'surf ski', 'paddling'):
        return 'Unmotorised boating'
    if v in ('standing in water', 'wading', 'standing', 'floating', 'floating on blow-up lilo'):
        return 'Standing / wading / floating'
    return 'Other'


def severity(v):
    v = low(v)
    if v is None:
        return None
    if v.startswith('fat') or 'died' in v:
        return 'Fatal'
    if v in ('n/a', 'none', 'uninjured'):
        return 'No injury'
    if any(k in v for k in ('major', 'severe', 'severed')):
        return 'Major lacerations'
    if 'minor' in v:
        return 'Minor lacerations / wounds'
    if 'teeth' in v:
        return 'Teeth marks only'
    if v in ('abrasion', 'surface wound'):
        return 'Abrasion / surface wound'
    if 'puncture' in v:
        return 'Punctures'
    return 'Lacerations (unspecified)'


def injloc(v):
    v = low(v)
    if v is None:
        return None
    if 'uninjured' in v:
        return 'Uninjured'
    if 'not recovered' in v:
        return 'Body not recovered'
    return cap(v.split(',')[0].replace('other: ', '').strip())


def clothing(v):
    v = low(v)
    if v is None:
        return None
    if 'wetsuit' in v:
        return 'Wetsuit / drysuit'
    if v in ('swimwear', 'boardshorts'):
        return 'Swimwear'
    return cap(v)


def yn(v):
    v = low(v)
    if v is None:
        return None
    return 'Yes' if v.startswith('y') else 'No' if v.startswith('n') else None


def weather(v):
    v = low(v)
    if v is None:
        return None
    if v in ('sunny', 'clear'):
        return 'Sunny / clear'
    if v in ('overcast', 'cloud cover', 'partly cloudy'):
        return 'Cloudy'
    if v in ('rainy', 'stormy'):
        return 'Rainy / stormy'
    return cap(v)


def direction(v):
    v = low(v)
    if v is None:
        return None
    v = v.replace('other: ', '').split(',')[0].strip()
    return {'front': 'In front', 'side': 'Side'}.get(v, cap(v))


def age(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return v
    s = str(v).lower().replace("'", '')
    if s == 'teen':
        return 16
    m = re.fullmatch(r'(\d)0s', s)
    return int(m[1]) * 10 + 5 if m else None


def hour(v):
    if v is None:
        return None
    d = re.sub(r'\D', '', str(v))
    if len(d) < 3:
        return None
    d = d.zfill(4)
    h, m = int(d[:2]), int(d[2:])
    return h if h < 24 and m < 60 else None


def tod(h):
    if h is None:
        return None
    if h >= 21 or h < 5:
        return 'Night (9pm-5am)'
    if h < 9:
        return 'Early morning (5-9am)'
    if h < 12:
        return 'Morning (9am-12pm)'
    if h < 17:
        return 'Afternoon (12-5pm)'
    return 'Evening (5-9pm)'


def agegrp(a):
    if a is None:
        return None
    if a < 10:
        return '0-9'
    if a >= 70:
        return '70+'
    return f'{int(a) // 10 * 10}-{int(a) // 10 * 10 + 9}'


def objbite(v):
    v = low(v)
    if v is None:
        return None
    if v in ('board', 'surfboard', 'paddleboard', 'windsurfer sail'):
        return 'Board'
    if v in ('vessel', 'kayak', 'surfski', 'outrigger canoe'):
        return 'Vessel / craft'
    if v in ('catch', 'bait', 'other: offal') or 'speargun' in v:
        return 'Catch / bait'
    if v in ('dive equipment', 'other: safety vests', 'other: fishing gear', 'oar', 'other: paddle'):
        return 'Equipment'
    if v in ('victim', 'foot', 'leg', 'fin'):
        return 'Victim (body)'
    return 'Other'


def site(v):
    v = low(v)
    if v is None:
        return None
    if v == 'open ocean':
        v = 'ocean/pelagic'
    if v.startswith('other'):
        return 'Other'
    if v.startswith('bay'):
        return 'Estuary/harbour'
    return cap(v)


data = []
for r in rows[1:]:
    if r[0] is None:
        continue
    mo, yr = g(r, 'Incident.month'), g(r, 'Incident.year')
    inj = low(g(r, 'Victim.injury'))
    inj = 'injured' if inj == 'injury' else inj
    hr = hour(g(r, 'Time.of.incident'))
    ag = age(g(r, 'Victim.age'))
    ia = g(r, 'Injury.location')
    nareas = len(str(ia).split(',')) if ia and 'other' not in str(ia) else None
    loc = g(r, 'Location')
    d = dict(
        id=r[0], year=yr, decade=yr // 10 * 10, month=mo, season=SEASON.get(mo),
        outcome=cap(inj), state=(g(r, 'State') or '').upper() or None,
        location=cap(low(loc)) if loc is not None else None,
        lat=num(g(r, 'Latitude')), lon=num(g(r, 'Longitude')), site=site(g(r, 'Site.category')),
        species=species(g(r, 'Shark.common.name')), length=num(g(r, 'Shark.length.m')),
        n_sharks=g(r, 'No.sharks'),
        provoked=cap(low(g(r, 'Provoked/unprovoked'))), activity=activity(g(r, 'Victim.activity')),
        object=objbite(g(r, 'Object.of.bite')), direction=direction(g(r, 'Direction.first.strike')),
        aware=yn(g(r, 'Victim.aware.of.shark')), captured=yn(g(r, 'Shark.captured')),
        injloc=injloc(ia), n_areas=nareas, severity=severity(g(r, 'Injury.severity')),
        gender=cap(low(g(r, 'Victim.gender'))), age=ag, agegrp=agegrp(ag),
        clothing=clothing(g(r, 'Victim.clothing')),
        hour=hr, tod=tod(hr), depth=num(g(r, 'Depth.of.incident.m')),
        time_in_water=num(g(r, 'Time.in.water.min')),
        water_temp=num(g(r, 'wtemp')), water_depth=num(g(r, 'Total.water.depth.m')),
        vis=num(g(r, 'Water.visability.m')), dist_shore=num(g(r, 'Distance.to.shore.m')),
        air_temp=num(g(r, 'atemp')), weather=weather(g(r, 'Weather.condition')),
        ppl3=g(r, 'People <3m'), ppl15=g(r, 'People 3-15m'), teeth=yn(g(r, 'Teeth.recovered')),
        source=cap(low(g(r, 'Data.source'))),
    )
    if not isinstance(d['n_sharks'], (int, float)):
        d['n_sharks'] = None
    data.append({k: v for k, v in d.items() if v is not None})

open(out, 'w', encoding='utf-8').write(
    'window.SHARK_DATA=' + json.dumps(data, separators=(',', ':'), ensure_ascii=False) + ';\n')
print(len(data), 'records written')
