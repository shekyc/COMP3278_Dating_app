-- Same deletion policy as the repository. Pair (1,2) is Alice and Ben.
START TRANSACTION;
SELECT * FROM matches WHERE user_a=1 AND user_b=2 FOR UPDATE;
DELETE FROM likes WHERE (from_user=1 AND to_user=2) OR (from_user=2 AND to_user=1);
DELETE FROM matches WHERE user_a=1 AND user_b=2;
COMMIT;
-- Messages cascade via their composite foreign key. Saved profiles remain.
-- The API first checks that the acting user belongs to this match.
