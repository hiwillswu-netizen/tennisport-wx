/**
 * 使用 mcporter 逐条插入球馆数据
 * 运行: node scripts/import-one-by-one.cjs
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

// 读取生成的 JSON 数据
const venues = JSON.parse(fs.readFileSync('scripts/venues-to-import.json', 'utf8'));

console.log(`开始导入 ${venues.length} 条球馆数据...\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < venues.length; i++) {
  const venue = venues[i];
  
  // 将单个文档写入临时文件
  const tempFile = 'scripts/_temp_venue.json';
  fs.writeFileSync(tempFile, JSON.stringify([venue]));
  
  try {
    // 读取文件内容作为 documents 参数
    const docsContent = fs.readFileSync(tempFile, 'utf8');
    
    // 使用 spawnSync 避免命令行转义问题
    const result = spawnSync('npx', [
      'mcporter', 'call', 'cloudbase', 'writeNoSqlDatabaseContent',
      '--action', 'insert',
      '--collectionName', 'venues',
      '--documents', docsContent
    ], {
      encoding: 'utf-8',
      timeout: 60000,
      shell: true,
      cwd: process.cwd()
    });
    
    const output = result.stdout + result.stderr;
    
    if (output.includes('"success": true') || output.includes('"success":true')) {
      console.log(`[${i + 1}/${venues.length}] 成功: ${venue.name}`);
      successCount++;
    } else {
      console.log(`[${i + 1}/${venues.length}] 失败: ${venue.name}`);
      // console.log('输出:', output.substring(0, 500));
      failCount++;
    }
  } catch (error) {
    console.log(`[${i + 1}/${venues.length}] 错误: ${venue.name} - ${error.message}`);
    failCount++;
  }
}

// 清理临时文件
try { fs.unlinkSync('scripts/_temp_venue.json'); } catch(e) {}

console.log('\n=============================');
console.log('导入完成!');
console.log(`成功: ${successCount} 条`);
console.log(`失败: ${failCount} 条`);
console.log('=============================');
