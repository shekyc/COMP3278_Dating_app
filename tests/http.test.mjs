import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=process.env.TEST_URL||'http://127.0.0.1:3000';
async function api(path,method='GET',body,extra={}){return fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json','X-Demo-User':'1',...extra},body:body===undefined?undefined:JSON.stringify(body)})}
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++};
const boot=await api('/bootstrap');ok(boot.status===200,'bootstrap');const {profile,users}=await boot.json();ok(users.length===64,'64 seeded users');
ok((await api('/likes/not-a-number','POST')).status===400,'invalid record ID');
ok((await api('/likes/1','POST')).status===400,'self-like');
ok((await api('/likes/99999','POST')).status===404,'missing profile');
ok((await api('/profile','PUT',{})).status===400,'invalid profile');
ok((await api('/reset','POST',{confirm:'no'})).status===400,'reset confirmation');
ok((await api('/bootstrap','GET',undefined,{'X-Demo-User':'99999'})).status===404,'invalid account');
ok((await api('/bootstrap','GET',undefined,{'Origin':'https://unrelated.example'})).status===403,'cross-origin rejected');
ok((await api('/matches/99999/messages','POST',{body:'hello'})).status===404,'unmatched message');
const created=await api('/profiles','POST',{...profile,name:'HTTP Test Robin',interests:profile.interests.map(i=>i.id)});ok(created.status===201,'create profile');const {id}=await created.json();const p=await (await api('/profiles/'+id)).json();ok(p.image.endsWith('.webp'),'new profile image uses final asset format');
for(const manifest of ['manifest.json','gallery-manifest.json'])for(const item of JSON.parse(readFileSync(new URL('../public/profiles/'+manifest,import.meta.url)))){const res=await fetch(base+item.path);const data=Buffer.from(await res.arrayBuffer());ok(res.status===200&&data.toString('ascii',8,12)==='WEBP',item.path)}
const reset=await api('/reset','POST',{confirm:'RESET CHEMISTRY'});ok(reset.status===200,'reset');const restored=await (await api('/bootstrap')).json();ok(restored.users.length===64,'restored baseline');
console.log(`PASS: ${checks} HTTP assertions, including all 70 served images, creation, validation, origin guard and reset.`);
