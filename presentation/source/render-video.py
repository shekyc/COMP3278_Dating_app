from pathlib import Path
import subprocess, os, shutil
root=Path(__file__).resolve().parents[2]
video=root/'presentation/video';video.mkdir(exist_ok=True)
shots=[('00-create-profile',10),('00-created-database-rows',10),('02-discover-before',12),('03-compatibility',8),('04-preferences',10),('05-discover-after',10),('06-mutual-match',15),('07-matches',10),('08-chat',10),('09-chat-after-refresh',10),('10-after-unmatch',10),('11-database-studio',5)]
manifest=video/'shots.ffconcat';lines=['ffconcat version 1.0']
for name,duration in shots:lines.extend([f"file '../screenshots/{name}.jpg'",f'duration {duration}'])
lines.append(f"file '../screenshots/{shots[-1][0]}.jpg'")
manifest.write_text('\n'.join(lines)+'\n')
font=root/'public/fonts/sans.ttf'
filters=["scale=1440:900:force_original_aspect_ratio=decrease", "pad=1440:980:(ow-iw)/2:0:color=0x482d3c",f"drawtext=fontfile='{font}':text='SCREENSHOT STORYBOARD DRAFT  /  Not a live recording  /  Add group narration':x=36:y=953:fontsize=15:fontcolor=0xd5b9aa"]
phases=[(0,20,'CREATE  -  A fictional profile and its related database rows'),(20,40,'READ  -  SQL ranks Ben at 100 percent and Chris at 43 percent'),(40,60,'UPDATE  -  Saved interests and preferences put Chris first'),(60,85,'CREATE + READ  -  Reciprocal likes create one unique match'),(85,105,'CREATE + READ  -  A message persists after refreshing the page'),(105,120,'DELETE  -  Unmatch removes the relationship and cascades messages')]
for start,end,text in phases:filters.append(f"drawtext=fontfile='{font}':text='{text}':x=36:y=918:fontsize=25:fontcolor=0xfffaf4:enable='gte(t,{start})*lt(t,{end})'")
ff=os.environ.get('FFMPEG_BIN') or shutil.which('ffmpeg')
if not ff: raise SystemExit('Install FFmpeg or set FFMPEG_BIN to its executable.')
subprocess.run([str(ff),'-y','-f','concat','-safe','0','-i',str(manifest),'-vf',','.join(filters),'-t','120','-r','10','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(video/'Chemistry-120s-storyboard-draft.mp4')],check=True)
