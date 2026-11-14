import {readFileSync} from 'node:fs';
import {z} from 'zod';
import type {PoolConnection,ResultSetHeader,RowDataPacket} from 'mysql2/promise';
import {pool,transaction} from './db.js';
export const discoverySQL=readFileSync(new URL('../../database/queries/discovery.sql',import.meta.url),'utf8');
export class AppError extends Error{constructor(public status:number,message:string){super(message);}}
const gender=z.enum(['woman','man','nonbinary']);
const weekend=z.enum(['Adventure','Creative','Cozy']);
const social=z.enum(['Balanced','Outgoing','Quiet']);
export const profileSchema=z.object({name:z.string().trim().min(2).max(60),age:z.number().int().min(21).max(99),gender,presentation:z.enum(['feminine','masculine']),bio:z.string().trim().min(20).max(600),occupation:z.string().trim().min(2).max(80),district:z.enum(['Central','Sheung Wan','Wan Chai','Causeway Bay','Kennedy Town','Sai Ying Pun','Mong Kok','Tsim Sha Tsui','Sha Tin','Tsuen Wan','Tseung Kwan O','Tai Po']),weekend,social,interests:z.array(z.number().int().positive()).min(1).max(12).refine(a=>new Set(a).size===a.length,'Choose each interest once'),preferences:z.object({min_age:z.number().int().min(21).max(99),max_age:z.number().int().min(21).max(99),weekend,social,genders:z.array(gender).min(1).max(3).refine(a=>new Set(a).size===a.length)}).refine(p=>p.min_age<=p.max_age,'Minimum age must not exceed maximum')});
export type ProfileInput=z.infer<typeof profileSchema>;
export async function rows(sql:string,params:unknown[]=[],c:PoolConnection|typeof pool=pool){return (await c.query<RowDataPacket[]>(sql,params))[0];}
export async function userExists(id:number,c:PoolConnection|typeof pool=pool){if(!(await rows('SELECT id FROM users WHERE id=?',[id],c)).length)throw new AppError(404,'Profile not found.');}
export async function listUsers(){return rows('SELECT u.id,u.name,p.image FROM users u JOIN profiles p ON p.user_id=u.id ORDER BY u.id');}
export async function profile(id:number){
 const [p]=await rows('SELECT u.id,u.name,p.* FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?',[id]);if(!p)throw new AppError(404,'Profile not found.');
 p.interests=await rows('SELECT i.id,i.name FROM user_interests ui JOIN interests i ON i.id=ui.interest_id WHERE ui.user_id=? ORDER BY i.id',[id]);
 const [pref]=await rows('SELECT * FROM preferences WHERE user_id=?',[id]);
 pref.genders=(await rows('SELECT gender FROM preference_genders WHERE user_id=?',[id])).map(r=>r.gender);p.preferences=pref;return p;
}
export async function discover(id:number,c:PoolConnection|typeof pool=pool){await userExists(id,c);return rows(discoverySQL,[id],c);}
async function writeRelationships(c:PoolConnection,id:number,p:ProfileInput){
 // SQL C: an ordinary UPDATE drives the next ranking SELECT.
 await c.query('UPDATE preferences SET min_age=?,max_age=?,weekend=?,social=? WHERE user_id=?',[p.preferences.min_age,p.preferences.max_age,p.preferences.weekend,p.preferences.social,id]);
 await c.query('DELETE FROM preference_genders WHERE user_id=?',[id]);
 for(const g of p.preferences.genders)await c.query('INSERT INTO preference_genders (user_id,gender) VALUES (?,?)',[id,g]);
 await c.query('DELETE FROM user_interests WHERE user_id=?',[id]);
 for(const interest of p.interests)await c.query('INSERT INTO user_interests (user_id,interest_id) VALUES (?,?)',[id,interest]);
}
export async function saveProfile(id:number|null,input:unknown){
 const p=profileSchema.parse(input);
 return transaction(async c=>{
 let uid=id;
 if(uid===null){const [r]=await c.query<ResultSetHeader>('INSERT INTO users (name) VALUES (?)',[p.name]);uid=r.insertId;
 await c.query('INSERT INTO profiles (user_id,age,gender,presentation,bio,occupation,district,weekend,social,image) VALUES (?,?,?,?,?,?,?,?,?,?)',[uid,p.age,p.gender,p.presentation,p.bio,p.occupation,p.district,p.weekend,p.social,p.presentation==='feminine'?'/profiles/01.png':'/profiles/02.png']);
 await c.query('INSERT INTO preferences (user_id,min_age,max_age,weekend,social) VALUES (?,?,?,?,?)',[uid,p.preferences.min_age,p.preferences.max_age,p.preferences.weekend,p.preferences.social]);
 }else{
 await userExists(uid,c);await c.query('SELECT id FROM users WHERE id=? FOR UPDATE',[uid]);
 await c.query('UPDATE users SET name=? WHERE id=?',[p.name,uid]);
 await c.query('UPDATE profiles SET age=?,gender=?,presentation=?,bio=?,occupation=?,district=?,weekend=?,social=? WHERE user_id=?',[p.age,p.gender,p.presentation,p.bio,p.occupation,p.district,p.weekend,p.social,uid]);
 }
 await writeRelationships(c,uid,p);return uid;
 });
}
export async function like(from:number,to:number){
 if(from===to)throw new AppError(400,'You cannot like your own profile.');
 return transaction(async c=>{
 const a=Math.min(from,to),b=Math.max(from,to);
 const locked=await rows('SELECT id FROM users WHERE id IN (?,?) ORDER BY id FOR UPDATE',[a,b],c);if(locked.length!==2)throw new AppError(404,'Profile not found.');
 const [existing]=await rows('SELECT id FROM matches WHERE user_a=? AND user_b=?',[a,b],c);if(existing)return {matchId:existing.id,created:false};
 if(!(await discover(from,c)).some(p=>p.id===to))throw new AppError(400,'Your current discovery preferences do not align.');
 await c.query('INSERT INTO likes (from_user,to_user) VALUES (?,?) ON DUPLICATE KEY UPDATE from_user=VALUES(from_user)',[from,to]);
 // SQL B: both directions are required; canonical pair + UNIQUE prevent duplicates.
 const mutual=await rows('SELECT 1 FROM likes a JOIN likes b ON a.from_user=b.to_user AND a.to_user=b.from_user WHERE a.from_user=? AND a.to_user=?',[from,to],c);
 if(mutual.length){const [r]=await c.query<ResultSetHeader>('INSERT INTO matches (user_a,user_b) VALUES (?,?)',[a,b]);return {matchId:r.insertId,created:true};}
 return {matchId:null,created:false};
 });
}
export async function matches(id:number){return rows(`SELECT m.id,m.created_at,u.id AS other_id,u.name,p.image,p.age,p.occupation,
 (SELECT body FROM messages WHERE match_id=m.id ORDER BY created_at DESC,id DESC LIMIT 1) AS last_message,
 (SELECT created_at FROM messages WHERE match_id=m.id ORDER BY created_at DESC,id DESC LIMIT 1) AS last_at
 FROM matches m JOIN users u ON u.id=IF(m.user_a=?,m.user_b,m.user_a) JOIN profiles p ON p.user_id=u.id
 WHERE m.user_a=? OR m.user_b=? ORDER BY COALESCE(last_at,m.created_at) DESC,m.id DESC`,[id,id,id]);}
