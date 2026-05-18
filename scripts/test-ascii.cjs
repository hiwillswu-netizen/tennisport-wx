/**
 * 导入数据 - 使用简化的 JSON 结构
 * 尝试只用 ASCII 字符先测试
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';

// 先测试一条简单的英文数据
const testVenue = {
  name: "Test Venue 1",
  address: "Test Address 123",
  district: "Test District",
  type: "indoor",
  lat: 30.25,
  lng: 120.15
};

console.log('Testing with ASCII-only data...');

const insertCmd = {
  insert: 'venues',
  documents: [testVenue]
};

const mgoCmd = [{
  TableName: 'venues',
  CommandType: 'INSERT',
  Command: JSON.stringify(insertCmd)
}];

const cmdJson = JSON.stringify(mgoCmd);

console.log('Command JSON:', cmdJson.substring(0, 200));

const result = spawnSync('tcb', [
  'db', 'nosql', 'execute',
  '-e', ENV,
  '--command', cmdJson,
  '--json'
], {
  encoding: 'utf-8',
  timeout: 60000,
  shell: false
});

console.log('stdout:', result.stdout?.substring(0, 500));
console.log('stderr:', result.stderr?.substring(0, 500));
