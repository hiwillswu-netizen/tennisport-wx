/**
 * 通过 CloudBase MCP 批量导入场馆数据
 * 使用方法：node scripts/import-via-mcp.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 读取 venues.jsonl 文件
const jsonlPath = path.join(__dirname, 'venues.jsonl');
const content = fs.readFileSync(jsonlPath, 'utf-8');
const lines = content.split('\n').filter(line => line.trim());

console.log(`准备导入 ${lines.length} 条场馆数据...`);

// 环境 ID
const envId = 'prod-9g1gfxh927c5114a';

// 逐条导入
let successCount = 0;
let failCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  try {
    const venue = JSON.parse(line);
    
    // 构建 mcporter 命令
    const dataJson = JSON.stringify(venue).replace(/"/g, '\\"');
    const cmd = `npx mcporter call cloudbase manageDatabase --EnvId "${envId}" --action "add" --collectionName "venues" --data "${dataJson}"`;
    
    console.log(`[${i + 1}/${lines.length}] 导入: ${venue.name}`);
    
    try {
      execSync(cmd, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000
      });
      successCount++;
      console.log(`  ✓ 成功`);
    } catch (execError) {
      console.log(`  ✗ 失败: ${execError.message}`);
      failCount++;
    }
    
  } catch (parseError) {
    console.log(`[${i + 1}] 解析 JSON 失败: ${parseError.message}`);
    failCount++;
  }
}

console.log(`\n导入完成！成功: ${successCount}, 失败: ${failCount}`);