export async function requireMatch(id:number,matchId:number,c:PoolConnection|typeof pool=pool,lock=false){const [m]=await rows(`SELECT * FROM matches WHERE id=? AND (user_a=? OR user_b=?)${lock?' FOR UPDATE':''}`,[matchId,id,id],c);if(!m)throw new AppError(404,'This conversation is no longer available.');return m;}
export async function messages(id:number,matchId:number){await requireMatch(id,matchId);return rows('SELECT id,sender_id,body,created_at FROM messages WHERE match_id=? ORDER BY created_at,id',[matchId]);}
export async function sendMessage(id:number,matchId:number,input:unknown){const {body}=z.object({body:z.string().trim().min(1).max(1000)}).parse(input);return transaction(async c=>{const m=await requireMatch(id,matchId,c,true);const [r]=await c.query<ResultSetHeader>('INSERT INTO messages (match_id,user_a,user_b,sender_id,body) VALUES (?,?,?,?,?)',[matchId,m.user_a,m.user_b,id,body]);return r.insertId;});}
export async function unmatch(id:number,matchId:number){return transaction(async c=>{const m=await requireMatch(id,matchId,c,true);
 await c.query('DELETE FROM likes WHERE (from_user=? AND to_user=?) OR (from_user=? AND to_user=?)',[m.user_a,m.user_b,m.user_b,m.user_a]);
 const [r]=await c.query<ResultSetHeader>('DELETE FROM matches WHERE id=?',[matchId]);return r.affectedRows;});}
export async function saved(id:number){return rows('SELECT u.id,u.name,p.*,s.created_at AS saved_at FROM saved_profiles s JOIN users u ON u.id=s.saved_user_id JOIN profiles p ON p.user_id=u.id WHERE s.user_id=? ORDER BY s.created_at DESC,u.id',[id]);}
export async function setSaved(id:number,to:number,enabled:boolean){if(id===to)throw new AppError(400,'You cannot save your own profile.');await userExists(to);const [r]=await pool.query<ResultSetHeader>(enabled?'INSERT INTO saved_profiles (user_id,saved_user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)':'DELETE FROM saved_profiles WHERE user_id=? AND saved_user_id=?',[id,to]);return r.affectedRows;}
export async function inspect(){
 const counts:Record<string,number>={};for(const table of ['users','profiles','preferences','preference_genders','interests','user_interests','likes','matches','messages','saved_profiles'])counts[table]=(await rows(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;
 return {counts,likes:await rows('SELECT * FROM likes WHERE from_user IN (1,2,3) OR to_user=1 ORDER BY created_at DESC,from_user LIMIT 12'),matches:await rows('SELECT * FROM matches ORDER BY id DESC LIMIT 8'),messages:await rows('SELECT * FROM messages ORDER BY id DESC LIMIT 8'),users:await rows('SELECT u.id,u.name,p.bio FROM users u JOIN profiles p ON p.user_id=u.id ORDER BY u.id DESC LIMIT 5')};
}
