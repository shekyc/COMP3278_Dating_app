-- MySQL 8.0.16+ (CHECK constraints enforced); tested on MySQL 8.4.
CREATE TABLE users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(60) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE profiles (
 user_id INT UNSIGNED PRIMARY KEY,
 age TINYINT UNSIGNED NOT NULL CHECK (age BETWEEN 21 AND 99),
 gender ENUM('woman','man','nonbinary') NOT NULL,
 presentation ENUM('feminine','masculine') NOT NULL,
 bio VARCHAR(600) NOT NULL,
 occupation VARCHAR(80) NOT NULL,
 district VARCHAR(60) NOT NULL,
 weekend ENUM('Adventure','Creative','Cozy') NOT NULL,
 social ENUM('Balanced','Outgoing','Quiet') NOT NULL,
 image VARCHAR(160) NOT NULL,
 photos JSON NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE preferences (
 user_id INT UNSIGNED PRIMARY KEY,
 min_age TINYINT UNSIGNED NOT NULL DEFAULT 21,
 max_age TINYINT UNSIGNED NOT NULL DEFAULT 35,
 weekend ENUM('Adventure','Creative','Cozy') NOT NULL,
 social ENUM('Balanced','Outgoing','Quiet') NOT NULL,
 CHECK (min_age >= 21 AND max_age <= 99 AND min_age <= max_age),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE preference_genders (
 user_id INT UNSIGNED NOT NULL,
 gender ENUM('woman','man','nonbinary') NOT NULL,
 PRIMARY KEY (user_id,gender),
 FOREIGN KEY (user_id) REFERENCES preferences(user_id) ON DELETE CASCADE
);
CREATE TABLE interests (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE user_interests (
 user_id INT UNSIGNED NOT NULL,
 interest_id INT UNSIGNED NOT NULL,
 PRIMARY KEY (user_id,interest_id),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE RESTRICT
);
CREATE TABLE likes (
 from_user INT UNSIGNED NOT NULL,
 to_user INT UNSIGNED NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (from_user,to_user),
 CHECK (from_user <> to_user),
 FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (to_user) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE matches (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_a INT UNSIGNED NOT NULL,
 user_b INT UNSIGNED NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY unique_pair (user_a,user_b),
 UNIQUE KEY match_participants (id,user_a,user_b),
 CHECK (user_a < user_b),
 FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE messages (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 match_id INT UNSIGNED NOT NULL,
 user_a INT UNSIGNED NOT NULL,
 user_b INT UNSIGNED NOT NULL,
 sender_id INT UNSIGNED NOT NULL,
 body VARCHAR(1000) NOT NULL CHECK (CHAR_LENGTH(TRIM(body)) > 0),
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (sender_id = user_a OR sender_id = user_b),
 FOREIGN KEY (match_id,user_a,user_b) REFERENCES matches(id,user_a,user_b) ON DELETE CASCADE,
 FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX conversation (match_id,created_at,id)
);
CREATE TABLE saved_profiles (
 user_id INT UNSIGNED NOT NULL,
 saved_user_id INT UNSIGNED NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (user_id,saved_user_id),
 CHECK (user_id <> saved_user_id),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (saved_user_id) REFERENCES users(id) ON DELETE CASCADE
);
