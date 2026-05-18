const{execSync}=require('child_process');const fs=require('fs');const ENV='willswu-d1gttwhxle25af194';
const venues=JSON.parse(fs.readFileSync('scripts/venues-to-import.json','utf8'));
console.log('Starting import of',venues.length,'venues...');
let ok=0,fail=0;
for(let i=0;i<venues.length;i++){
const v=venues[i];
const inner=JSON.stringify({insert:'venues',documents:[v]});
const mgo=[{TableName:'venues',CommandType:'INSERT',Command:inner}];
fs.writeFileSync('scripts/_mgo.json',JSON.stringify(mgo),'utf8');
const cmdJson=fs.readFileSync('scripts/_mgo.json','utf8');
const escapedCmd=cmdJson.replace(/"/g,'\"');
const cmd='tcb db nosql execute -e '+ENV+' --command "'+escapedCmd+'" --json';
try{const r=execSync(cmd,{encoding:'utf-8',timeout:90000,maxBuffer:50*1024*1024});
if(r.includes('"ok"')){ok++;console.log('['+(i+1)+'] OK:',v.name);}
else{fail++;console.log('['+(i+1)+'] FAIL:',v.name);}}
catch(e){fail++;console.log('['+(i+1)+'] ERR:',v.name);}}
try{fs.unlinkSync('scripts/_mgo.json');}catch(e){}
console.log('Done:',ok,'ok,',fail,'fail');