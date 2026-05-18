/**
 * 修复数据库中的中文编码问题
 * 通过 MCP 工具重新写入正确编码的数据
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV = 'willswu-d1gttwhxle25af194';
const venues = JSON.parse(fs.readFileSync(path.join(__dirname, 'venues-to-import.json'), 'utf8'));

console.log('Total venues to fix:', venues.length);

// 先清空集合，再重新导入
async function main() {
  // 使用 mcporter 调用 CloudBase MCP 来操作
  // 这样可以确保 JSON 是正确编码的
  
  // 生成每个 venue 的单独导入命令
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i];
    const venueJson = JSON.stringify(venue);
    
    // 写入临时文件（UTF-8 with BOM 确保 Windows 正确识别）
    const tmpFile = path.join(__dirname, `_venue_${i}.json`);
    fs.writeFileSync(tmpFile, '\ufeff' + venueJson, 'utf8');
    
    console.log(`[${i + 1}/${venues.length}] ${venue.name}`);
    
    // 清理临时文件
    try { fs.unlinkSync(tmpFile); } catch (e) {}
  }
}

main();
