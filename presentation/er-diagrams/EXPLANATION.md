# Reading the Chemistry model

The model has ten tables. `users` owns identity, while `profiles` and `preferences` each use `user_id` as both primary key and foreign key. This gives at most one row per user. Profile creation inserts all three in one transaction, so every application user has exactly one profile and preference record. SQL alone allows a user with no dependent row; the detailed diagram therefore shows optional 0..1 dependents.

`user_interests` resolves the many-to-many relationship between users and interests. Its composite primary key prevents the same interest appearing twice for a user. `preference_genders` stores each explicitly selected gender once. Gender identity, visual presentation and dating preference are distinct fields.

`likes` stores an ordered pair. Its primary key is `(from_user,to_user)`, so Alice-to-Ben and Ben-to-Alice are separate facts. A self-like fails a CHECK. A match stores the lower user ID in `user_a`, the higher ID in `user_b`; `CHECK(user_a < user_b)` prevents self-pairs and reversed pairs, and `UNIQUE(user_a,user_b)` prevents duplicates. A transaction verifies the two likes before inserting the match. Reciprocal likes are an application transaction invariant, not a database trigger.

A match owns zero or more messages. Messages carry `match_id,user_a,user_b`, with a composite foreign key to a unique key on matches. The sender has a foreign key to users and a CHECK that it equals one of the two participants. This enforces valid membership even for direct SQL inserts. Storing the participant pair on messages is intentional redundancy for declarative integrity.

Saved profiles are directional bookmarks with a composite primary key and a self-save CHECK. They do not imply a like or match.

`profiles.photos` is an optional JSON array for a small ordered photo gallery. The primary image remains in `image`. It is presentation metadata, not an input to ranking. The interest and preference relationships remain normalized.

All user-owned rows cascade on user deletion. Removing an interest is restricted while associations use it. Unmatch explicitly deletes both directional likes and the match in a transaction; message rows cascade from the match. Saved profiles remain. Repeated unmatch returns 404 because the match is already gone. The app does not expose user deletion.
