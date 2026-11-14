-- Alice's exact demonstration edit, equivalent to the repository transaction.
START TRANSACTION;
SELECT id FROM users WHERE id=1 FOR UPDATE;
UPDATE preferences SET min_age=21,max_age=35,weekend='Cozy',social='Quiet' WHERE user_id=1;
DELETE FROM user_interests WHERE user_id=1;
INSERT INTO user_interests(user_id,interest_id) VALUES (1,5),(1,6),(1,7),(1,8),(1,9);
COMMIT;
-- A-ranking.sql now returns Chris (100) above Ben (43).
-- The API also replaces selected gender rows and updates profile fields in this transaction.
