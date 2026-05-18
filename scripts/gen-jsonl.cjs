// 将 JSON 数据转换为 CloudBase 导入格式 (每行一个 JSON)
const fs = require('fs');
const path = require('path');

const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

// 输出为 JSON Lines 格式 (每行一个JSON对象)
const lines = venues.map(v => JSON.stringify(v)).join('\n');
fs.writeFileSync(path.join(__dirname, 'venues.jsonl'), lines, 'utf8');

console.log('Generated venues.jsonl with', venues.length, 'records');
console.log('\nTo import via CloudBase Console:');
console.log('1. Open https://tcb.cloud.tencent.com/dev?envId=willswu-d1gttwhxle25af194#/db/doc/collection/venues');
console.log('2. Click "导入" button');
console.log('3. Select the file: scripts/venues.jsonl');
console.log('\nOr import via CLI (one by one):');
