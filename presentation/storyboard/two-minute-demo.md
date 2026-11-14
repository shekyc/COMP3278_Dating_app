# Two-minute video storyboard

Target: 120 seconds, 1440 × 900 browser viewport, browser zoom 100%. All changes below use the real application and MySQL. The screen recording may trim idle time, but must preserve the action and its visible outcome. Do not substitute animation for a database operation.

Before recording, reset in Demo Studio and confirm Alice is selected. Keep a second browser tab on Studio for row inspection. A fresh setup has 64 users, 220 likes, 20 matches, 80 messages and 90 saved relationships.

| Time | Screen and action | SQL / expected state | Voice-over | Framing and transition |
|---|---|---|---|---|
| 00:00–00:04 | Landing, then Step inside | READ existing demo profile | “Chemistry connects fictional people through shared interests.” | Full viewport. Straight cut to Studio. |
| 00:04–00:14 | Studio → Create fictional profile. Keep concise defaults, name Robin, click Create | INSERT users, profiles, preferences, preference_genders and user_interests in one transaction. Users become 65. New profile uses a clearly disclosed sample portrait. | “First, we create Robin. The profile and its relationships are committed together.” | Frame the form and final button. Trim only idle typing time. |
| 00:14–00:20 | Studio → Refresh rows; show Robin in users. Switch to Alice | SELECT recent users. Row 65 appears after a clean reset | “The new user is visible in the database. Now we switch to Alice.” | Brief close crop on new row, then full viewport. |
| 00:20–00:30 | Discover Alice; Ben is top with 100% | SQL A returns ranked eligible candidates. No Alice–Ben match exists | “Ben is Alice's top recommendation. Their five shared interests contribute forty points.” | Hold feature card long enough to read score. |
| 00:30–00:40 | Open chemistry breakdown | READ profile, interests, component scores: 40 + 15 + 10 + 25 + 10 | “The breakdown explains each component. Both people's age and gender preferences must align.” | Close crop on breakdown, then close detail. |
| 00:40–00:53 | My Profile: remove Hiking, Photography, Jazz, Museums. Keep Coffee. Add Gaming, Cooking, Cinema, Board games. Set Their ideal weekend = Cozy and Their social energy = Quiet. Save | UPDATE preferences; DELETE/INSERT interest associations within transaction. Alice’s own lifestyle can remain Adventure/Balanced | “We change Alice's interests and the lifestyle she hopes to find.” | Show selected tags and two preference fields. Use hard cuts to avoid long scrolling. |
| 00:53–01:00 | Discover now shows Chris 100%. Brief before/after comparison using supplied measured graphic | SQL A recalculates. Chris leads; Ben becomes 43. Both remain eligible | “The same SQL now puts Chris first. His score rises from forty-three to one hundred.” | Hold Chris card, then brief measured before/after graphic. |
| 01:00–01:10 | Search Ben in Discover, open his profile and Send a like | INSERT (1,2) into likes; reverse (2,1) already exists. INSERT canonical match (1,2) | “Ben already liked Alice. Her like completes the reciprocal pair.” | Keep search and click visible. |
| 01:10–01:18 | Mutual celebration, then Matches | Match count becomes 21. Like count becomes 221 | “A transaction creates one match. The unique pair constraint prevents duplicates.” | Hold celebration 3 seconds, then show match card. |
| 01:18–01:25 | Studio refresh: show latest match with user_a=1, user_b=2 | SELECT actual match row. Fresh seed normally gives id=21; verify it, do not rely on an old run | “Here is the matching relationship in MySQL.” | Crop to row, then return to conversation. |
| 01:25–01:35 | Say hello. Send “Coffee and a jazz night?” | INSERT message linked to Alice–Ben match with sender_id=1. Messages become 81 | “Alice sends a message. The database verifies that she belongs to this match.” | Frame input, Send, then new bubble. |
| 01:35–01:45 | Reload browser; Ben's conversation remains open | SELECT messages after reload returns the saved text | “After a reload, the message is still here.” | Show reload and the restored conversation. |
| 01:45–01:55 | Unmatch, confirm | DELETE both likes and match. Messages cascade. Matches return to 20, messages to 80, likes to 219 | “Unmatch removes both likes and the match. Related messages cascade automatically.” | Keep confirmation and resulting Matches screen visible. |
| 01:55–02:00 | Studio refresh: counts and no Alice–Ben match; finish on Matches | SELECT confirms deletion. Robin remains, so users remain 65. Saves remain 90 | “The database and interface agree. That completes create, read, update and delete.” | Brief counts crop, then clean finish. No extra closing segment. |

## Recording checklist

- Run a fresh reset; do not reuse data left by tests or an earlier rehearsal.
- Verify MySQL and the app run locally. Disable sleep for the recording session if needed.
- Ensure all profile images have loaded before recording. Assets are local.
- Set viewport to 1440 × 900, zoom to 100%, hide developer tools and unrelated windows.
- Turn on Do Not Disturb and close private browser tabs.
- Use the demo account selector or Studio to switch users. It is intentionally not authentication.
- Rehearse interest changes. Keep Coffee selected; replace the other four interests.
- Change the preference fields on the right, not Alice’s own lifestyle fields.
- Confirm Ben's reverse like exists after reset, and Alice's forward like does not.
- Keep Studio inspection as a separate shot. Do not leave technical overlays in consumer screenshots.
- After reload, confirm the selected conversation and message both return.
- After unmatch, expect 219 likes, not 220: one new like was added and two were removed.
- Record voice-over separately if that makes pacing clearer. Each statement must match the visible action.
- Export MP4 at 1440 × 900 or 1920 × 1200, H.264, 30 fps. Keep total duration at or below 120 seconds.
- Watch the entire exported file with audio. Check small text, pacing, visible row changes and final duration.
- Place the final video beside the deck, test playback on the presentation computer, and keep a backup copy.

## Draft status

This storyboard is ready for recording. A finished video is not implied by this document. See the project README and any generated video files for the actual recording status.
