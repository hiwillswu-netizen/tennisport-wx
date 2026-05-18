/**
 * 使用 CloudBase Node.js SDK 直接导入数据
 * 这样可以确保编码正确
 */
const cloudbase = require('@cloudbase/node-sdk');
const fs = require('fs');
const path = require('path');

const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Total venues to import:', venues.length);

async function main() {
  // 初始化 CloudBase
  const app = cloudbase.init({
    env: 'willswu-d1gttwhxle25af194'
    // 注意：在本地运行需要配置 secretId/secretKey
    // 或者使用环境变量 TENCENTCLOUD_SECRETID 和 TENCENTCLOUD_SECRETKEY
  });
  
  const db = app.database();
  const collection = db.collection('venues');
  
  // 批量导入
  const batchSize = 20; // SDK 支持单次最多 20 条
  let totalOk = 0;
  let totalFail = 0;
  
  for (let i = 0; i < venues.length; i += batchSize) {
    const batch = venues.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    try {
      const result = await collection.add(batch);
      
      if (result.ids && result.ids.length > 0) {
        totalOk += result.ids.length;
        console.log(`[Batch ${batchNum}] OK: ${result.ids.length} venues`);
      } else {
        totalFail += batch.length;
        console.log(`[Batch ${batchNum}] FAIL: no ids returned`);
      }
    } catch (e) {
      totalFail += batch.length;
      console.log(`[Batch ${batchNum}] ERR:`, e.message);
    }
  }
  
  console.log('\n=== Import Complete ===');
  console.log('Success:', totalOk);
  console.log('Failed:', totalFail);
}

main().catch(console.error);
