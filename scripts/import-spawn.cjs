/**
 * 通过 Node.js 子进程导入球馆数据
 * 使用 spawn 避免命令行长度和转义问题
 * 运行: node scripts/import-spawn.cjs
 */

const { spawn } = require('child_process');
const fs = require('fs');

// 读取待导入的数据
const venues = JSON.parse(fs.readFileSync('scripts/venues-to-import.json', 'utf8'));

console.log(`开始导入 ${venues.length} 条球馆数据...\n`);

let successCount = 0;
let failCount = 0;
let currentIndex = 0;

function importNext() {
  if (currentIndex >= venues.length) {
    console.log('\n=============================');
    console.log('导入完成!');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${failCount} 条`);
    console.log('=============================');
    return;
  }

  const venue = venues[currentIndex];
  const idx = currentIndex + 1;
  
  // 准备 JSON 字符串
  const docsJson = JSON.stringify([venue]);
  
  // 使用 PowerShell 来处理复杂 JSON
  const ps = spawn('powershell', [
    '-Command',
    `$docs = '${docsJson.replace(/'/g, "''")}'; npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents $docs`
  ], {
    shell: false,
    timeout: 60000
  });

  let output = '';
  
  ps.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  ps.stderr.on('data', (data) => {
    output += data.toString();
  });
  
  ps.on('close', (code) => {
    if (output.includes('"success": true') || output.includes('"success":true')) {
      console.log(`[${idx}/${venues.length}] 成功: ${venue.name}`);
      successCount++;
    } else {
      console.log(`[${idx}/${venues.length}] 失败: ${venue.name}`);
      // 显示简短错误信息
      const errMatch = output.match(/message":\s*"([^"]+)"/);
      if (errMatch) console.log('  原因:', errMatch[1]);
      failCount++;
    }
    
    currentIndex++;
    // 继续下一条
    setTimeout(importNext, 100);
  });
  
  ps.on('error', (err) => {
    console.log(`[${idx}/${venues.length}] 错误: ${venue.name} - ${err.message}`);
    failCount++;
    currentIndex++;
    setTimeout(importNext, 100);
  });
}

// 开始导入
importNext();
