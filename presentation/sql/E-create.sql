-- Representative executable profile creation, matching the repository's coordinated writes.
START TRANSACTION;
INSERT INTO users(name) VALUES ('Demo Robin');
SET @new_user=LAST_INSERT_ID();
INSERT INTO profiles(user_id,age,gender,presentation,bio,occupation,district,weekend,social,image)
VALUES(@new_user,27,'nonbinary','feminine',
 'A curious home cook learning photography one weekend at a time. I enjoy a long walk, a thoughtful conversation, and finding a new favourite café.',
 'Designer','Sheung Wan','Adventure','Balanced','/profiles/01.webp');
INSERT INTO preferences(user_id,min_age,max_age,weekend,social)
VALUES(@new_user,21,35,'Adventure','Balanced');
INSERT INTO preference_genders(user_id,gender)
VALUES(@new_user,'woman'),(@new_user,'man'),(@new_user,'nonbinary');
INSERT INTO user_interests(user_id,interest_id)
VALUES(@new_user,1),(@new_user,2),(@new_user,3),(@new_user,4),(@new_user,5);
COMMIT;
-- New fictional profiles deliberately use a sample portrait; seeded profiles have distinct portraits.
