# SQL that powers the demonstration

## A — Personalized ranking

`A-ranking.sql` is an exact copy of `database/queries/discovery.sql`, which the repository loads at runtime. It is a prepared query with one parameter: viewer ID. In the MySQL client, replace `me.user_id=?` with `me.user_id=1` for Alice. The slideshow shows selected fragments, not an alternative implementation.

The query joins users, profiles and preferences, then left-joins candidate interests and the viewer's matching interest IDs. `COUNT(shared.interest_id)` measures overlap. Dividing by the larger interest-list size keeps the interest component between 0 and 40. `GROUP_CONCAT` supplies the visible explanations. Reciprocal age and gender filters use `BETWEEN` and two `EXISTS` predicates. `NOT EXISTS` excludes existing matches. `GROUP BY` gives one row per candidate. The outer SELECT adds the components, rounds the score, and orders by score descending with ID ascending as a stable tie-break.

| Component | Maximum | Calculation |
|---|---:|---|
| Shared interests | 40 | 40 × intersection ÷ max(viewer count, candidate count, 1), rounded to two decimals |
| Preferred weekend | 15 | Candidate weekend equals viewer's saved preference |
| Preferred social energy | 10 | Candidate social rhythm equals viewer's preference |
| Reciprocal eligibility | 25 | All returned candidates already pass both users' age/gender filters |
| Same district | 10 | Candidate district equals viewer district |

The final score rounds the sum to an integer. A displayed 100% means a perfect score on these demo factors, not a prediction of romantic success. Eligible candidates have at least 25 points. Preferences are directional: Alice's score for Ben can differ from Ben's score for Alice.

### Actual seeded sample

| State | Person | Shared | Interest | Weekend | Social | Reciprocal | District | Total |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Before | Ben | 5 | 40 | 15 | 10 | 25 | 10 | 100 |
| Before | Chris | 1 | 8 | 0 | 0 | 25 | 10 | 43 |
| After | Chris | 5 | 40 | 15 | 10 | 25 | 10 | 100 |
| After | Ben | 1 | 8 | 0 | 0 | 25 | 10 | 43 |

Source: `presentation/data/rankings.json`, emitted by the MySQL integration test. The table compares these two candidates; it does not claim the 43-point candidate ranks second among every eligible profile. Ben leads the full initial ranking and Chris leads the full edited ranking, as tested.

## B — Mutual likes

The API locks both user records in ascending ID order, checks for an existing match, verifies current eligibility, then inserts a like idempotently. A self-join finds a reverse direction. If it exists, the API inserts the canonical pair. The unique pair constraint is a second line of protection. Duplicate requests return the existing match. The parameter-bound demonstration in `B-mutual-like.sql` must run only once after reset; its comments explain the conditional branch handled by the API.

## C, D and E — CRUD support

C updates stored preferences and interest associations. D removes likes and the match, letting the message foreign key cascade. E creates the user, one-to-one rows and junction rows. These are readable bound examples of application statements; the actual API uses parameterized queries and validation. Never run destructive examples on unrelated data.

The separate Studio screen displays query-returned counts and recent rows. Its operation log reports completed application queries and transactions. It is not a MySQL audit log or a statement timing profiler.
