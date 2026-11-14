-- SQL A: parameter = viewer ID. Used verbatim by the repository.
SELECT ranked.*,
 ROUND(interest_points + weekend_points + social_points + reciprocal_points + district_points) AS score
FROM (
 SELECT u.id, u.name, p.*,
   COUNT(shared.interest_id) AS shared_count,
   GROUP_CONCAT(IF(shared.interest_id IS NOT NULL,i.name,NULL) ORDER BY i.id SEPARATOR ', ') AS shared_interests,
   GROUP_CONCAT(i.name ORDER BY i.id SEPARATOR ', ') AS interests,
   ROUND(40.0 * COUNT(shared.interest_id) / GREATEST(COUNT(ci.interest_id),
     (SELECT COUNT(*) FROM user_interests WHERE user_id = me.user_id),1),2) AS interest_points,
   IF(p.weekend = pref.weekend,15,0) AS weekend_points,
   IF(p.social = pref.social,10,0) AS social_points,
   25 AS reciprocal_points,
   IF(p.district = me.district,10,0) AS district_points,
   EXISTS(SELECT 1 FROM likes WHERE from_user=me.user_id AND to_user=u.id) AS liked,
   EXISTS(SELECT 1 FROM saved_profiles WHERE user_id=me.user_id AND saved_user_id=u.id) AS saved
 FROM users u
 JOIN profiles p ON p.user_id=u.id
 JOIN preferences cp ON cp.user_id=u.id
 JOIN profiles me ON me.user_id=?
 JOIN preferences pref ON pref.user_id=me.user_id
 LEFT JOIN user_interests ci ON ci.user_id=u.id
 LEFT JOIN interests i ON i.id=ci.interest_id
 LEFT JOIN user_interests shared ON shared.user_id=me.user_id AND shared.interest_id=ci.interest_id
 WHERE u.id<>me.user_id
   AND p.age BETWEEN pref.min_age AND pref.max_age
   AND me.age BETWEEN cp.min_age AND cp.max_age
   AND EXISTS(SELECT 1 FROM preference_genders WHERE user_id=me.user_id AND gender=p.gender)
   AND EXISTS(SELECT 1 FROM preference_genders WHERE user_id=u.id AND gender=me.gender)
   AND NOT EXISTS(SELECT 1 FROM matches WHERE user_a=LEAST(me.user_id,u.id) AND user_b=GREATEST(me.user_id,u.id))
 GROUP BY u.id,p.user_id,me.user_id,pref.user_id
) ranked
ORDER BY score DESC, id ASC;
