import { pool } from '../src/server/db.js';
import { resetDatabase } from '../database/setup.js';
try {
  const [tables]: any = await pool.query("SHOW TABLES LIKE 'users'");
  if (!tables.length) {
    await resetDatabase();
    console.log('Initialized Chemistry with 64 fictional profiles.');
  } else console.log('Existing database preserved.');
} finally {
  await pool.end();
}
