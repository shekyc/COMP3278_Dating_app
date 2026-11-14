import 'dotenv/config';
import mysql, {type PoolConnection} from 'mysql2/promise';
export const dbConfig={host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'chemistry',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'chemistry',dateStrings:true,decimalNumbers:true,charset:'utf8mb4'};
export const pool=mysql.createPool({...dbConfig,connectionLimit:8});
export async function transaction<T>(fn:(c:PoolConnection)=>Promise<T>):Promise<T>{const c=await pool.getConnection();try{await c.beginTransaction();const result=await fn(c);await c.commit();return result;}catch(e){await c.rollback();throw e;}finally{c.release();}}
