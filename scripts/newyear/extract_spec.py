"""PDF 양식 → 화면용 템플릿 사양(JSON) 추출기 (2027 새해운 5종).

  python3 -I extract_spec.py <pdf> <key> <out_json> <asset_dir> <asset_url_prefix>

한 쪽마다 ① 그림 ② 도형 ③ 고정 글자 ④ 채울 칸을 PDF 좌표(pt) 그대로 뽑는다. 화면에서는 1pt = 1 CSS px 로 그린 뒤 비율로 키운다.
대괄호 [ … ] 가 들어 있는 글줄이 「채울 칸」이며 세 가지로 나눈다.
  · cell  — 표의 칸·타일처럼 가운데 맞춤인 칸 (가로·세로 중앙, 칸 높이 안에서 줄바꿈·축소)
  · stack — 상자 안에서 위에서 아래로 흐르는 글 묶음 (앞 글이 두 줄이 되면 뒤 글이 밀려 내려간다)
  · free  — 그 밖의 한 줄짜리 칸 (첫 줄 위치 고정, 아래로만 늘어난다)
칸의 열쇠(key)는 「누가 채우는가」로 앞머리를 붙인다:  in.(고객 입력) eng.(산출 엔진) sys.(발행 정보) 그 밖은 p쪽.번호(AI 초안·감수).
"""
import sys, json, re, os
import fitz

pdf_path, KEY, out_json, asset_dir, url_prefix = sys.argv[1:6]
os.makedirs(asset_dir, exist_ok=True)
doc = fitz.open(pdf_path)

HEX = lambda c: None if c is None else '#%02x%02x%02x' % tuple(int(round(v * 255)) for v in c)
R1 = lambda v: round(float(v), 2)
BR = re.compile(r'\[([^\[\]]*)\]')
ASC = 0.936          # line-height 1 일 때 글줄 위끝 = 기준선 − 0.936 × 글자 크기 (Noto Sans CJK KR)

# 판매용 결과물에서 바꿔 쓸 고정 문구 (편집용 안내 → 고객용 안내)
STATIC_REPLACE = {
    '※ 대괄호는 입력 영역입니다. 개인 명식·십성·대운·월주와 해석은 확인 후 입력합니다.': '※ 명식·십성·대운·월주는 만세력 기준으로 산출했고, 해석은 확인 후 작성했습니다.',
    '※ 명식 타일은 개인 정보 입력 전의 중립색입니다. 여덟 글자와 십성은 만세력 대조 후 확정합니다.': '※ 타일 색은 각 글자의 오행입니다. 여덟 글자와 십성은 만세력 기준으로 산출했습니다.',
    '타일색 = 오행  ·  산출 후 해당 색 적용': '타일색 = 오행',
    '※ 대운은 큰 흐름, 세운은 한 해의 흐름입니다. 개인별 십성·합충과 적용 경계는 확인 후 입력합니다.': '※ 대운은 큰 흐름, 세운은 한 해의 흐름입니다. 십성·합충과 적용 경계는 명식 기준으로 확인했습니다.',
}

