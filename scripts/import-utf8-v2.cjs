/**
 * 使用 UTF-8 编码重新导入场馆数据
 * 通过写入临时文件并使用 PowerShell 读取来确保编码正确
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Total venues to import:', venues.length);

// 单条导入，确保编码正确
let totalOk = 0;
let totalFail = 0;

for (let i = 0; i < venues.length; i++) {
  const venue = venues[i];
  
  // 构造 MongoDB 插入命令
  const insertCmd = {
    insert: 'venues',
    documents: [venue]
  };
  
  // tcb 需要的命令格式
  const mgoCmd = [{
    TableName: 'venues',
    CommandType: 'INSERT',
    Command: JSON.stringify(insertCmd)
  }];
  
  // 将命令转为 JSON 字符串，并转义给 shell
  const cmdJson = JSON.stringify(JSON.stringify(mgoCmd));
  
  try {
    // 使用 PowerShell 来执行，因为它对 UTF-8 支持更好
    const psCmd = `powershell -Command "& { $env:LANG='en_US.UTF-8'; tcb db nosql execute -e ${ENV} --command ${cmdJson} --json }"`;
    
    const result = execSync(psCmd, { 
      encoding: 'utf-8', 
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    if (result.includes('"n"') || result.includes('$numberInt')) {
      totalOk++;
      console.log(`[${i + 1}/${venues.length}] OK: ${venue.name}`);
    } else {
      totalFail++;
      console.log(`[${i + 1}/${venues.length}] FAIL: ${venue.name}`);
    }
  } catch (e) {
    totalFail++;
    console.log(`[${i + 1}/${venues.length}] ERR: ${venue.name} - ${e.message.substring(0, 50)}`);
  }
}

console.log('\n=== Import Complete ===');
console.log('Success:', totalOk);
console.log('Failed:', totalFail);
