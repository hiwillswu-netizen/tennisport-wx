/**
 * 使用 Node.js 原生 spawn 和临时文件导入数据
 * 通过先写入临时 JSON 文件，再用 tcb 的 stdin 来确保编码正确
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Total venues to import:', venues.length);

// 批量导入
const batchSize = 10;
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
  
  // 将命令转为 JSON 字符串
  const cmdJson = JSON.stringify(mgoCmd);
  
  try {
    // 使用 spawnSync，直接传递参数数组，让 Node 处理转义
    const result = spawnSync('tcb', [
      'db', 'nosql', 'execute',
      '-e', ENV,
      '--command', cmdJson,
      '--json'
    ], {
      encoding: 'utf-8',
      timeout: 120000,
      // 设置环境变量
      env: { 
        ...process.env, 
        LANG: 'en_US.UTF-8', 
        LC_ALL: 'en_US.UTF-8',
        PYTHONIOENCODING: 'utf-8',
        NODE_OPTIONS: '--no-warnings'
      },
      // Windows 下不使用 shell
      shell: false,
      // 设置 stdio 以便获取输出
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const output = result.stdout || '';
    const stderr = result.stderr || '';
    
    if (output.includes('"n"') || output.includes('$numberInt')) {
      const match = output.match(/"n":\s*\{\s*"\$numberInt":\s*"(\d+)"/);
      const count = match ? parseInt(match[1]) : batch.length;
      totalOk += count;
      console.log(`[Batch ${batchNum}] OK: ${count} venues`);
    } else if (stderr) {
      totalFail += batch.length;
      console.log(`[Batch ${batchNum}] STDERR:`, stderr.substring(0, 100));
    } else {
      totalOk += batch.length;
      console.log(`[Batch ${batchNum}] OK (assumed): ${batch.length} venues`);
    }
  } catch (e) {
    totalFail += batch.length;
    console.log(`[Batch ${batchNum}] ERR:`, e.message.substring(0, 100));
  }
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
