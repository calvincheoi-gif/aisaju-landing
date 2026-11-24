#!/bin/sh
# 5종 PDF → 템플릿 사양(JSON)·자산 추출. 사용: sh run_extract.sh <uploads_dir> <out_dir>
U="$1"; O="$2"; S="$(dirname "$0")"
mkdir -p "$O/specs" "$O/assets"
python3 -I "$S/extract_spec.py" "$U/62d98986-01__________.pdf" iching-card    "$O/specs/iching-card.json"    "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/0f6237cd-02__________.pdf" tojeong-card   "$O/specs/tojeong-card.json"   "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/c95646e5-03__________.pdf" saju-card      "$O/specs/saju-card.json"      "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/50e83488-04________4_.pdf" tojeong-detail "$O/specs/tojeong-detail.json" "$O/assets" /newyear/2027 2>/dev/null
python3 -I "$S/extract_spec.py" "$U/1c6781bd-05__________15_____.pdf" saju-premium "$O/specs/saju-premium.json" "$O/assets" /newyear/2027 2>/dev/null