# ── 산출·입력·발행 칸의 열쇠 (문서별 · 글줄 틀(tpl) 정규식 → 열쇠 목록). 같은 틀이 여러 번 나오면 차례로 쓴다.
SEM = {
    'iching-card': [(r'^\{0\}$', '괘상', [['eng.hex']]), (r'^\{0\}$', '괘 이름', [['eng.hexName']]), (r'^\{0\}$', '선택한 질문 또는 나의 질문', [['in.question']])],
    'saju-card': [(r'^일간 \{0\}', None, [['eng.ilgan', 'eng.season']])],
    'tojeong-card': [],
    'tojeong-detail': [
        (r'\{0\}님$', None, [['in.name']] * 5), (r'^\{0\}님을', None, [['in.name']]),
        (r'^발행일 \{0\}', None, [['sys.issued', 'sys.reviewer']]), (r'^음력 출생일', None, [['eng.lunarBirth']]),
        (r'^상수 \{0\}', None, [['eng.sang', 'eng.jung', 'eng.ha', 'eng.gwae']]),
        (r'^\{0\}\s+/\s+\{1\}$', '판본명·출처', [['sys.edition', 'sys.basis']]), (r'^\{0\}\s+/\s+\{1\}$', '작성자·검토자·검토일', [['sys.pubWho', 'sys.pubNo']]),
    ],
    'saju-premium': [
        (r'\{0\}님$', None, [['in.name']] * 16), (r'^생년월일 \{0\}\s+출생 시각', None, [['in.birthDate', 'in.birthTime']]),
        (r'^발행일 \{0\}', None, [['sys.issued']]), (r'^작성·검토 \{0\}', None, [['sys.reviewer']]),
        (r'^\{0\}\s+\{1\}\s+\{2\}\s+\{3\}$', '양력·음력·윤달', [['eng.calType', 'eng.timePlace', 'eng.timeAdj', 'eng.boundary']]),
        (r'^\{0\}$', '대운과 세운의 위치', [['eng.luckPos']]),
        (r'^\{0\}$', '천간', [['eng.t.hs'], ['eng.t.ds'], ['eng.t.ms'], ['eng.t.ys']]), (r'^\{0\}$', '지지', [['eng.t.hb'], ['eng.t.db'], ['eng.t.mb'], ['eng.t.yb']]),
        (r'^\{0\}$', '천간 십성', [['eng.g.hs'], ['eng.g.ms'], ['eng.g.ys']]), (r'^\{0\}$', '지지 십성', [['eng.g.hb'], ['eng.g.db'], ['eng.g.mb'], ['eng.g.yb']]),
        (r'^\{0\}$', '지장간', [['eng.h.hb'], ['eng.h.db'], ['eng.h.mb'], ['eng.h.yb']]),
        (r'^생년월일\s+\{0\}$', None, [['eng.birthLine']]), (r'^양력·음력·윤달\s+\{0\}$', None, [['eng.calType']]),
        (r'^출생 시각·지역\s+\{0\}$', None, [['eng.timePlace']]), (r'^시각 보정·자시 기준\s+\{0\}$', None, [['eng.timeAdj']]),
        (r'^확인 만세력·버전\s+\{0\}$', None, [['sys.manse']]), (r'^\{0\}$', '시각 미상 등 해석 범위', [['eng.scope']]),
        (r'^\{0\}$', '일간', [['eng.ilgan']]), (r'^\{0\}$', '태어난 계절', [['eng.season']]),
        (r'^\{0\}$', '산출값', [['eng.el.wood'], ['eng.el.fire'], ['eng.el.earth'], ['eng.el.metal'], ['eng.el.water']]),
        (r'^\{0\} 안에서', None, [['eng.curLuck']]), (r'^\{0\}\s+\{1\}\s+\{2\}$', '순행·역행', [['eng.luckDir', 'eng.luckNum', 'eng.luckShift']]),
        (r'^\{0\}$', '간지 · 적용 기간', [['eng.luck0'], ['eng.luck1'], ['eng.luck2'], ['eng.luck3'], ['eng.luck4']]),
        (r'^\{0\}$', '월주 · 적용 기간', [['eng.m%02d' % m] for m in range(1, 13)]),
        (r'^\{0\}$', '만세력·버전 / 연·월 경계 / 시각 보정', [['sys.manseLine']]), (r'^\{0\}\s+/\s+\{1\}$', '작성자·검토자·검토일', [['sys.pubWho', 'sys.pubNo']]),
    ],
}
sem_used = {}
def semantic_keys(tpl, hints):
    for i, (rx, h0, lists) in enumerate(SEM.get(KEY, [])):
        if re.search(rx, tpl) and (h0 is None or (hints and hints[0] == h0)):
            n = sem_used.get(i, 0)
            if n < len(lists): sem_used[i] = n + 1; return lists[n]
    return None

def save_image(xref, name):
    info = doc.extract_image(xref); pix = fitz.Pixmap(doc, xref)
    if info.get('smask'):
        mask = fitz.Pixmap(doc, info['smask'])
        if pix.alpha: pix = fitz.Pixmap(pix, 0)
        pix = fitz.Pixmap(pix, mask); path = os.path.join(asset_dir, name + '.png'); pix.save(path)
    else:
        if pix.n - pix.alpha >= 4: pix = fitz.Pixmap(fitz.csRGB, pix)
        path = os.path.join(asset_dir, name + '.jpg'); pix.save(path, jpg_quality=92)
    return url_prefix + '/' + os.path.basename(path)

def rounded_radius(dr):
    r = dr['rect']
    if not any(it[0] == 'c' for it in dr['items']): return 0
    longest = max([abs(it[1].x - it[2].x) for it in dr['items'] if it[0] == 'l' and abs(it[1].y - it[2].y) < 0.01], default=0)
    return R1(max(0, (r.width - longest) / 2)) if longest else R1(min(r.width, r.height) / 2)

