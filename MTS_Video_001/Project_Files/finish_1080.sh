#!/bin/bash
# Finish MTS #1 at 1080p: render missing segments, downscale finished 4K ones, assemble, QC, review.
set -e
cd /home/user/Past-the-Rating/MTS_Video_001
mkdir -p Visual_Assets/seg1080
MISSING=$(python3 -c "
import json,os; tl=json.load(open('Project_Files/timeline.json'))
print(','.join(s['id'] for s in tl['segments'] if not os.path.exists(f\"Visual_Assets/segments/{s['id']}.mp4\")))")
cd .. && ONLY=$MISSING node MTS_Video_001/Project_Files/engine/render.js full MTS_Video_001/Project_Files/timeline.json MTS_Video_001/Visual_Assets/seg1080 1 3
cd MTS_Video_001
for f in Visual_Assets/segments/*.mp4; do o=Visual_Assets/seg1080/$(basename $f); [ -f "$o" ] || ffmpeg -v error -y -i $f -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 24 $o; done
python3 -c "
import json; tl=json.load(open('Project_Files/timeline.json'))
open('Visual_Assets/seg1080/_concat.txt','w').write(''.join(f\"file '/home/user/Past-the-Rating/MTS_Video_001/Visual_Assets/seg1080/{s['id']}.mp4'\n\" for s in tl['segments']))
print(tl['duration'])" > /tmp/mts_dur
ffmpeg -v error -y -f concat -safe 0 -i Visual_Assets/seg1080/_concat.txt -i Project_Files/mix/final_mix.wav -i Subtitles/MTS001_en.srt -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:s:0 language=eng -t $(cat /tmp/mts_dur) -movflags +faststart -metadata title="What ₹1 Crore Actually Looks Like" Final_Exports/MTS001_1Crore_1080p.mp4
python3 Project_Files/qc.py Final_Exports/MTS001_1Crore_1080p.mp4 1920 1080 /tmp/claude-0/-home-user-Past-the-Rating/245c2c37-2bd3-5e87-8217-f104e3347054/scratchpad/mts_qc.jpg 8 > Production_Report/qc.json
echo DONE
