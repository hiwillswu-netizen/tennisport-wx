const fs = require('fs');
const path = require('path');

// 36x36 的简单 PNG 图标 (base64)
// 绿色圆形标记 (室外)
const outdoorBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9ElEQVRYhe2YvU7DMBSFv9J2YGBgYGBgYGBgYGBgYGBgYGBgYOAFGBhYGBgYGBgYGBgYGHgBBgYWBgYGBobwU9SKJL5x7DiVXMlS5cT3+Nz4+t4E+EcIrxuANtAG2sAa0ALqwBJwDdwDT8AH8Al8lxHwJgitA51V4NwAngzgqRn4MAueqwN8LuC5DrwsgMeagbeK8BgPfJwLj/HAo0V4LAQfZYHPWOCxEHxRAx7zwnMd8EIb3qvA4zx4OgwfFoOPE+DJMHyZBU8l4asE8EQO+CoOns6Gp5PgiSR4OgZPJcOTAXg6D95LhifD8FwHXg3Ac1nwdBCeToCnYuD5OHg2Gz7Phqfy4PlceD4Xns+F5wvgpRh4oQYe9cJLxfB4BF5qwQtReK0DL4fhC3nwagC+EIIv5MCLSfByDryUB68E4KUYeDUGXorC6yF4LQGej8AXs+DVAA==';

// 蓝色圆形标记 (室内)
const indoorBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9ElEQVRYhe2YPU7EMBCFv2wWCoqKioqKioqKioqKioqKioqKihdgobKgoKKioqKioqLiBSgoLCgoKCgo2EOiJP54sR0nK7GSpdWufZ/nvYyd2QT+ECLTA2gCTaABNIA60AGWgGvgDngGvoAf4LcIgT9CaA1orALnBnBrAM/MwIcZcF0F4I0B3FeB5/rw3A58kgPPtuCxLvhoDV5rwo8z4cMa8FEe/DgTHmuDD1vwXAt8lgMfFeGJIvisDB4vg4dy4LNl+G4IPhqCT8vgyRB8nAMfpMBnQ/DJEH4Ugy8T4fMQfBKFz2Lw6Th8loSfR+HjGHySDJ8E4NM8+CgJnwzBZ0XwZQA+zYJPg/B5AjwVA89lwedB+DwBnorC5zH4PAueC8LnCfBEFDyPw2dZ8FkQPosjlwXg8wB8HoPPsuHzwTK8GIPPi+CRAHyRBp9H4YsW/CwKn5fhyxh8UQJfRuCLGHxRAl9G4YswfFmCl0Pw5Tx4LQBfFMGXMfgyAl8mwpdl+DIEXxbAa2F4tQRehODLIviqDA==';

const imagesDir = path.join(__dirname, '..', 'miniprogram', 'images');

// 写入 PNG 文件
fs.writeFileSync(
  path.join(imagesDir, 'marker-outdoor.png'),
  Buffer.from(outdoorBase64, 'base64')
);
console.log('Created marker-outdoor.png');

fs.writeFileSync(
  path.join(imagesDir, 'marker-indoor.png'),
  Buffer.from(indoorBase64, 'base64')
);
console.log('Created marker-indoor.png');

console.log('\nMarker icons created successfully!');
