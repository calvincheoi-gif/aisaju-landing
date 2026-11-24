"""2027 새해운 양식용 글꼴(부분 글꼴) 만들기 — Noto Sans CJK KR Regular/Bold 를 「한글·기호」와 「한자」로 나눈다."""
from fontTools.ttLib import TTCollection
from fontTools import subset
import os, sys
OUT = sys.argv[1]
core = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0xAC00, 0xD7A4)) | set(range(0x3131, 0x318F))
hanja = set()
for hi in range(0xA1, 0xFE):
    for lo in range(0xA1, 0xFF):
        try: ch = bytes([hi, lo]).decode('euc_kr')
        except Exception: continue
        (hanja if 0x4E00 <= ord(ch) <= 0x9FFF or 0xF900 <= ord(ch) <= 0xFAFF else core).add(ord(ch))
core |= {ord(c) for c in "–—‘’“”…·•※→←↑↓↔○●◎◇◆□■△▲▽▼☆★♡♥✓✔〈〉《》「」『』【】〔〕～℃㎡₩€£¥™©®†‡§¶′″‰№①②③④⑤⑥⑦⑧⑨⑩"}
def ranges(cps):
    cps = sorted(cps); out = []; s = p = cps[0]
    for c in cps[1:]:
        if c == p + 1: p = c; continue
        out.append((s, p)); s = p = c
    out.append((s, p))
    return ",".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in out)
css = []
for w, wt in (("Regular", 400), ("Bold", 700)):
    for part, cps in (("core", core), ("hanja", hanja)):
        ttc = TTCollection(f"/usr/share/fonts/opentype/noto/NotoSansCJK-{w}.ttc")
        font = next(f for f in ttc.fonts if any('CJK KR' in str(n) for n in f['name'].names if n.nameID == 1))
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['kern', 'ccmp']; opts.notdef_outline = True
        opts.drop_tables += ['vhea', 'vmtx', 'VORG']; opts.hinting = False
        ss = subset.Subsetter(opts); ss.populate(unicodes=sorted(cps)); ss.subset(font)
        got = set(font.getBestCmap().keys())
        name = f"NotoSansKR-{w}-{part}.woff2"; font.flavor = 'woff2'; font.save(os.path.join(OUT, name))
        print(name, os.path.getsize(os.path.join(OUT, name))//1024, 'KB', 'glyphs', font['maxp'].numGlyphs)
        css.append(f"@font-face{{font-family:'NY Noto Sans KR';font-style:normal;font-weight:{wt};font-display:block;src:url('/newyear/fonts/{name}') format('woff2');unicode-range:{ranges(got & cps)};}}")
open(os.path.join(OUT, "ny-fonts.css"), "w").write("/* Noto Sans CJK KR (SIL OFL 1.1) 부분 글꼴 — 2027 새해운 양식 전용 */\n" + "\n".join(css) + "\n")
print('css bytes', os.path.getsize(os.path.join(OUT, "ny-fonts.css")))
