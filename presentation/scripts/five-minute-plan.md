# Five-minute presentation plan

The live deck occupies exactly 3 minutes. A maximum 2-minute recorded demonstration follows. Rehearse the whole sequence, including starting the video, to finish within 5 minutes. This script is approximately 380 spoken words before the video. Speak naturally, leave room to point at the diagrams, and use the timings as hard boundaries.

| Time | Slide | Purpose |
|---|---|---|
| 00:00–00:20 | 1. Chemistry | Introduce the product and fictional-demo scope |
| 00:20–00:48 | 2. Thoughtful discovery | Explain the main UI and real personalization |
| 00:48–01:48 | 3. Relational model | Explain ten tables, cardinalities and integrity |
| 01:48–02:30 | 4. Compatibility in SQL | Explain joins, aggregation, filtering and order |
| 02:30–02:55 | 5. Two likes, one match | Explain directional self-join and canonical pair |
| 02:55–03:00 | 6. The two-minute demonstration | Introduce the video |
| 03:00–05:00 | Video | Demonstrate CREATE, READ, UPDATE, CREATE/READ, DELETE |

## Spoken script

### Slide 1 — 20 seconds

“Chemistry is a local dating-app demonstration built for COMP3278. Its purpose is to make personalization understandable. All 64 people and their portraits are fictional. The interface is designed around a simple question: why might these two people connect?”

### Slide 2 — 28 seconds

“Discover combines a prominent portrait with shared interests and a visible compatibility breakdown. Users can change their profile and preferences, send likes, save profiles, and message mutual matches. Every persistent action goes through the API to MySQL. The demo account switcher removes login friction so we can focus on database behavior.”

### Slide 3 — 60 seconds

“Our relational model has ten tables. Users link to profiles and preferences through shared primary keys, creating one-to-one records. The application creates those records together. User interests form a many-to-many relationship through a junction table. Its composite key prevents duplicate selections. Preferred genders are stored separately, so identity, appearance and dating preferences remain distinct.

“Likes have a sender and recipient. Their ordered composite key makes Alice liking Ben different from Ben liking Alice. A match stores the lower and higher user IDs, with a unique pair constraint. Messages belong to a match. Their composite foreign key and sender check enforce participant membership. When we unmatch, we remove both likes and the match in one transaction, and the database cascades deletion to messages.”

### Slide 4 — 42 seconds

“The ranking query joins profiles, preferences and interest associations. It counts shared interests, normalises by the larger interest list, and adds points for weekend rhythm, social energy, reciprocal eligibility and district. Reciprocal age and gender filters must pass in both directions. Grouping gives one row per candidate; ordering gives a stable ranking.

“These are measured results: Ben starts at 100 and Chris at 43. After Alice selects Chris's interests and lifestyle preferences, Chris becomes 100 and Ben 43. The same SQL calculates both states, with no name-based special cases.”

### Slide 5 — 25 seconds

“A like inserts one directional row. A self-join checks for its reverse. Only two directions together create a match. We lock both users in a consistent order and enforce a unique canonical pair, so repeated or concurrent likes cannot create duplicate matches. Ben already likes Alice in the seed, but Alice has not yet liked Ben.”

### Slide 6 — 5 seconds

“Here is the complete CRUD sequence, using the real database.”

## Speaking roles

Use member numbers until the group supplies names. Every member must speak. Video narration may be recorded by multiple members, but every member should also receive a live segment where practical.

| Group size | Allocation |
|---|---|
| 3 | Member 1: 00:00–00:48 and video CREATE/READ. Member 2: 00:48–01:48 and video UPDATE. Member 3: 01:48–03:00 and video matching/message/DELETE. |
| 4 | Member 1: 00:00–00:48. Member 2: 00:48–01:48. Member 3: 01:48–02:30. Member 4: 02:30–03:00. Split video narration between members if desired. |
| 5 | Member 1: 00:00–00:20. Member 2: 00:20–00:48. Member 3: 00:48–01:48. Member 4: 01:48–02:30. Member 5: 02:30–03:00. Each member already has a live speaking role. |

## Timing discipline

Do not read the full SQL file aloud. Point to COUNT, reciprocal EXISTS, ORDER BY, and the reverse-like join. Keep the detailed ER diagram for questions. Do not add a separate conclusion after the video: the five-minute allocation is already full. Start the video at exactly 03:00; make the player ready before presenting.
