/**
 * 使用 UTF-8 编码重新导入场馆数据
 * 确保中文字符正确存储
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Total venues to import:', venues.length);

// 批量导入，每次 5 条
const batchSize = 5;
let totalOk = 0;
let totalFail = 0;

for (let i = 0; i < venues.length; i += batchSize) {
  const batch = venues.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  
  // 构造 MongoDB 插入命令
  const insertCmd = {
    insert: 'venues',
    documents: batch
  };
  
  // tcb 需要的命令格式
  const mgoCmd = [{
    TableName: 'venues',
    CommandType: 'INSERT',
    Command: JSON.stringify(insertCmd)
  }];
  
  // 写入临时文件，使用 UTF-8 编码
  const tmpFile = path.join(__dirname, `_batch_${batchNum}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(mgoCmd), 'utf8');
  
  try {
    // 使用 spawnSync 并设置环境变量确保 UTF-8
    const result = spawnSync('tcb', [
      'db', 'nosql', 'execute',
      '-e', ENV,
      '--commandFile', tmpFile,
      '--json'
    ], {
      encoding: 'utf-8',
      timeout: 120000,
      env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8' },
      shell: true
    });
    
    const output = result.stdout || '';
    
    if (output.includes('"n"') || output.includes('$numberInt')) {
      // 提取插入数量
      const match = output.match(/"n":\s*\{\s*"\$numberInt":\s*"(\d+)"/);
      const count = match ? parseInt(match[1]) : batch.length;
      totalOk += count;
      console.log(`[Batch ${batchNum}] OK: ${count} venues`);
    } else if (result.stderr) {
      totalFail += batch.length;
      console.log(`[Batch ${batchNum}] STDERR:`, result.stderr.substring(0, 100));
    } else {
      // 假设成功
      totalOk += batch.length;
      console.log(`[Batch ${batchNum}] OK (assumed): ${batch.length} venues`);
    }
  } catch (e) {
    totalFail += batch.length;
    console.log(`[Batch ${batchNum}] ERR:`, e.message.substring(0, 100));
  }
  
  // 清理临时文件
  try { fs.unlinkSync(tmpFile); } catch (e) {}
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
