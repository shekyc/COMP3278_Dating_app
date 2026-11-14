# 120-second storyboard draft

`Chemistry-120s-storyboard-draft.mp4` is an initial **screenshot-based storyboard**, rendered from the verified browser captures. It is exactly 120 seconds, H.264, 1440×980, with a caption band identifying each CRUD phase. It has no audio and is explicitly labelled “Not a live recording.” It was decoded end-to-end and visually spot-checked.

Use this draft to rehearse timing and narration. It is **not the final submission recording**: record the actual clicks, edits, reload and deletion using the shot-by-shot instructions in `../storyboard/two-minute-demo.md`, and add the group members' narration. The supplied PPTX has no embedded video; play or insert your final recording at 03:00.

Regenerate the draft with FFmpeg installed:

```bash
python3 presentation/source/render-video.py
```

Or set `FFMPEG_BIN` to a compatible FFmpeg executable. The script uses Python's standard library. `shots.ffconcat` preserves the editable shot order and durations. Total timing: create 20 seconds, read 20, update 20, match 25, message 20, delete 15.
