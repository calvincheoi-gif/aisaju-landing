#!/bin/sh
# 5종 PDF → 템플릿 사양(JSON)·자산 추출. 사용: sh run_extract.sh <uploads_dir> <out_dir>
U="$1"; O="$2"; S="$(dirname "$0")"
mkdir -p "$O/specs" "$O/assets"
python3 -I "$S/extract_spec.py" "$U/62d98986-01__________.pdf" iching-card    "$O/specs/iching-card.json"    "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/0f6237cd-02__________.pdf" tojeong-card   "$O/specs/tojeong-card.json"   "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/c95646e5-03__________.pdf" saju-card      "$O/specs/saju-card.json"      "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/50e83488-04________4_.pdf" tojeong-detail "$O/specs/tojeong-detail.json" "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/1c6781bd-05__________15_____.pdf" saju-premium "$O/specs/saju-premium.json" "$O/assets" /newyear/2027 2>/dev/null
# ※ 추출 뒤 손으로 고친 값(다시 추출하면 덮어써지므로 함께 다시 적용할 것)
#   · iching-card: p1.5·p1.6 칸(s=15,h=56,y=671.5), 행동 상자 y=741·h=110, p1.10 s=18.5 (2026-11-24)
#   · tojeong-card·saju-card: 「2027 총운」 상자 h 103→114, 그 안 글 묶음 h 80.92→93,
#     총운 제목 max 24(한 줄)·요약 max 50(두 줄 이내) (2026-11-24, 총운 상자 넘침 수정)
