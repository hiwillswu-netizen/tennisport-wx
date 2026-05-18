const fs = require('fs');
const path = require('path');

// 创建最小有效的 PNG 文件
// 这是一个 36x36 的简单彩色圆形 PNG

// PNG 文件结构:
// PNG signature + IHDR chunk + IDAT chunk (compressed image data) + IEND chunk

function createPNG(r, g, b) {
    // PNG 签名
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // 简单起见，创建一个非常小的 24x24 的 PNG
    const width = 24;
    const height = 24;
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);   // width
    ihdrData.writeUInt32BE(height, 4);  // height
    ihdrData.writeUInt8(8, 8);          // bit depth
    ihdrData.writeUInt8(2, 9);          // color type (RGB)
    ihdrData.writeUInt8(0, 10);         // compression
    ihdrData.writeUInt8(0, 11);         // filter
    ihdrData.writeUInt8(0, 12);         // interlace
    
    const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
    const ihdr = Buffer.concat([
        Buffer.from([0, 0, 0, 13]),  // length
        Buffer.from('IHDR'),
        ihdrData,
        ihdrCrc
    ]);
    
    // 创建图像数据 - 简单的彩色圆形
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 10;
    
    let rawData = [];
    for (let y = 0; y < height; y++) {
        rawData.push(0); // filter byte
        for (let x = 0; x < width; x++) {
            const dx = x - centerX + 0.5;
            const dy = y - centerY + 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < radius - 1) {
                // 内部填充白色
                rawData.push(255, 255, 255);
            } else if (dist < radius) {
                // 边缘渐变
                rawData.push(r, g, b);
            } else if (dist < radius + 2) {
                // 边框
                rawData.push(r, g, b);
            } else {
                // 透明区域用白色代替 (因为我们用RGB模式)
                rawData.push(255, 255, 255);
            }
        }
    }
    
    // 使用 zlib 压缩
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(Buffer.from(rawData));
    
    const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
    const idatLength = Buffer.alloc(4);
    idatLength.writeUInt32BE(compressed.length, 0);
    
    const idat = Buffer.concat([
        idatLength,
        Buffer.from('IDAT'),
        compressed,
        idatCrc
    ]);
    
    // IEND chunk
    const iendCrc = crc32(Buffer.from('IEND'));
    const iend = Buffer.concat([
        Buffer.from([0, 0, 0, 0]),
        Buffer.from('IEND'),
        iendCrc
    ]);
    
    return Buffer.concat([signature, ihdr, idat, iend]);
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

const imagesDir = path.join(__dirname, '..', 'miniprogram', 'images');

// 室内标记 - 蓝色 #2563eb -> RGB(37, 99, 235)
const indoorPng = createPNG(37, 99, 235);
fs.writeFileSync(path.join(imagesDir, 'marker-indoor.png'), indoorPng);
console.log('Created marker-indoor.png (blue)');

// 室外标记 - 绿色 #16a34a -> RGB(22, 163, 74)
const outdoorPng = createPNG(22, 163, 74);
fs.writeFileSync(path.join(imagesDir, 'marker-outdoor.png'), outdoorPng);
console.log('Created marker-outdoor.png (green)');

console.log('\nMarker PNG icons created successfully!');
