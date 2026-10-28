import json, sys, os, re, glob
HERE = os.path.dirname(os.path.abspath(__file__))
GOALS = ['weight','muscle','recovery','energy','sleep','cognition','skin','sexual','longevity','gut','immune','hormonal']
GRADES = {'strong','moderate','limited','preclinical','anecdotal'}
KEYS = {'approved','otc','supplement','compounded','category2','investigational','not_approved','restricted','unclear','under_review'}
COMMON = {'common','uncommon','rare','theoretical','unknown'}
TYPES = {'Meta-analysis','Systematic review','RCT','Trial','Cohort','Case series','Case report','Animal','Cell','Review','Label','Guideline'}
DOSE = re.compile(r'\b\d+(\.\d+)?\s?(mg|mcg|µg|ug|iu|IU|units?|ml|mL)\b(?!/dL|/L)', re.I)
cat = {c['id']: c for c in json.load(open(os.path.join(HERE, '..', 'data', 'catalog.json')))}
problems = {}
for f in sorted(glob.glob(os.path.join(HERE, '..', 'data', 'entries', '*.json'))):
    p = []
    try:
        e = json.load(open(f))
    except Exception as ex:
        problems[f] = [f'JSON: {ex}']; continue
    eid = os.path.basename(f)[:-5]
    if e.get('id') != eid: p.append(f'id {e.get("id")} != file')
    if eid not in cat: p.append('not in catalog')
    for k in ['name','summary','what_it_is','evidence','status_us','goals','benefits','risks','avoid_if','interactions','labs','studies','ask_your_clinician','sources','notes_for_editor','checked']:
        if k not in e: p.append(f'missing {k}')
    srcs = {s.get('n') for s in e.get('sources', [])}
    if sorted(srcs) != list(range(1, len(srcs) + 1)): p.append(f'source numbers {sorted(srcs)}')
    for s in e.get('sources', []):
        if not str(s.get('url','')).startswith('http'): p.append(f'source {s.get("n")} url')
    used = set(e.get('status_us', {}).get('sources', []))
    for b in e.get('benefits', []):
        used |= set(b.get('sources', []))
        if b.get('evidence') not in GRADES: p.append(f'benefit grade {b.get("evidence")}')
    for r in e.get('risks', []):
        used |= set(r.get('sources', []))
        if r.get('how_common') not in COMMON: p.append(f'risk how_common {r.get("how_common")}')
    for st in e.get('studies', []):
        used.add(st.get('source'))
        if st.get('type') not in TYPES: p.append(f'study type {st.get("type")}')
    missing = {u for u in used if u not in srcs}
    if missing: p.append(f'cited but not listed {missing}')
    if e.get('evidence', {}).get('grade') not in GRADES: p.append(f'grade {e.get("evidence",{}).get("grade")}')
    if e.get('status_us', {}).get('key') not in KEYS: p.append(f'status key {e.get("status_us",{}).get("key")}')
    g = e.get('goals', {})
    if set(g) != set(GOALS) or any(v not in (0, 0.25, 0.5, 0.75, 1) for v in g.values()): p.append(f'goals {g}')
    text = json.dumps(e)   # titles too: a source title with a strength is still a dose on the page
    for m in DOSE.finditer(text):
        ctx = text[max(0, m.start()-60): m.end()+30]
        p.append(f'possible dose: ...{ctx}...')
    problems[f] = p
for f, p in problems.items():
    print(('OK  ' if not p else 'FIX ') + f, *(['\n    - ' + x for x in p] if p else []))
