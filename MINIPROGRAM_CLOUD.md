# TennisFind 小程序云开发部署指南

## 快速开始

### 1. 安装依赖并部署云函数

在微信开发者工具中：

```bash
# 进入云函数目录，为每个云函数安装依赖
cd cloudfunctions/getOpenId
npm install

cd ../initDatabase
npm install
```

然后在微信开发者工具中：
1. 右键点击 `cloudfunctions/getOpenId` → "创建并部署：云端安装依赖"
2. 右键点击 `cloudfunctions/initDatabase` → "创建并部署：云端安装依赖"

### 2. 初始化数据库

在微信开发者工具控制台执行：

```javascript
wx.cloud.callFunction({
  name: 'initDatabase',
  data: { action: 'init' }
}).then(res => {
  console.log('数据库初始化结果:', res.result);
});
```

创建示例数据：

```javascript
wx.cloud.callFunction({
  name: 'initDatabase',
  data: { action: 'createSampleData' }
}).then(res => {
  console.log('示例数据创建结果:', res.result);
});
```

### 3. 手动创建数据库集合（备用方案）

如果云函数初始化失败，可以手动创建：

1. 打开微信开发者工具，点击「云开发」按钮
2. 进入「数据库」标签
3. 依次创建以下集合：
   - `users` - 用户集合
   - `venues` - 场馆集合
   - `matches` - 约球集合

### 4. 设置数据库权限

对每个集合设置权限：

**users 集合：**
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

**venues 集合：**
```json
{
  "read": true,
  "write": false
}
```

**matches 集合：**
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### 5. 创建索引

在 `venues` 集合上创建地理位置索引：

1. 进入 venues 集合
2. 点击「索引」标签
3. 添加索引：
   - 索引名称：`location_index`
   - 索引字段：`location` (2dsphere)

在 `matches` 集合上创建索引：
- `date` (升序)
- `venueId` (升序)
- `status` (升序)

## 项目结构

```
miniprogram/
├── utils/
│   ├── db.js          # 数据库操作封装
│   └── storage.js     # 云存储操作封装
├── pages/
│   ├── venues/        # 场馆列表（已集成云开发）
│   ├── matches/       # 约球列表（已集成云开发）
│   ├── profile/       # 个人中心（已集成云存储头像上传）
│   └── publish-match/ # 发布约球（已集成云开发）
└── app.js             # 云开发环境初始化

cloudfunctions/
├── getOpenId/         # 获取用户 OpenID
└── initDatabase/      # 数据库初始化
```

## API 使用示例

### 数据库操作

```javascript
const { userApi, venueApi, matchApi } = require('../../utils/db');

// 获取用户信息
const userInfo = await userApi.getCurrentUser();

// 获取附近场馆
const venues = await venueApi.getNearbyVenues(longitude, latitude, 5000);

// 获取约球列表
const matches = await matchApi.getMatches({ date: '2024-01-15' });

// 创建约球
await matchApi.createMatch({
  venueId: 'xxx',
  venueName: '朝阳公园网球中心',
  date: '2024-01-15',
  startTime: '18:00',
  endTime: '20:00',
  maxPlayers: 4,
  level: 'intermediate'
});

// 加入约球
await matchApi.joinMatch(matchId);
```

### 云存储操作

```javascript
const { uploadImage, uploadAvatar, getTempUrl } = require('../../utils/storage');

// 上传图片
const fileID = await uploadImage(tempFilePath, 'venues');

// 上传头像
const avatarFileID = await uploadAvatar(tempFilePath);

// 获取临时访问链接
const { tempFileURL } = await getTempUrl(fileID);
```

## 常见问题

### 1. 云函数调用失败

检查 `app.js` 中的云开发环境 ID 是否正确：

```javascript
wx.cloud.init({
  env: 'your-env-id',  // 替换为你的环境ID
  traceUser: true,
});
```

### 2. 数据库权限错误

确保已在云开发控制台设置正确的数据库权限。

### 3. 图片上传失败

检查：
- 云存储权限是否开启
- 文件大小是否超过限制（单文件最大 5MB）

### 4. 地理位置查询失败

确保 venues 集合已创建 `location` 字段的 2dsphere 索引。

## 费用说明

云开发有免费额度：
- 数据库读操作：每天 5 万次免费
- 数据库写操作：每天 3 万次免费
- 云存储：5GB 免费空间
- 云函数：每月 100 万次免费调用

超出免费额度后按量计费，建议：
- 使用分页加载减少读操作
- 图片上传前进行压缩
- 合理使用缓存

## 下一步

1. 在微信开发者工具中预览和调试
2. 提交审核前在真机上测试
3. 关注云开发控制台的使用量和费用

## 参考文档

- [微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云数据库 API](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
- [云存储 API](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage.html)
