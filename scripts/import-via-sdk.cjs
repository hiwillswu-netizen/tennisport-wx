/**
 * 使用 CloudBase Admin SDK 导入球馆数据
 * 运行: node scripts/import-via-sdk.cjs
 */

const tcb = require('@cloudbase/node-sdk');
const fs = require('fs');

// CloudBase 环境配置
const ENV_ID = 'willswu-d1gttwhxle25af194';

async function main() {
  // 初始化 CloudBase Admin SDK (使用 tcb CLI 的登录凭证)
  const app = tcb.init({
    env: ENV_ID
  });

  const db = app.database();
  const collection = db.collection('venues');

  // 读取待导入的数据
  const venues = JSON.parse(fs.readFileSync('scripts/venues-to-import.json', 'utf8'));
  
  console.log(`开始导入 ${venues.length} 条球馆数据...\n`);

  let successCount = 0;
  let failCount = 0;

  // 逐条导入
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i];
    try {
      const result = await collection.add(venue);
      console.log(`[${i + 1}/${venues.length}] 成功: ${venue.name} (ID: ${result.id})`);
      successCount++;
    } catch (error) {
      console.log(`[${i + 1}/${venues.length}] 失败: ${venue.name} - ${error.message}`);
      failCount++;
    }
  }

  console.log('\n=============================');
  console.log('导入完成!');
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${failCount} 条`);
  console.log('=============================');
}

main().catch(console.error);
