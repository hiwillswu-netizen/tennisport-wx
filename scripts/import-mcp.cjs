const{execSync}=require('child_process');const fs=require('fs');
const venues=JSON.parse(fs.readFileSync('scripts/venues-to-import.json','utf8'));
console.log('Starting import of',venues.length,'venues using mcporter...');
let ok=0,fail=0;
for(let i=0;i<venues.length;i++){
const v=venues[i];
const docJson=JSON.stringify(v);
const escaped=docJson.replace(/"/g,'\\"');
const cmd='npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "['+escaped+']"';
try{
const r=execSync(cmd,{encoding:'utf-8',timeout:60000,maxBuffer:50*1024*1024});
if(r.includes('success')){ok++;console.log('['+(i+1)+'] OK:',v.name);}
else{fail++;console.log('['+(i+1)+'] FAIL:',v.name);}}
catch(e){fail++;console.log('['+(i+1)+'] ERR:',v.name,e.message.substring(0,100));}}
console.log('\\nDone:',ok,'ok,',fail,'fail');