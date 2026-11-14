-- Same statements as src/server/repository.ts, with executable demo bindings.
-- Reset first. Ben's (2,1) like is already seeded. Run this on the demo database only.
START TRANSACTION;
SELECT id FROM users WHERE id IN (1,2) ORDER BY id FOR UPDATE;
INSERT INTO likes (from_user,to_user) VALUES (1,2)
 ON DUPLICATE KEY UPDATE from_user=VALUES(from_user);
SELECT 1 FROM likes a
 JOIN likes b ON a.from_user=b.to_user AND a.to_user=b.from_user
 WHERE a.from_user=1 AND a.to_user=2;
-- The API executes INSERT only when this SELECT returns a row, and checks for an existing match first.
-- On a fresh seed, the result above is one row, so the following insert is valid.
INSERT INTO matches (user_a,user_b) VALUES (1,2);
COMMIT;
