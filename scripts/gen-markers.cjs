const fs = require('fs');
const path = require('path');

// 生成简单的 SVG 标记图标
const createMarkerSvg = (color, bgColor) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>
  <circle cx="18" cy="18" r="14" fill="${bgColor}" stroke="${color}" stroke-width="3" filter="url(#shadow)"/>
  <text x="18" y="23" text-anchor="middle" font-size="14">🎾</text>
</svg>`;

const imagesDir = path.join(__dirname, '..', 'miniprogram', 'images');

// 室内场馆标记 - 蓝色
const indoorSvg = createMarkerSvg('#2563eb', '#ffffff');
fs.writeFileSync(path.join(imagesDir, 'marker-indoor.svg'), indoorSvg);
console.log('Created marker-indoor.svg');

// 室外场馆标记 - 绿色
const outdoorSvg = createMarkerSvg('#16a34a', '#ffffff');
fs.writeFileSync(path.join(imagesDir, 'marker-outdoor.svg'), outdoorSvg);
console.log('Created marker-outdoor.svg');

console.log('\nNote: Please convert SVG to PNG for WeChat Mini Program compatibility.');
console.log('You can use online tools like: https://cloudconvert.com/svg-to-png');
