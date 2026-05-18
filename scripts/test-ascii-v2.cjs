/**
 * 导入数据 - 使用简化的 JSON 结构
 */
const { spawnSync } = require('child_process');

const ENV = 'willswu-d1gttwhxle25af194';

// 测试一条简单的英文数据
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

const result = spawnSync('tcb', [
  'db', 'nosql', 'execute',
  '-e', ENV,
  '--command', cmdJson,
  '--json'
], {
  encoding: 'utf-8',
  timeout: 60000,
  shell: false,
  stdio: ['inherit', 'pipe', 'pipe']
});

console.log('Status:', result.status);
console.log('Signal:', result.signal);
console.log('Error:', result.error);
console.log('stdout:', result.stdout);
console.log('stderr:', result.stderr);
