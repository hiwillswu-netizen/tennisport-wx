/**
 * 批量导入场馆数据到 CloudBase NoSQL
 * 使用 mcporter 调用 writeNoSqlDatabaseContent
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取数据
const jsonPath = path.join(__dirname, 'venues-to-import.json');
const venues = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`准备导入 ${venues.length} 条场馆数据...\n`);

// 分批导入，每批 10 条
const BATCH_SIZE = 10;
let successCount = 0;
let failCount = 0;

for (let i = 0; i < venues.length; i += BATCH_SIZE) {
  const batch = venues.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(venues.length / BATCH_SIZE);
  
  console.log(`[批次 ${batchNum}/${totalBatches}] 导入 ${batch.length} 条记录...`);
  
  // 将文档数组转为 JSON 字符串
  const documentsJson = JSON.stringify(batch);
  
  // 写入临时文件避免命令行转义问题
  const tempFile = path.join(__dirname, `temp-batch-${batchNum}.json`);
  fs.writeFileSync(tempFile, documentsJson, 'utf-8');
  
  try {
    // 使用 PowerShell 读取文件内容并调用
    const cmd = `powershell -Command "$docs = Get-Content -Path '${tempFile}' -Raw -Encoding UTF8; npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents $docs"`;
    
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    console.log(`  ✓ 成功`);
    successCount += batch.length;
    
  } catch (error) {
    console.log(`  ✗ 失败: ${error.message}`);
    failCount += batch.length;
  }
  
  // 删除临时文件
  try {
    fs.unlinkSync(tempFile);
  } catch (e) {}
}

console.log(`\n导入完成！成功: ${successCount}, 失败: ${failCount}`);
