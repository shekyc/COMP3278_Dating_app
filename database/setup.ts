import mysql from 'mysql2/promise';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dbConfig} from '../src/server/db.js';
import {generateSeed} from './seed-generator.js';
export async function resetDatabase(){
 if(process.env.DEMO_MODE!=='true')throw new Error('Database reset requires DEMO_MODE=true');
 if(!/^chemistry(?:_[a-z0-9_]+)?$/.test(dbConfig.database))throw new Error('Reset restricted to chemistry demo databases');
 const c=await mysql.createConnection({...dbConfig,database:undefined,multipleStatements:true});
 try{
 await c.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
 await c.changeUser({database:dbConfig.database});
 // DDL is not transactional: API holds an exclusive maintenance lock during reset.
 await c.query('SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS messages,saved_profiles,matches,likes,user_interests,preference_genders,preferences,profiles,interests,users; SET FOREIGN_KEY_CHECKS=1;');
 await c.query(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 const seed=generateSeed();writeFileSync(new URL('./seed.sql',import.meta.url),seed);
 await c.beginTransaction();try{await c.query(seed);await c.commit();}catch(e){await c.rollback();throw e;}
 }finally{await c.end();}
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {await resetDatabase();console.log('Chemistry database ready: 64 fictional profiles.');process.exit(0);}
