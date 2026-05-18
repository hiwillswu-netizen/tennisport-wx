/**
 * 通过生成单独 JSON 文件逐条导入球馆数据
 * 运行: node scripts/import-single.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取待导入的数据
const venues = JSON.parse(fs.readFileSync('scripts/venues-to-import.json', 'utf8'));

console.log(`开始导入 ${venues.length} 条球馆数据...\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < venues.length; i++) {
  const venue = venues[i];
  
  // 简化数据，只保留核心字段
  const simpleVenue = {
    name: venue.name,
    address: venue.address,
    district: venue.district,
    type: venue.type,
    courtType: venue.courtType,
    courtsCount: venue.courtsCount,
    priceWeekday: venue.priceWeekday,
    priceWeekend: venue.priceWeekend,
    priceEvening: venue.priceEvening,
    phone: venue.phone,
    hours: venue.hours,
    bookingUrl: venue.bookingUrl || "",
    bookingMiniProgram: venue.bookingMiniProgram || "",
    bookingAppId: venue.bookingAppId || "",
    bookingPagePath: venue.bookingPagePath || "",
    bookingUrlLink: venue.bookingUrlLink || "",
    tags: venue.tags,
    source: venue.source,
    lat: venue.lat,
    lng: venue.lng,
    createdAt: venue.createdAt,
    updatedAt: venue.updatedAt
  };
  
  // 生成 JSON 字符串，需要处理好转义
  // Windows 下命令行传递 JSON 非常麻烦，改用简化的纯 ASCII 方式
  const jsonBase64 = Buffer.from(JSON.stringify([simpleVenue])).toString('base64');
  
  // 将 JSON 写入临时文件
  const tempJsonFile = path.join(__dirname, '_tmp_import.json');
  fs.writeFileSync(tempJsonFile, JSON.stringify([simpleVenue], null, 0));
  
  try {
    // 使用 type 命令读取文件内容传递给 mcporter
    // 但 mcporter 不支持 stdin，所以用 PowerShell
    const cmd = `powershell -Command "$json = Get-Content -Raw '${tempJsonFile.replace(/\\/g, '\\\\')}'; npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents $json"`;
    
    const result = execSync(cmd, { 
      encoding: 'utf-8',
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    if (result.includes('"success": true') || result.includes('"success":true')) {
      console.log(`[${i + 1}/${venues.length}] 成功: ${venue.name}`);
      successCount++;
    } else {
      console.log(`[${i + 1}/${venues.length}] 失败: ${venue.name}`);
      console.log('输出:', result.substring(0, 300));
      failCount++;
    }
  } catch (error) {
    console.log(`[${i + 1}/${venues.length}] 错误: ${venue.name} - ${error.message.substring(0, 200)}`);
    failCount++;
  }
}

// 清理临时文件
try { fs.unlinkSync(path.join(__dirname, '_tmp_import.json')); } catch(e) {}

console.log('\n=============================');
console.log('导入完成!');
console.log(`成功: ${successCount} 条`);
console.log(`失败: ${failCount} 条`);
console.log('=============================');
