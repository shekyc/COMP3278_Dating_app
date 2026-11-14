import mysql from 'mysql2/promise';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dbConfig, pool } from '../src/server/db.js';
import { resetDatabase } from '../database/setup.js';
if (!dbConfig.database.endsWith('_test'))
  throw new Error('Run this verification with DB_NAME=chemistry_test');
await resetDatabase();
const c = await mysql.createConnection({ ...dbConfig, multipleStatements: true });
const sql = (file: string) =>
  readFileSync(new URL(`../presentation/sql/${file}`, import.meta.url), 'utf8');
try {
  const ranking = sql('A-ranking.sql');
  const [before]: any = await c.query(ranking, [1]);
  assert.equal(before[0].id, 2);
  await c.query(sql('C-update.sql'));
  const [after]: any = await c.query(ranking, [1]);
  assert.equal(after[0].id, 3);
  assert.equal(after.find((p: any) => p.id === 2).score, 43);
  await c.query(sql('B-mutual-like.sql'));
  const [matches]: any = await c.query('SELECT * FROM matches WHERE user_a=1 AND user_b=2');
  assert.equal(matches.length, 1);
  await c.query('INSERT INTO messages(match_id,user_a,user_b,sender_id,body) VALUES (?,1,2,1,?)', [
    matches[0].id,
    'Presentation query check',
  ]);
  await c.query(sql('D-unmatch.sql'));
  const [remaining]: any = await c.query('SELECT * FROM messages WHERE match_id=?', [
    matches[0].id,
  ]);
  assert.equal(remaining.length, 0);
  await c.query(sql('E-create.sql'));
  const [counts]: any = await c.query('SELECT COUNT(*) n FROM users');
  assert.equal(counts[0].n, 65);
  console.log(
    'PASS: presentation SQL A–E executed against a clean MySQL schema; measured rankings, match, cascade and profile creation verified.',
  );
} finally {
  await c.end();
  await pool.end();
}
