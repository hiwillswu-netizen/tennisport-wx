/**
 * 使用 mcporter 逐条插入，生成 PowerShell 命令
 * 运行: node scripts/gen-ps-import.cjs > scripts/run-import.ps1
 */

const fs = require('fs');

// 读取 JSON 数据
const venues = JSON.parse(fs.readFileSync('scripts/venues-to-import.json', 'utf8'));

console.log('# PowerShell 导入脚本');
console.log('# 运行: powershell -ExecutionPolicy Bypass -File scripts/run-import.ps1');
console.log('');
console.log('$success = 0');
console.log('$fail = 0');
console.log('');

venues.forEach((venue, idx) => {
  // 转义 JSON 用于 PowerShell
  const jsonStr = JSON.stringify([venue]).replace(/"/g, '\\"').replace(/`/g, '``');
  
  console.log(`Write-Host "[${idx + 1}/${venues.length}] 导入: ${venue.name}"`);
  console.log(`$result = npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "${jsonStr}" 2>&1`);
  console.log(`if ($result -match '"success": true') { $success++ } else { $fail++; Write-Host "失败: $result" }`);
  console.log('');
});

console.log('Write-Host ""');
console.log('Write-Host "==============================="');
console.log('Write-Host "成功: $success 条"');
console.log('Write-Host "失败: $fail 条"');
console.log('Write-Host "==============================="');
