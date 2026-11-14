# Chemistry — implementation plan

Local university demonstration. React + TypeScript + Vite, Express API, MySQL 8.4, explicit SQL. No production authentication and no cloud requirement.

## Product and visual direction
Warm ivory canvas, plum ink, coral accent, editorial serif headings, clean sans-serif controls. Desktop Discover uses an oversized photographic feature card, a compatibility explanation panel, and a secondary recommendation rail. Responsive navigation and cards. Fictional persona disclosure throughout.

## Demonstration (120 seconds)
0–20 create a fictional profile using the short form; inspect inserted rows in the separate Studio view. Switch to Alice.
20–40 read ranked discovery and explain Ben's shared interests.
40–60 change Alice's interests to Gaming, Cooking, Cinema, Board games, Coffee and weekend/social preferences to Cozy / Quiet. Chris overtakes Ben.
60–85 open Ben, like him; his seeded reverse like creates exactly one match.
85–105 send a message and refresh.
105–120 unmatch; match, messages and both directional likes are removed in one transaction.

## Relational model (10 tables)
users; profiles (1:1); preferences (1:1); preference_genders; interests; user_interests; likes; matches; messages; saved_profiles.
Directional likes and saves use composite primary keys. Matches use canonical low/high user IDs and a unique pair. Messages reference the match's identity and pair through a composite FK; a CHECK restricts sender to those participants. User deletion cascades. Unmatch explicitly deletes both likes and the match; messages cascade. All coordinated writes use transactions.

## Explainable scoring
SQL filters candidates by reciprocal ages and selected genders, excludes self and existing matches, and aggregates shared interests. Score = 40 × intersection / max(interest counts) + 15 for candidate weekend matching viewer's preference + 10 for matching social preference + 25 for reciprocal eligibility + 10 for same district. Range 25–100 among eligible candidates. Stable tie-break: user ID. Exact calculations exposed in profile detail. Demographic appearance does not determine identity or preferences.

## Milestones
1. Schema, deterministic seeds and SQL repository.
2. Transactional API and database integration tests.
3. Consumer UI, local portraits and demo Studio.
4. Browser rehearsal, visual polish and failure checks.
5. ER/SQL/architecture/CRUD graphics, editable slides, scripts, storyboard and screenshots.
6. Clean setup verification, documentation and final GitHub push.
