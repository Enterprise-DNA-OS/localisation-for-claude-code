#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table as textTable} from './lib/format.mjs';
import {page,table,writeOut} from './lib/render.mjs';

export const commands={
 help:[],projects:[],locales:['project'],strings:['project'],backlog:['project'],
 'review-queue':['project'],'release-readiness':['project'],overdue:[],attention:[],compliance:[],
 'weekly-review':[],activity:[],glossary:['project'],
 'add-project':['name','source','owner'],'add-locale':['project','locale'],
 'add-key':['project','name','text','description','max-length','risk'],
 'set-source':['key','text','evidence'],'set-translation':['key','locale','text'],
 approve:['key','locale','evidence'],'add-task':['key','name','owner','due'],
 'close-task':['task','resolution'],'review-project':['project','purpose','due','evidence'],
 'review-key':['key','evidence','due'],'add-term':['project','locale','source','target'],
 import:['project','source','dir','replace-source'],export:['out'],
 'release-bundle':['project','locale','out'],'draft-handoff':['project'],'draft-review':[]
};
const writes=new Set(['add-project','add-locale','add-key','set-source','set-translation','approve','add-task','close-task','review-project','review-key','add-term','import']);
const required=(v,k)=>{if(typeof v!=='string'||!v.trim())throw Error(`Required --${k}`);return v;};
function date(v){required(v,'due');if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('Invalid date, use YYYY-MM-DD');return v;}
function locale(v){required(v,'locale');if(!/^[A-Za-z]{2,3}([_-][A-Za-z0-9]{2,8})*$/.test(v))throw Error('Invalid locale');return v.replaceAll('_','-').toLowerCase();}
function integer(v){if(v===undefined)return null;if(!/^[1-9]\d*$/.test(v)||!Number.isSafeInteger(Number(v)))throw Error('Expected positive integer');return Number(v);}
export async function resolve(db,table,ref){
 required(ref,table);const rows=await db.query(`select * from ${table} where lower(name)=lower($1) or id::text like $2 order by name,id`,[ref,ref.toLowerCase()+'%']);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${table}:\n${rows.map(r=>r.id+' '+r.name).join('\n')}`:`No ${table} match: ${ref}`);return rows[0];
}
async function event(db,actor,action,details){await db.query('insert into events(actor,action,details) values($1,$2,$3)',[actor,action,JSON.stringify(details)]);}
async function insert(db,table,values){const keys=Object.keys(values);return (await db.query(`insert into ${table} (${keys.join(',')}) values (${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(values)))[0];}
async function update(db,table,id,values){const keys=Object.keys(values);return (await db.query(`update ${table} set ${keys.map((k,i)=>k+'=$'+(i+1)).join(',')} where id=$${keys.length+1} returning *`,[...Object.values(values),id]))[0];}
async function report(db,view,o={}){let clause='',params=[];if(o.project){params=[(await resolve(db,'projects',o.project)).id];clause=' where project_id=$1';}return db.query(`select * from ${view}${clause} order by 1,2,3`,params);}
async function translation(db,key,loc){const rows=await db.query('select * from translations where string_id=$1 and locale=$2',[key.id,loc]);return rows[0];}
async function putTranslation(db,key,loc,text,actor){
 const old=await translation(db,key,loc);
 const values={text,reviewed_version:null,reviewer:null,evidence:null,reviewed_at:null,editor:actor};
 return old?update(db,'translations',old.id,values):insert(db,'translations',{project_id:key.project_id,string_id:key.id,locale:loc,...values});
}
// Lokalise Expert CSV: headerless key,value,description?,comment?; one locale per file.
export function sourceRows(text){
 // Parse through the shared strict parser using numeric synthetic headers. Determine width with one RFC record.
 let quoted=false,cols=1;
 const clean=String(text).replace(/^\uFEFF/,'');
 for(let i=0;i<clean.length;i++){const c=clean[i];if(c==='"'){if(quoted&&clean[i+1]==='"'){i++;continue;}quoted=!quoted;}else if(!quoted&&(c==='\n'||c==='\r'))break;else if(!quoted&&c===',')cols++;}
 if(cols<2||cols>4)throw Error('Expected headerless CSV with 2 to 4 columns');
 const rows=parseCsv(Array.from({length:cols},(_,i)=>'c'+i).join(',')+'\n'+clean);
 const result=rows.map(r=>({key:required(r.c0,'CSV key'),text:r.c1,description:r.c2||'',comment:r.c3||''}));
 if(new Set(result.map(r=>r.key)).size!==result.length)throw Error('Duplicate key in language export');return result;
}
async function importFiles(db,o){
 const project=await resolve(db,'projects',o.project);const source=locale(o.source);
 if(source!==project.source_locale)throw Error('Source locale does not match project');
 const dir=path.resolve(required(o.dir,'dir'));const names=fs.readdirSync(dir).filter(n=>n.endsWith('.csv')).sort();
 if(!names.length)throw Error('No CSV files found');const bundles=names.map(name=>({locale:locale(name.slice(0,-4)),rows:sourceRows(fs.readFileSync(path.join(dir,name),'utf8'))}));
 if(new Set(bundles.map(b=>b.locale)).size!==bundles.length)throw Error('Duplicate locale files');
 const base=bundles.find(b=>b.locale===source);if(!base||!base.rows.length)throw Error('A nonempty source language file is required');
 const sourceNames=new Set(base.rows.map(r=>r.key));
 for(const b of bundles)for(const r of b.rows)if(!sourceNames.has(r.key))throw Error(`Target key missing from source export: ${r.key}`);
 const stats=[];
 for(const b of [base,...bundles.filter(b=>b!==base)]){
  let added=0,updated=0,unchanged=0;
  if(b!==base)await db.query('insert into locales(project_id,code) values($1,$2) on conflict do nothing',[project.id,b.locale]);
  for(const row of b.rows){
   const [old]=await db.query('select * from imports where project_id=$1 and locale=$2 and string_name=$3',[project.id,b.locale,row.key]);
   if(old&&JSON.stringify(old.source_row)===JSON.stringify(row)){unchanged++;continue;}
   // JSONB key order is not guaranteed.
   if(old&&(await db.query('select $1::jsonb=$2::jsonb same',[JSON.stringify(old.source_row),JSON.stringify(row)]))[0].same){unchanged++;continue;}
   if(old&&!o['replace-source'])throw Error(`Changed source ${b.locale}/${row.key}; use --replace-source --dry-run first`);
   let [key]=await db.query('select * from strings where project_id=$1 and name=$2',[project.id,row.key]);
   const beforeLocal={key:key||null,translation:key&&b!==base?await translation(db,key,b.locale):null};
   if(b===base){
    required(row.text,'source text');
    if(key&&!old)throw Error(`Existing local key ${row.key}; use a separate import project`);
    if(key){await update(db,'strings',key.id,{source_text:row.text,description:row.description,version:key.version+1,evidence:'',review_due:null});}
    else key=await insert(db,'strings',{project_id:project.id,name:row.key,source_text:row.text,description:row.description});
   }else{
    if(!key)throw Error(`Missing source key ${row.key}`);
    if(!old&&await translation(db,key,b.locale))throw Error(`Existing local translation ${row.key}/${b.locale}; reconcile it before import`);
    await putTranslation(db,key,b.locale,row.text,o.actor);
   }
   if(old){await update(db,'imports',old.id,{source_row:JSON.stringify(row)});updated++;}
   else{await insert(db,'imports',{project_id:project.id,locale:b.locale,string_name:row.key,source_row:JSON.stringify(row)});added++;}
   await event(db,o.actor,'import-row',{locale:b.locale,key:row.key,before:old?.source_row||null,before_local:beforeLocal,after:row});
  }
  stats.push({locale:b.locale,added,updated,unchanged});
 }
 return stats;
}

