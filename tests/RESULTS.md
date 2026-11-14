# Verification record

Verified on 14 November 2026 in the local macOS workspace, using Node 24.22.1 and isolated MySQL 8.4.11. No personal database was used.

| Check | Result |
| --- | --- |
| TypeScript | Pass, no errors |
| Production Vite build | Pass |
| MySQL integration suite | 11 tests passed, 0 failed |
| Presentation SQL A–E | Executed successfully on `chemistry_test` |
| HTTP assertions | 84 passed on production app, repeated on clean-copy app |
| Portrait assets | 64 primary + 6 gallery, all unique hashes and valid files |
| Served portrait URLs | All 70 returned actual WebP bytes |
| Clean install | Fresh source copy, no node_modules, frozen-lockfile install passed |
| Clean database | New `chemistry_clean` schema initialized with deterministic seed |
| Clean startup | Fresh production build served on port 3002, full HTTP suite passed |
| Desktop browser | 1440×900, no overflow, no broken visible images, no console warnings/errors |
| Mobile browser | 390×844, Discover and Preferences fit without horizontal overflow |
| Browser CRUD | Create Robin, edit Alice, rank flip, like Ben, mutual match, message, reload, unmatch, reset all passed |
| Saved profiles | Removal verified in browser; duplicate save and repeat delete verified against MySQL |
| Galleries | Ben's second photo selected and rendered successfully |
| PPTX | Six slides visually inspected; package, layout, font and import validation passed |
| Video draft | Exactly 120.00 seconds, 1,200 frames decoded without errors; sample frame visually inspected |

The final app database was reset to its initial 64-user state. Initial Alice ranking: Ben 100, Chris 43. After the documented edit: Chris 100, Ben 43. These are SQL outputs, not frontend overrides.

The integration suite also verifies invalid users and foreign keys, self-likes/self-matches, ineligible pairs, transaction rollback, duplicate/concurrent likes, unique matches, sender membership in API and SQL, unmatched message rejection, message cascade and both-like deletion, repeated unmatch rejection, and repeated deterministic resets.

Limits: Docker is not installed on this machine, so the Compose route was not executed. Native setup was tested from a clean copy instead. The MP4 is a captioned screenshot storyboard without narration, not a finished live demonstration recording. New fictional profiles use a disclosed sample portrait. This local demo deliberately has no production authentication.
