import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resetDatabase } from '../database/setup.js';
import { pool } from '../src/server/db.js';
import * as r from '../src/server/repository.js';
async function input(id: number): Promise<any> {
  const p = await r.profile(id);
  return { ...p, interests: p.interests.map((i: any) => i.id) };
}
after(async () => {
  await pool.end();
});
test('MySQL integration: complete deterministic demonstration and failure cases', async (t) => {
  await resetDatabase();
  await t.test('seed counts and referential integrity', async () => {
    const { counts } = await r.inspect();
    for (const [k, n] of Object.entries({
      users: 64,
      profiles: 64,
      preferences: 64,
      interests: 28,
      likes: 220,
      matches: 20,
      messages: 80,
      saved_profiles: 90,
    }))
      assert.equal(counts[k], n, k);
    assert.equal(
      (
        await r.rows(
          'SELECT user_id FROM user_interests GROUP BY user_id HAVING COUNT(*)<5 OR COUNT(*)>9',
        )
      ).length,
      0,
    );
    assert.equal(
      (await r.rows('SELECT presentation,COUNT(*) n FROM profiles GROUP BY presentation')).every(
        (x) => x.n === 32,
      ),
      true,
    );
    assert.equal(
      (
        await r.rows(
          'SELECT m.id FROM matches m WHERE NOT EXISTS(SELECT 1 FROM likes WHERE from_user=m.user_a AND to_user=m.user_b) OR NOT EXISTS(SELECT 1 FROM likes WHERE from_user=m.user_b AND to_user=m.user_a)',
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await r.rows(
          'SELECT m.id FROM matches m JOIN profiles a ON a.user_id=m.user_a JOIN profiles b ON b.user_id=m.user_b JOIN preferences ap ON ap.user_id=a.user_id JOIN preferences bp ON bp.user_id=b.user_id WHERE a.age NOT BETWEEN bp.min_age AND bp.max_age OR b.age NOT BETWEEN ap.min_age AND ap.max_age OR NOT EXISTS(SELECT 1 FROM preference_genders WHERE user_id=a.user_id AND gender=b.gender) OR NOT EXISTS(SELECT 1 FROM preference_genders WHERE user_id=b.user_id AND gender=a.gender)',
        )
      ).length,
      0,
    );
  });
  const before = await r.discover(1);
  let afterRows: any[] = [];
  let matchId = 0;
  await t.test('SQL rankings genuinely respond to interests and preference updates', async () => {
    assert.ok(before.findIndex((x) => x.id === 2) < before.findIndex((x) => x.id === 3));
    assert.equal(before[0].id, 2);
    assert.equal((await r.rows('SELECT * FROM likes WHERE from_user=1 AND to_user=2')).length, 0);
    const p = await input(1);
    p.interests = [5, 6, 7, 8, 9];
    p.preferences.weekend = 'Cozy';
    p.preferences.social = 'Quiet';
    await r.saveProfile(1, p);
    afterRows = await r.discover(1);
    assert.equal(afterRows[0].id, 3);
    assert.ok(afterRows.findIndex((x) => x.id === 3) < afterRows.findIndex((x) => x.id === 2));
    assert.equal((await r.profile(1)).preferences.weekend, 'Cozy');
    mkdirSync('presentation/data', { recursive: true });
    writeFileSync(
      'presentation/data/rankings.json',
      JSON.stringify(
        {
          before: before.filter((p) => [2, 3].includes(p.id)),
          after: afterRows.filter((p) => [2, 3].includes(p.id)),
        },
        null,
        2,
      ),
    );
  });
  await t.test('self-like, missing user and ineligible pair rejected', async () => {
    await assert.rejects(r.like(1, 1));
    await assert.rejects(r.like(1, 9999));
    const p = await input(3);
    p.preferences.genders = ['man'];
    await r.saveProfile(3, p);
    assert.ok(!(await r.discover(1)).some((x) => x.id === 3));
    await assert.rejects(r.like(1, 3));
    p.preferences.genders = ['woman', 'man', 'nonbinary'];
    await r.saveProfile(3, p);
  });
  await t.test(
    'mutual like creates exactly one match; concurrent duplicates are safe',
    async () => {
      const result = await r.like(1, 2);
      assert.equal(result.created, true);
      matchId = result.matchId!;
      await Promise.all([r.like(1, 2), r.like(2, 1), r.like(1, 2)]);
      assert.equal((await r.rows('SELECT * FROM matches WHERE user_a=1 AND user_b=2')).length, 1);
      assert.equal((await r.rows('SELECT * FROM likes WHERE from_user=1 AND to_user=2')).length, 1);
      assert.ok(!(await r.discover(1)).some((x) => x.id === 2));
    },
  );
  await t.test(
    'messages persist across separate reads; sender membership enforced in API and SQL',
    async () => {
      const id = await r.sendMessage(1, matchId, { body: 'Coffee and a jazz night?' });
      assert.ok((await r.messages(2, matchId)).some((m) => m.id === id));
      await assert.rejects(r.sendMessage(3, matchId, { body: 'Intruder' }));
      await assert.rejects(r.sendMessage(1, 9999, { body: 'Missing match' }));
      await assert.rejects(r.sendMessage(1, matchId, { body: '  ' }));
      await assert.rejects(
        pool.query(
          'INSERT INTO messages(match_id,user_a,user_b,sender_id,body) VALUES (?,1,2,3,?)',
          [matchId, 'Invalid participant'],
        ),
      );
    },
  );
  await t.test('save/unsave is idempotent; invalid references rejected', async () => {
    await r.setSaved(1, 3, true);
    await r.setSaved(1, 3, true);
    assert.equal((await r.saved(1)).filter((x) => x.id === 3).length, 1);
    await r.setSaved(1, 3, false);
    await r.setSaved(1, 3, false);
    assert.ok(!(await r.saved(1)).some((x) => x.id === 3));
    await assert.rejects(r.setSaved(1, 1, true));
    await assert.rejects(r.setSaved(1, 99999, true));
  });
  await t.test('unmatch cascades messages and deletes both likes', async () => {
    await r.unmatch(1, matchId);
    assert.equal((await r.rows('SELECT * FROM messages WHERE match_id=?', [matchId])).length, 0);
    assert.equal(
      (
        await r.rows(
          'SELECT * FROM likes WHERE (from_user=1 AND to_user=2) OR (from_user=2 AND to_user=1)',
        )
      ).length,
      0,
    );
    await assert.rejects(r.unmatch(1, matchId));
    await assert.rejects(r.sendMessage(1, matchId, { body: 'After deletion' }));
  });
  await t.test('create profile and atomic rollback of invalid interests', async () => {
    const p = await input(1);
    p.name = 'Demo Robin';
    const id = await r.saveProfile(null, p);
    assert.equal((await r.profile(id)).name, 'Demo Robin');
    const n = (await r.inspect()).counts.users;
    await assert.rejects(r.saveProfile(null, { ...p, interests: [99999] }));
    assert.equal((await r.inspect()).counts.users, n);
  });
  await t.test('database constraints reject self-match and invalid FK', async () => {
    await assert.rejects(pool.query('INSERT INTO matches(user_a,user_b) VALUES (1,1)'));
    await assert.rejects(pool.query('INSERT INTO likes(from_user,to_user) VALUES (1,1)'));
    await assert.rejects(
      pool.query('INSERT INTO user_interests(user_id,interest_id) VALUES (99999,1)'),
    );
  });
  await t.test('reset is repeatable and restores exact initial state', async () => {
    await resetDatabase();
    assert.deepEqual(await r.discover(1), before);
    await resetDatabase();
    assert.deepEqual(await r.discover(1), before);
    assert.equal((await r.inspect()).counts.users, 64);
  });
});