image_names, pages_out, fields = {}, [], []
for pno, page in enumerate(doc):
    PW, PH = page.rect.width, page.rect.height
    images = []
    for im in page.get_images(full=True):
        xref = im[0]
        for rc in page.get_image_rects(xref):
            full = rc.width > PW * 0.9 and rc.height > PH * 0.9
            if xref not in image_names: image_names[xref] = save_image(xref, f"{KEY}-bg" if full else "sheep-stars")
            o = {'src': image_names[xref], 'x': R1(rc.x0), 'y': R1(rc.y0), 'w': R1(rc.width), 'h': R1(rc.height)}
            if full: o['full'] = 1
            images.append(o)
    shapes = []
    for dr in page.get_drawings():
        r = dr['rect']
        if r.width > PW * 0.98 and r.height > PH * 0.98: continue
        kinds = set(it[0] for it in dr['items']); fill, stroke = HEX(dr.get('fill')), HEX(dr.get('color'))
        if kinds == {'l'} and stroke and not fill:
            for it in dr['items']:
                shapes.append({'k': 'l', 'x1': R1(it[1].x), 'y1': R1(it[1].y), 'x2': R1(it[2].x), 'y2': R1(it[2].y), 'stroke': stroke, 'sw': R1(dr.get('width') or 1)})
            continue
        s = {'k': 'r', 'x': R1(r.x0), 'y': R1(r.y0), 'w': R1(r.width), 'h': R1(r.height)}
        rad = rounded_radius(dr)
        if rad: s['r'] = rad
        if fill: s['fill'] = fill
        if stroke: s['stroke'] = stroke; s['sw'] = R1(dr.get('width') or 1)
        shapes.append(s)
    boxes = [s for s in shapes if s['k'] == 'r' and s['h'] > 14 and s['w'] > 24]
    spans = []
    for b in page.get_text('dict')['blocks']:
        if b['type'] != 0: continue
        for l in b['lines']:
            for sp in l['spans']:
                t = sp['text']
                if not t.strip(): continue
                x0, y0, x1, y1 = sp['bbox']
                t2 = STATIC_REPLACE.get(t.strip(), t.strip()); ar = 0
                if '편집 샘플' in t2:
                    t2 = re.sub(r'\s*·\s*편집 샘플', '', t2); t2 = re.sub(r'편집 샘플\s*·\s*', '', t2).replace('편집 샘플', '').strip(); ar = 1
                    if not t2: continue
                spans.append({'x': x0, 'y': sp['origin'][1], 'x1': x1, 's': sp['size'], 'b': 1 if 'Bold' in sp['font'] else 0, 'c': '#%06x' % sp['color'], 't': t2,
                              'slot': bool(BR.search(t2)), 'ar': ar, 'cx': (x0 + x1) / 2})
    spans.sort(key=lambda o: (round(o['y'] / 3), o['x']))
    left_margin = min(sp['x'] for sp in spans)
    title = max((sp for sp in spans if not sp['slot']), key=lambda o: o['s'])['t']
    def container(sp):
        cy = sp['y'] - sp['s'] * 0.35; best = None
        for bx in boxes:
            if bx['x'] - 1 <= sp['cx'] <= bx['x'] + bx['w'] + 1 and bx['y'] - 1 <= cy <= bx['y'] + bx['h'] + 1:
                if best is None or bx['w'] * bx['h'] < best['w'] * best['h']: best = bx
        return best
    for sp in spans: sp['box'] = container(sp)
    def rowmates(sp): return [o for o in spans if o is not sp and abs(o['y'] - sp['y']) < max(5, sp['s'] * 0.4)]
    def header_of(sp):
        c = [o for o in spans if not o['slot'] and o['y'] < sp['y'] - 6 and abs(o['cx'] - sp['cx']) <= 1.6 and o['box'] is not None or (not o['slot'] and o['y'] < sp['y'] - 6 and abs(o['cx'] - sp['cx']) <= 1.6)]
        c = [o for o in c if sp['y'] - o['y'] < 470]
        return max(c, key=lambda o: o['y']) if c else None
    # ── 칸 종류 가르기
    for sp in spans:
        if not sp['slot']: continue
        bx = sp['box']; sp['kind'] = None
        if sp['ar']: sp['kind'] = 'free'; continue
        if bx and abs(sp['cx'] - (bx['x'] + bx['w'] / 2)) <= 1.6 and bx['w'] < PW * 0.62:
            sp['kind'] = 'cell'; sp['hd'] = None; continue
        hd = header_of(sp)
        # 표의 머리줄(같은 줄에 열 제목이 둘 이상)일 때만 「가운데 열」로 본다. 같은 x 에서 시작하면 왼쪽 맞춤으로 쌓인 글이다.
        if hd is not None and abs(hd['x'] - sp['x']) > 2 and len([o for o in spans if not o['slot'] and abs(o['y'] - hd['y']) < 3]) >= 2:
            same = [o for o in spans if o['slot'] and o is not sp and abs(o['cx'] - sp['cx']) <= 1.6]
            if same or sp['y'] - hd['y'] < 60: sp['kind'] = 'cell'; sp['hd'] = hd; continue
    stacks, used = [], set()
    for bx in boxes:
        inside = [sp for sp in spans if sp['box'] is bx and sp.get('kind') != 'cell' and not sp['ar']]
        if not any(sp['slot'] for sp in inside) or len(inside) < 2: continue
        xs = {}
        for sp in inside: xs.setdefault(round(sp['x']), []).append(sp)
        for x0, grp in xs.items():
            if not any(sp['slot'] for sp in grp) or len(grp) < 2: continue
            # 같은 줄에 나란히 놓인 글(레이블 + 값)은 흐름 묶음으로 만들지 않는다
            if any(len([o for o in rowmates(sp) if o['box'] is bx]) > 0 for sp in grp): continue
            grp.sort(key=lambda o: o['y'])
            for sp in grp: sp['kind'] = 'stack'; used.add(id(sp))
            pad = min(26, max(8, grp[0]['x'] - bx['x']))
            stacks.append({'box': bx, 'items': grp, 'x': grp[0]['x'], 'w': bx['x'] + bx['w'] - pad - grp[0]['x'], 'bottom': bx['y'] + bx['h'] - min(pad, 12)})
    for sp in spans:
        if sp['slot'] and sp.get('kind') is None: sp['kind'] = 'free'
    # ── 열쇠·이름 붙이기
    fid = 0
    def make_fields(sp, w_pt, lines, ctx):
        global_keys = []
        hints = [h.strip() for h in BR.findall(sp['t'])]
        ids = []
        tpl = BR.sub(lambda m: ('{%d}' % (ids.append(1) or len(ids) - 1)), sp['t'])
        sem = semantic_keys(tpl, hints)
        keys = []
        rest = re.sub(r'[·/※\s]+', ' ', BR.sub(' ', sp['t'])).strip()
        for i, h in enumerate(hints):
            if not h: h = (re.split(r'\s{2,}', BR.sub('\x00', sp['t']))[0] if False else '') or [x.strip() for x in re.split(r'\[[^\[\]]*\]', sp['t'])][i].strip(' ·/') or rest
            nonlocal_fid[0] += 1
            k = sem[i] if sem and i < len(sem) else f"p{pno+1}.{nonlocal_fid[0]}"
            keys.append(k)
            if not any(f['key'] == k for f in fields):
                fixed = len(BR.sub('', sp['t']).strip())
                per = max(2, int((w_pt / (0.93 * sp['s']) - fixed) / max(1, len(hints)) * 0.94))
                src = k.split('.')[0] if k.split('.')[0] in ('in', 'eng', 'sys') else 'ai'
                mx = per * max(1, lines)
                # 「단어 · 단어」 칸: 가운뎃점과 빈칸은 폭이 좁아 글자 수로 세면 모자라게 나온다 → 두 낱말(각 2~3자)이 들어가게 보정
                if re.search(r'단어.*·.*단어', h): mx = max(8, mx + 2)
                fields.append({'key': k, 'page': pno + 1, 'src': src, 'label': ctx, 'hint': h, 'max': mx})
        return tpl, keys
    nonlocal_fid = [0]
    texts, slots, stacks_out, hexbox = [], [], [], None
    def style(sp): return {'s': R1(sp['s']), 'b': sp['b'], 'c': sp['c']}
    def near_head(sp, within=None):
        c = [o for o in spans if not o['slot'] and o['y'] < sp['y'] - 3 and sp['y'] - o['y'] < 120 and o['x'] <= sp['x'] + 30 and o['x1'] > sp['x'] - 160 and (within is None or o['box'] is within)]
        return max(c, key=lambda o: o['y'])['t'] if c else ''
    for sp in spans:
        if sp['slot'] or id(sp) in used: continue
        o = {'x': R1(sp['x']), 'y': R1(sp['y']), 't': sp['t'], **style(sp)}
        if sp['ar']: o['x'] = R1(sp['x1']); o['al'] = 'r'
        texts.append(o)
    for sp in spans:
        if not sp['slot']: continue
        bx = sp['box']
        if sp['kind'] == 'cell':
            row = rowmates(sp)
            lefts = [o for o in row if o['x1'] < sp['x'] + 1]; rights = [o for o in row if o['x'] > sp['x1'] - 1]
            tbl = bx
            Lb = (tbl['x'] + 8) if tbl else left_margin
            Rb = (tbl['x'] + tbl['w'] - 8) if tbl else PW - left_margin
            if lefts:
                n = max(lefts, key=lambda o: o['x1']); Lb = max(Lb, (n['x1'] + sp['x']) / 2 if n['slot'] else n['x1'] + 6)
            if rights:
                n = min(rights, key=lambda o: o['x']); Rb = min(Rb, (sp['x1'] + n['x']) / 2 if n['slot'] else n['x'] - 6)
            w = max(sp['x1'] - sp['x'], 2 * min(sp['cx'] - Lb, Rb - sp['cx']) - 4)
            col = sorted([o for o in spans if o['slot'] and abs(o['cx'] - sp['cx']) <= 1.6], key=lambda o: o['y'])
            i = col.index(sp)
            nxt = col[i + 1]['y'] - sp['y'] if i + 1 < len(col) else None
            prv = sp['y'] - col[i - 1]['y'] if i > 0 else None
            pitch = min([v for v in (nxt, prv) if v], default=None)
            if sp.get('hd') is None and bx:      # 타일·상자 가운데 칸
                belows = [o['y'] - o['s'] for o in spans if o is not sp and o['box'] is bx and o['y'] > sp['y'] + 2]
                aboves = [o['y'] for o in spans if o is not sp and o['box'] is bx and o['y'] < sp['y'] - 2]
                top = max(aboves) + 3 if aboves else bx['y'] + 4
                bot = min(belows) - 2 if belows else bx['y'] + bx['h'] - 4
                cy = sp['y'] - sp['s'] * (ASC - 0.5)
                h = max(sp['s'] * 1.3, 2 * min(cy - top, bot - cy))
            else:
                h = (pitch - 3) if pitch else sp['s'] * 1.5
                cy = sp['y'] - sp['s'] * (ASC - 0.5)
            lines = max(1, int(h // (sp['s'] * 1.22)))
            lab = [o['t'] for o in sorted(row, key=lambda o: o['x']) if not o['slot'] and o['x1'] < sp['x'] + 1]
            if not lab and sp.get('hd') is not None:     # 두 줄 칸: 가까운 줄머리(예: 01월)
                labs = [o for o in spans if not o['slot'] and o['x'] < (tbl['x'] + 40 if tbl else left_margin + 40) and abs(o['y'] - sp['y']) < 16]
                lab = [min(labs, key=lambda o: abs(o['y'] - sp['y']))['t']] if labs else []
            ctx = ' · '.join(x for x in ([lab[0]] if lab else []) + ([sp['hd']['t']] if sp.get('hd') else [near_head(sp, bx) or near_head(sp)]) if x)
            tpl, keys = make_fields(sp, w, lines, f"{title} › {ctx}" if ctx else title)
            if keys == ['eng.hex']: hexbox = {'x': bx['x'], 'y': bx['y'], 'w': bx['w'], 'h': bx['h'], 'f': 'eng.hex'}; continue
            o = {'k': 'cell', 'x': R1(sp['cx']), 'y': R1(cy), 'w': R1(w), 'h': R1(h), 'tpl': tpl, 'f': keys, **style(sp)}
            if bx and sp.get('hd') is None and bx['w'] < 100 and bx['h'] < 100 and sp['s'] >= 18: o['toneBox'] = shapes.index(bx)
            slots.append(o)
        elif sp['kind'] == 'free':
            row = rowmates(sp)
            # 오른쪽 여백 끝에 붙어 있는 글줄(쪽 제목 오른쪽의 부제)은 오른쪽 맞춤이다
            if not sp['ar'] and not bx and sp['x'] > PW * 0.55 and abs(sp['x1'] - (PW - left_margin)) < 14: sp['ar'] = 1
            if sp['ar']:
                lefts = [o['x1'] for o in row if o['x1'] < sp['x'] + 1]
                w = sp['x1'] - (max(lefts) + 10 if lefts else left_margin); x = sp['x1']; al = 'r'
            else:
                Rr = (bx['x'] + bx['w'] - min(24, max(8, sp['x'] - bx['x']))) if bx else PW - left_margin
                rights = [o['x'] for o in row if o['x'] > sp['x1'] - 1]
                if rights: Rr = min(Rr, min(rights) - 10)
                w = max(sp['x1'] - sp['x'], Rr - sp['x']); x = sp['x']; al = 'l'
            lo, hi = (x - w, x) if al == 'r' else (x, x + w)
            below = [o['y'] - o['s'] * ASC for o in spans if o is not sp and o['y'] > sp['y'] + sp['s'] * 0.5 and o['x'] < hi and o['x1'] > lo]
            sh_below = [s['y'] for s in shapes if s['k'] == 'r' and s['y'] > sp['y'] and s['x'] < hi and s['x'] + s['w'] > lo and s is not bx] + [min(s['y1'], s['y2']) for s in shapes if s['k'] == 'l' and min(s['y1'], s['y2']) > sp['y']]
            top = sp['y'] - sp['s'] * ASC
            limit = min(below + sh_below + [(bx['y'] + bx['h'] - 5) if bx else PH - 16])
            h = max(sp['s'] * 1.25, limit - top - sp['s'] * 0.12)
            lines = max(1, int(h // (sp['s'] * 1.28)))
            rowlab = ' '.join(o['t'] for o in sorted(row, key=lambda o: o['x']) if not o['slot'] and o['x1'] < sp['x'] + 1)
            ctx = ' · '.join(v for v in (near_head(sp, bx) or near_head(sp), rowlab) if v)
            tpl, keys = make_fields(sp, w, lines, f"{title} › {ctx}" if ctx else title)
            slots.append({'k': 'free', 'x': R1(x), 'y': R1(top), 'w': R1(w), 'h': R1(h), 'al': al, 'tpl': tpl, 'f': keys, **style(sp)})
    LH = 1.36
    for st in stacks:
        items = []; prev_bottom = None; bx = st['box']
        top0 = st['items'][0]['y'] - st['items'][0]['s'] * ((LH - 1.448) / 2 + 1.16)
        head = next((o['t'] for o in st['items'] if not o['slot']), '') or near_head(st['items'][0])
        sub = ''
        for sp in st['items']:
            top = sp['y'] - sp['s'] * ((LH - 1.448) / 2 + 1.16)
            gap = 0 if prev_bottom is None else max(0, top - prev_bottom)
            prev_bottom = top + sp['s'] * LH
            it = {'gap': R1(gap), **style(sp)}
            if sp['slot']:
                ctx = ' · '.join(v for v in (head, sub if sub != head else '') if v)
                tpl, keys = make_fields(sp, st['w'], 2, f"{title} › {ctx}" if ctx else title)
                it['tpl'] = tpl; it['f'] = keys
            else:
                it['t'] = sp['t']; sub = sp['t']
            items.append(it)
        stacks_out.append({'x': R1(st['x']), 'y': R1(top0), 'w': R1(st['w']), 'h': R1(st['bottom'] - top0), 'items': items})
    pg = {'images': images, 'shapes': shapes, 'texts': texts, 'slots': slots, 'stacks': stacks_out}
    if hexbox: pg['hex'] = {k: (R1(v) if k != 'f' else v) for k, v in hexbox.items()}
    pages_out.append(pg)

spec = {'key': KEY, 'w': R1(doc[0].rect.width), 'h': R1(doc[0].rect.height), 'pages': pages_out, 'fields': fields}
json.dump(spec, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
by = {}
for f in fields: by[f['src']] = by.get(f['src'], 0) + 1
print(KEY, 'pages', len(pages_out), 'fields', len(fields), by, '| cell', sum(1 for p in pages_out for s in p['slots'] if s['k'] == 'cell'), 'free', sum(1 for p in pages_out for s in p['slots'] if s['k'] == 'free'), 'stacks', sum(len(p['stacks']) for p in pages_out), '| unused sem', [SEM[KEY][i][0] for i in range(len(SEM.get(KEY, []))) if sem_used.get(i, 0) < len(SEM[KEY][i][2]) and KEY != 'x'][:6])