export async function execute(db,cmd,o={},pos=[]){
 if(!Object.hasOwn(commands,cmd))throw Error(`Unknown command ${cmd}. Use help`);
 const allowed=new Set([...commands[cmd],'json',...(writes.has(cmd)?['actor','dry-run']:[])]);
 for(const k of Object.keys(o))if(!allowed.has(k))throw Error(`Unknown --${k} for ${cmd}`);
 for(const k of ['json','dry-run','replace-source'])if(k in o&&o[k]!==true)throw Error(`--${k} is a boolean flag`);
 if(cmd==='import'){if(pos.length!==1||pos[0]!=='lokalise')throw Error('Use import lokalise');}
 else if(pos.length)throw Error('Unexpected positional argument');
 if(writes.has(cmd)){
  required(o.actor,'actor');await db.exec('BEGIN');
  try{
   // Serialize CLI mutations so review checks and the write use one stable database state.
   await db.exec('LOCK TABLE projects,locales,strings,translations,tasks,terms,imports,events IN EXCLUSIVE MODE');
   const before={};
   if(o.key){const k=await resolve(db,'strings',o.key);before.string=k;before.translations=await db.query('select * from translations where string_id=$1',[k.id]);}
   if(o.task)before.task=await resolve(db,'tasks',o.task);
   if(o.project)before.project=await resolve(db,'projects',o.project);
   const result=await mutate(db,cmd,o);
   await event(db,o.actor,cmd,{options:o,before,result});
   await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return o['dry-run']?{dry_run:true,result}:result;
  }catch(e){await db.exec('ROLLBACK');throw e;}
 }
 if(cmd==='help')return Object.entries(commands).map(([command,flags])=>({command,flags:flags.map(f=>'--'+f).join(' '),mutation:writes.has(command)}));
 const views={projects:'projects',locales:'locales',strings:'strings',backlog:'translation_status','review-queue':'translation_status','release-readiness':'release_readiness',overdue:'overdue_tasks',compliance:'compliance_findings',activity:'events',glossary:'terms'};
 if(views[cmd]){const rows=await report(db,views[cmd],o);return cmd==='backlog'?rows.filter(r=>r.state!=='ready'):cmd==='review-queue'?rows.filter(r=>r.state==='needs-review'):rows;}
 if(cmd==='attention')return {translations:await execute(db,'backlog'),tasks:await execute(db,'overdue'),evidence:await execute(db,'compliance')};
 if(cmd==='weekly-review')return {readiness:await execute(db,'release-readiness'),overdue:await execute(db,'overdue'),compliance:await execute(db,'compliance')};
 if(cmd==='export'){
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ');let records={};
  try{for(const t of ['projects','locales','strings','translations','tasks','terms','imports','events'])records[t]=await db.query(`select * from ${t} order by id`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  const archive={format:'localisation-archive-v1',created_at:new Date().toISOString(),records};
  if(o.out){const file=path.resolve(o.out);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(archive,null,2)+'\n',{flag:'wx'});return {file};}return archive;
 }
 if(cmd==='release-bundle'){
  const project=await resolve(db,'projects',o.project),loc=locale(o.locale);
  const rows=await db.query('select * from translation_status where project_id=$1 and locale=$2 order by key',[project.id,loc]);
  if(!rows.length||rows.some(r=>r.state!=='ready'))throw Error('Release blocked: every string must be ready; run release-readiness and backlog');
  const file=path.resolve(required(o.out,'out'));fs.mkdirSync(path.dirname(file),{recursive:true});
  // A local snapshot only. It never deploys or calls a provider.
  fs.writeFileSync(file,JSON.stringify(Object.fromEntries(rows.map(r=>[r.key,r.translation])),null,2)+'\n',{flag:'wx'});return {file,locale:loc,strings:rows.length};
 }
 if(cmd==='draft-review'||cmd==='draft-handoff'){
  const rows=await report(db,'translation_status',o);const title=cmd==='draft-review'?'Weekly localisation review':'Translator handoff';
  const file=writeOut('drafts',`${cmd}-${Date.now()}`,page({title,subtitle:'DRAFT. Human review required. Nothing sent.',sections:[{title:'Strings and decisions',html:table(rows,['project','key','locale','source_text','translation','state'])},{title:'Overdue follow-ups',html:table(await report(db,'overdue_tasks'))}]}));return {file};
 }
 throw Error('Unimplemented command');
}
async function mutate(db,cmd,o){
 if(cmd==='import')return importFiles(db,o);
 if(cmd==='add-project')return insert(db,'projects',{name:required(o.name,'name'),source_locale:locale(o.source),owner:required(o.owner,'owner')});
 if(cmd==='add-locale'){
  const p=await resolve(db,'projects',o.project),loc=locale(o.locale);if(loc===p.source_locale)throw Error('Target locale must differ from source');
  return insert(db,'locales',{project_id:p.id,code:loc});
 }
 if(cmd==='add-key'){
  const p=await resolve(db,'projects',o.project);return insert(db,'strings',{project_id:p.id,name:required(o.name,'name'),source_text:required(o.text,'text'),description:o.description||'',max_length:integer(o['max-length']),risk:o.risk||'standard'});
 }
 if(cmd==='review-project'){
  const p=await resolve(db,'projects',o.project);required(o.evidence,'evidence');return update(db,'projects',p.id,{retention_purpose:required(o.purpose,'purpose'),review_due:date(o.due)});
 }
 if(cmd==='close-task'){const t=await resolve(db,'tasks',o.task);if(t.status!=='open')throw Error('Task already closed');return update(db,'tasks',t.id,{status:'done',resolution:required(o.resolution,'resolution')});}
 if(cmd==='add-term'){
  const p=await resolve(db,'projects',o.project);return insert(db,'terms',{project_id:p.id,locale:locale(o.locale),source_term:required(o.source,'source'),target_term:required(o.target,'target')});
 }
 const key=await resolve(db,'strings',o.key);
 if(cmd==='set-source'){required(o.evidence,'evidence');return update(db,'strings',key.id,{source_text:required(o.text,'text'),version:key.version+1,evidence:'',review_due:null});}
 if(cmd==='set-translation'){const loc=locale(o.locale);if(typeof o.text!=='string')throw Error('Required --text (empty clears translation)');return putTranslation(db,key,loc,o.text,o.actor);}
 if(cmd==='review-key')return update(db,'strings',key.id,{evidence:required(o.evidence,'evidence'),review_due:date(o.due)});
 if(cmd==='add-task')return insert(db,'tasks',{string_id:key.id,name:required(o.name,'name'),owner:required(o.owner,'owner'),due:date(o.due)});
 if(cmd==='approve'){
  const loc=locale(o.locale),t=await translation(db,key,loc);if(!t)throw Error('No translation');
  const [status]=await db.query('select state from translation_status where string_id=$1 and locale=$2',[key.id,loc]);
  if(!['needs-review','ready'].includes(status.state))throw Error(`Cannot approve: ${status.state}`);
  if(t.editor.toLowerCase()===o.actor.toLowerCase())throw Error('Reviewer must differ from last editor');
  return update(db,'translations',t.id,{reviewed_version:key.version,reviewer:o.actor,evidence:required(o.evidence,'evidence'),reviewed_at:new Date().toISOString()});
 }
 throw Error('Unimplemented mutation');
}
function parse(args){const o={},pos=[];for(const arg of args){if(arg.startsWith('--')){const at=arg.indexOf('='),k=arg.slice(2,at<0?undefined:at);if(Object.hasOwn(o,k))throw Error(`Duplicate --${k}`);o[k]=at<0?true:arg.slice(at+1);}else pos.push(arg);}return {o,pos};}
export function display(value){
 if(Array.isArray(value)){if(!value.length)return '(none)';const cols=Object.keys(value[0]).filter(k=>!['project_id','string_id','created_at','updated_at','id','source_row','details'].includes(k));return textTable(value,cols.map(key=>({key,label:key,width:65})));}
 if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>`${k}\n${typeof v==='object'?display(v):v}`).join('\n\n');return String(value);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{const [cmd='help',...rest]=process.argv.slice(2);const {o,pos}=parse(rest);db=await getDb();const result=await execute(db,cmd,o,pos);console.log(o.json?JSON.stringify(result,null,2):display(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}}
