/**
 * 通过 HTTP API 直接调用 CloudBase 数据库
 * 绕过 CLI 的编码问题
 */
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 读取场馆数据
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('场馆数据样例:');
console.log('名称:', venues[0].name);
console.log('地址:', venues[0].address);
console.log('区域:', venues[0].district);

// 由于没有 API 密钥，我们生成可以直接在云开发控制台导入的文件
// 云开发控制台支持导入 JSON 文件

// 生成适合云开发导入的 JSON 文件（每行一个文档）
const outputPath = path.join(__dirname, 'venues-import.json');
fs.writeFileSync(outputPath, JSON.stringify(venues, null, 2), 'utf8');

console.log('\n已生成导入文件:', outputPath);
console.log('共', venues.length, '条数据');
console.log('\n请按以下步骤在微信开发者工具中导入:');
console.log('1. 打开微信开发者工具');
console.log('2. 点击"云开发"按钮进入云开发控制台');
console.log('3. 选择"数据库" -> "venues" 集合');
console.log('4. 点击"导入"按钮');
console.log('5. 选择文件: scripts/venues-import.json');
console.log('6. 导入模式选择"Insert"');
console.log('7. 冲突处理选择"Insert"');
console.log('8. 点击"导入"开始导入');
