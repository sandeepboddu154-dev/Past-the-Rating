#!/usr/bin/env python3
"""Money To Scale #1 — final mix: narration + ducked score + cued SFX, two-pass -14 LUFS. All times derived from the timeline."""
import json, os, re, subprocess
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=os.path.join(ROOT,"Project_Files/mix"); os.makedirs(OUT,exist_ok=True)
TL=json.load(open(os.path.join(ROOT,"Project_Files/timeline.json"))); DUR=TL["duration"]; seg={s["id"]:s for s in TL["segments"]}
n=lambda w: re.sub(r"[^a-z0-9]","",w.lower())
def cue(sid,word,k=1,off=0.0):
    c=0
    for w in seg[sid].get("words",[]):
        if n(w["w"])==n(word):
            c+=1
            if c==k: return seg[sid]["start"]+w["s"]+off
    raise KeyError(f"{word} not in {sid}")
CH={s["params"]["num"]:s["start"] for s in TL["segments"] if s["visual"]=="chapter"}
# (file, start, gain dB, fade-in, fade-out END (abs), fade-out length)
MUSIC=[("M1_open",0.0,-3,1.0,CH["01"]+0.6,1.5),("M2_stack",CH["01"],-4,1.5,CH["02"]+0.8,2.5),("M3_saving",CH["02"],-4,1.5,CH["03"]+0.8,2.0),
       ("M4_investing",CH["03"],-4,1.5,CH["04"]+0.8,2.5),("M5_inflation",CH["04"],-4,1.5,CH["05"]+0.8,2.0),("M6_enough",CH["05"],-4,1.5,CH["06"]+0.8,2.0),
       ("M7_levers",CH["06"],-4,1.5,seg["S19"]["start"]+0.8,2.0),("M8_close",seg["S19"]["start"],-3,1.5,DUR-0.1,3.5)]
def sfx():
    L=[("rise",cue("S01","build")-0.6,-12)]
    L+=[("chapter_tick",s,-7) for s in CH.values()]
    L+=[("tick_ui",cue("S03",w),-9) for w in ("hundred","wide","thickness")]
    L+=[("riffle",seg["S04"]["start"]+0.4,-12),("bundle_set",cue("S04","bundle"),-6),
        ("riffle",seg["S05"]["start"]+0.3,-13),("bundle_set",cue("S05","stacked"),-7),("hit_low",cue("S05","taller")-0.1,-12),
        ("whoosh_soft",cue("S05B","hundred"),-11),("rise",cue("S05B","ten",2)-0.4,-10),("hit_low",cue("S05B","qutub"),-9),
        ("clock_fast",seg["S06"]["start"]+0.4,-14),("bundle_set",cue("S07","stack"),-8),("rise",cue("S08","five")-0.6,-12),
        ("whoosh_soft",cue("S09","second"),-11),("tick_ui",cue("S10","sixteen"),-8),("rise",cue("S11","bend")-0.8,-11),
        ("hit_low",cue("S12","sooner")-0.1,-9),("tick_ui",cue("S13","growth"),-8),("shrink",cue("S15","four",2),-9),("shrink",cue("S15","six"),-8),
        ("bundle_set",cue("S17","four"),-9),("shrink",cue("S18","six"),-9),("rise",cue("L01","twelve")-0.5,-12),("rise",cue("L02","twentyfive")-0.4,-11),
        ("tick_ui",cue("L03","halves"),-8),("hit_low",cue("S19","size")-0.1,-12),("whoosh_soft",seg["S20"]["start"]+0.1,-12)]
    return L
def run(a):
    r=subprocess.run(a,capture_output=True,text=True)
    if r.returncode: print(r.stderr[-2500:]); raise SystemExit(1)
    return r
def bus(name,items):
    a=["ffmpeg","-y","-v","error"]; fl=[]
    for i,(p,st,g,ex) in enumerate(items):
        a+=["-i",p]; ch=f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo"+(f",{ex}" if ex else "")+f",volume={g}dB,adelay={int(round(st*1000))}:all=1[a{i}]"; fl.append(ch)
    fl.append("".join(f"[a{i}]" for i in range(len(items)))+f"amix=inputs={len(items)}:normalize=0:dropout_transition=0,apad,atrim=0:{DUR}[o]")
    o=os.path.join(OUT,name+".wav"); run(a+["-filter_complex",";".join(fl),"-map","[o]","-c:a","pcm_s24le",o]); return o
vo=bus("stem_vo",[(os.path.join(ROOT,s["vo"]),s["vo_at"],0,"highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2") for s in TL["segments"] if s.get("vo")])
mus=bus("stem_music",[(os.path.join(ROOT,"Music",f+".mp3"),st,g,f"afade=t=in:d={fi},afade=t=out:st={max(0,fo-st-fl):.3f}:d={fl},atrim=0:{fo-st:.3f}") for f,st,g,fi,fo,fl in MUSIC])
sx=bus("stem_sfx",[(os.path.join(ROOT,"Sound_Effects",f+".mp3"),t,g,None) for f,t,g in sfx()])
pre=os.path.join(OUT,"premix.wav")
run(["ffmpeg","-y","-v","error","-i",vo,"-i",mus,"-i",sx,"-filter_complex","[0:a]asplit=2[v][k];[1:a]volume=-9dB[m];[m][k]sidechaincompress=threshold=0.02:ratio=6:attack=25:release=450[md];[v][md][2:a]amix=inputs=3:normalize=0[o]","-map","[o]","-c:a","pcm_s24le",pre])
r=run(["ffmpeg","-hide_banner","-i",pre,"-af","loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json","-f","null","-"]); m=json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}")+1])
fin=os.path.join(OUT,"final_mix.wav")
run(["ffmpeg","-y","-v","error","-i",pre,"-af",f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000","-c:a","pcm_s24le",fin])
print("mix ok",fin)
