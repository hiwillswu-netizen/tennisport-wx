const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * 创建一个简单的带透明度的 PNG 图标
 * 使用 RGBA 颜色类型
 */
function createCirclePNG(borderR, borderG, borderB, size = 32) {
    // PNG signature
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    const width = size;
    const height = size;
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8);    // bit depth
    ihdrData.writeUInt8(6, 9);    // color type (RGBA)
    ihdrData.writeUInt8(0, 10);   // compression
    ihdrData.writeUInt8(0, 11);   // filter
    ihdrData.writeUInt8(0, 12);   // interlace
    
    const ihdr = createChunk('IHDR', ihdrData);
    
    // 创建图像数据 - 带阴影的彩色圆形
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = size / 2 - 2;
    const innerRadius = outerRadius - 3;
    
    let rawData = [];
    for (let y = 0; y < height; y++) {
        rawData.push(0); // filter byte for each row
        for (let x = 0; x < width; x++) {
            const dx = x - centerX + 0.5;
            const dy = y - centerY + 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= innerRadius) {
                // 内部 - 白色填充
                rawData.push(255, 255, 255, 255);
            } else if (dist <= outerRadius) {
                // 边框 - 彩色
                rawData.push(borderR, borderG, borderB, 255);
            } else if (dist <= outerRadius + 1.5) {
                // 边缘抗锯齿
                const alpha = Math.max(0, Math.round(255 * (1 - (dist - outerRadius) / 1.5)));
                rawData.push(borderR, borderG, borderB, alpha);
            } else {
                // 透明
                rawData.push(0, 0, 0, 0);
            }
        }
    }
    
    // 压缩图像数据
    const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
    const idat = createChunk('IDAT', compressed);
    
    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcData);
    
    return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 计算
function crc32(data) {
    let crc = 0xFFFFFFFF;
    const table = makeCrcTable();
    
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
    }
    
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(crc, 0);
    return buf;
}

function makeCrcTable() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
    }
    return table;
}

// 生成图标
const imagesDir = path.join(__dirname, '..', 'miniprogram', 'images');

// 室内标记 - 蓝色边框 #2563eb (37, 99, 235)
const indoorPng = createCirclePNG(37, 99, 235, 32);
fs.writeFileSync(path.join(imagesDir, 'marker-indoor.png'), indoorPng);
console.log(`Created marker-indoor.png (${indoorPng.length} bytes)`);

// 室外标记 - 绿色边框 #16a34a (22, 163, 74)  
const outdoorPng = createCirclePNG(22, 163, 74, 32);
fs.writeFileSync(path.join(imagesDir, 'marker-outdoor.png'), outdoorPng);
console.log(`Created marker-outdoor.png (${outdoorPng.length} bytes)`);

console.log('\nMarker icons created successfully!');
console.log('Icons are 32x32 circles with colored borders and white fill.');
