/**
 * 批量导入场馆数据 - 使用 mcporter
 * 逐条导入以确保稳定性
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取数据
const jsonPath = path.join(__dirname, 'venues-to-import.json');
const venues = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 跳过第一条（已经导入）
const toImport = venues.slice(1);

console.log(`准备导入 ${toImport.length} 条场馆数据...\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < toImport.length; i++) {
  const venue = toImport[i];
  const docJson = JSON.stringify([venue]);
  
  // 转义双引号
  const escaped = docJson.replace(/"/g, '\\"');
  
  console.log(`[${i + 1}/${toImport.length}] ${venue.name}`);
  
  try {
    const cmd = `npx mcporter call cloudbase writeNoSqlDatabaseContent --action "insert" --collectionName "venues" --documents "${escaped}"`;
    
    execSync(cmd, {
      encoding: 'utf-8',
      timeout: 30000,
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`  ✓ 成功`);
    successCount++;
    
  } catch (error) {
    console.log(`  ✗ 失败`);
    failCount++;
  }
}

console.log(`\n导入完成！成功: ${successCount}, 失败: ${failCount}`);
console.log(`总计: ${successCount + 1} 条（含之前已导入的 1 条）`);
