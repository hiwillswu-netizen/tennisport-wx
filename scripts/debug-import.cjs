/**
 * 调试版本 - 查看具体错误
 */

const { spawnSync } = require('child_process');
const fs = require('fs');

// 读取第一条数据
const venues = JSON.parse(fs.readFileSync('scripts/venues-to-import.json', 'utf8'));
const venue = venues[0];

console.log('测试导入:', venue.name);
console.log('');

// 准备文档数据
const docs = JSON.stringify([venue]);

const result = spawnSync('npx', [
  'mcporter', 'call', 'cloudbase', 'writeNoSqlDatabaseContent',
  '--action', 'insert',
  '--collectionName', 'venues',
  '--documents', docs
], {
  encoding: 'utf-8',
  timeout: 60000,
  shell: true,
  cwd: process.cwd()
});

console.log('=== STDOUT ===');
console.log(result.stdout);
console.log('');
console.log('=== STDERR ===');
console.log(result.stderr);
