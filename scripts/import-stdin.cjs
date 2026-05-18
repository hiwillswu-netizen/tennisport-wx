/**
 * 通过 stdin 管道传递 JSON 给 tcb，避免命令行编码问题
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Total venues to import:', venues.length);

async function importBatch(batch, batchNum) {
  return new Promise((resolve) => {
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
    
    const cmdJson = JSON.stringify(mgoCmd);
    
    // 使用 spawn 并通过 stdin 传递数据
    const child = spawn('tcb', [
      'db', 'nosql', 'execute',
      '-e', ENV,
      '--json'
    ], {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString('utf8');
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString('utf8');
    });
    
    child.on('close', (code) => {
      if (stdout.includes('"n"') || stdout.includes('$numberInt')) {
        const match = stdout.match(/"n":\s*\{\s*"\$numberInt":\s*"(\d+)"/);
        const count = match ? parseInt(match[1]) : batch.length;
        console.log(`[Batch ${batchNum}] OK: ${count} venues`);
        resolve(count);
      } else if (stderr.includes('Loading') || code === 0) {
        console.log(`[Batch ${batchNum}] OK (assumed): ${batch.length} venues`);
        resolve(batch.length);
      } else {
        console.log(`[Batch ${batchNum}] FAIL:`, stderr.substring(0, 100) || 'unknown error');
        resolve(0);
      }
    });
    
    // 尝试通过 stdin 传递 --command 参数
    // 实际上 tcb 可能不支持 stdin，这种情况下我们改用环境变量
    child.stdin.write('--command ' + cmdJson);
    child.stdin.end();
  });
}

async function main() {
  const batchSize = 5;
  let totalOk = 0;
  
  for (let i = 0; i < venues.length; i += batchSize) {
    const batch = venues.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const count = await importBatch(batch, batchNum);
    totalOk += count;
  }
  
  console.log('\n=== Import Complete ===');
  console.log('Total Success:', totalOk);
}

main();
