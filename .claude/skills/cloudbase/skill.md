# CloudBase 云开发 Skill

## 简介

本 Skill 帮助你在微信小程序中快速集成腾讯云开发（CloudBase），包括数据库操作、云存储、云函数等核心功能。

## 已集成功能

- ✅ 云开发环境初始化
- ✅ 获取用户 OpenID 云函数
- ⬜ 数据库操作封装
- ⬜ 云存储文件上传/下载
- ⬜ 用户数据管理
- ⬜ 场馆数据管理
- ⬜ 约球数据管理

## 数据库设计

### 集合（Collections）

#### 1. users - 用户集合
```javascript
{
  _id: String,           // 自动生成的唯一ID
  openid: String,        // 微信用户唯一标识
  nickName: String,      // 昵称
  avatarUrl: String,     // 头像URL
  gender: Number,        // 性别 0-未知 1-男 2-女
  phone: String,         // 手机号
  level: String,         // 网球水平: beginner/intermediate/advanced/pro
  createTime: Date,      // 创建时间
  updateTime: Date       // 更新时间
}
```

#### 2. venues - 场馆集合
```javascript
{
  _id: String,
  name: String,          // 场馆名称
  address: String,       // 地址
  location: {            // 地理位置
    type: 'Point',
    coordinates: [Number, Number]  // [经度, 纬度]
  },
  phone: String,         // 联系电话
  images: [String],      // 场馆图片URL数组
  facilities: [String],  // 设施: ['停车场', '更衣室', '灯光']
  courtCount: Number,    // 场地数量
  priceRange: {          // 价格范围
    min: Number,
    max: Number
  },
  openTime: String,      // 营业时间
  rating: Number,        // 评分 0-5
  createTime: Date
}
```

#### 3. matches - 约球集合
```javascript
{
  _id: String,
  creatorId: String,     // 创建者openid
  venueId: String,       // 场馆ID
  venueName: String,     // 场馆名称
  date: String,          // 日期 YYYY-MM-DD
  startTime: String,     // 开始时间 HH:MM
  endTime: String,       // 结束时间 HH:MM
  level: String,         // 要求水平
  players: [{            // 参与人员
    openid: String,
    nickName: String,
    avatarUrl: String
  }],
  maxPlayers: Number,    // 最大人数
  status: String,        // 状态: open/closed/cancelled
  description: String,   // 描述
  createTime: Date
}
```

## 快速开始

### 1. 初始化数据库

在微信开发者工具中：
1. 点击「云开发」按钮
2. 进入「数据库」标签
3. 创建上述三个集合：users、venues、matches

### 2. 创建索引（重要）

在 venues 集合上创建地理位置索引：
```javascript
db.collection('venues').createIndex({
  location: '2dsphere'
})
```

### 3. 设置数据库权限

每个集合的安全规则：
```javascript
{
  "read": true,    // 允许所有用户读取
  "write": "doc._openid == auth.openid"  // 只允许创建者写入
}
```

对于 venues 集合（管理员维护）：
```javascript
{
  "read": true,
  "write": false   // 通过云函数管理
}
```

## API 封装

### 数据库操作 (miniprogram/utils/db.js)

```javascript
const db = wx.cloud.database();
const _ = db.command;

// 用户相关
const userApi = {
  // 获取当前用户信息
  async getCurrentUser() {
    const { data } = await db.collection('users')
      .where({ openid: '{openid}' })
      .get();
    return data[0];
  },

  // 更新用户信息
  async updateUser(userInfo) {
    const { openid } = await wx.cloud.callFunction({
      name: 'getOpenId'
    }).then(res => res.result);

    return db.collection('users').doc(openid).set({
      data: {
        ...userInfo,
        openid,
        updateTime: db.serverDate()
      }
    });
  }
};

// 场馆相关
const venueApi = {
  // 获取附近场馆
  async getNearbyVenues(longitude, latitude, maxDistance = 5000) {
    const { data } = await db.collection('venues')
      .where({
        location: _.geoNear({
          geometry: db.Geo.Point(longitude, latitude),
          maxDistance
        })
      })
      .get();
    return data;
  },

  // 获取所有场馆
  async getAllVenues() {
    const { data } = await db.collection('venues').get();
    return data;
  },

  // 获取场馆详情
  async getVenueById(id) {
    const { data } = await db.collection('venues').doc(id).get();
    return data;
  }
};

// 约球相关
const matchApi = {
  // 获取约球列表
  async getMatches(filters = {}) {
    let query = db.collection('matches');
    
    if (filters.date) {
      query = query.where({ date: filters.date });
    }
    if (filters.venueId) {
      query = query.where({ venueId: filters.venueId });
    }
    if (filters.level) {
      query = query.where({ level: filters.level });
    }
    
    const { data } = await query.orderBy('date', 'asc').get();
    return data;
  },

  // 创建约球
  async createMatch(matchInfo) {
    const { openid } = await wx.cloud.callFunction({
      name: 'getOpenId'
    }).then(res => res.result);

    return db.collection('matches').add({
      data: {
        ...matchInfo,
        creatorId: openid,
        status: 'open',
        players: [],
        createTime: db.serverDate()
      }
    });
  },

  // 加入约球
  async joinMatch(matchId) {
    const { openid } = await wx.cloud.callFunction({
      name: 'getOpenId'
    }).then(res => res.result);

    const userInfo = await userApi.getCurrentUser();
    
    return db.collection('matches').doc(matchId).update({
      data: {
        players: _.push([{
          openid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }])
      }
    });
  }
};

module.exports = {
  db,
  _,
  userApi,
  venueApi,
  matchApi
};
```

### 云存储操作 (miniprogram/utils/storage.js)

```javascript
// 上传图片
async function uploadImage(filePath, folder = 'images') {
  const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${filePath.match(/\.([^.]+)$/)[1]}`;
  
  const { fileID } = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  });
  
  return fileID;
}

// 上传多张图片
async function uploadImages(filePaths, folder = 'images') {
  const uploadTasks = filePaths.map(path => uploadImage(path, folder));
  return Promise.all(uploadTasks);
}

// 获取临时访问链接
async function getTempUrl(fileID) {
  const { fileList } = await wx.cloud.getTempFileURL({
    fileList: [fileID]
  });
  return fileList[0].tempFileURL;
}

// 删除文件
async function deleteFile(fileID) {
  return wx.cloud.deleteFile({
    fileList: [fileID]
  });
}

module.exports = {
  uploadImage,
  uploadImages,
  getTempUrl,
  deleteFile
};
```

## 页面集成示例

### 个人资料页 (profile.js)

```javascript
const { userApi } = require('../../utils/db');
const { uploadImage } = require('../../utils/storage');

Page({
  data: {
    userInfo: null
  },

  async onLoad() {
    await this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      const userInfo = await userApi.getCurrentUser();
      this.setData({ userInfo });
    } catch (err) {
      console.error('获取用户信息失败', err);
    }
  },

  // 选择并上传头像
  async chooseAvatar() {
    const { tempFilePaths } = await wx.chooseMedia({
      count: 1,
      mediaType: ['image']
    });

    wx.showLoading({ title: '上传中...' });
    
    try {
      const fileID = await uploadImage(tempFilePaths[0], 'avatars');
      await userApi.updateUser({ avatarUrl: fileID });
      await this.loadUserInfo();
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '上传失败', icon: 'error' });
    }
  }
});
```

### 场馆列表页 (venues.js)

```javascript
const { venueApi } = require('../../utils/db');

Page({
  data: {
    venues: [],
    loading: false
  },

  async onLoad() {
    await this.loadVenues();
  },

  async loadVenues() {
    this.setData({ loading: true });
    
    try {
      // 获取用户位置
      const { longitude, latitude } = await wx.getLocation({ type: 'gcj02' });
      
      // 获取附近场馆
      const venues = await venueApi.getNearbyVenues(longitude, latitude, 10000);
      
      this.setData({ venues });
    } catch (err) {
      console.error('获取场馆失败', err);
      // 降级获取所有场馆
      const venues = await venueApi.getAllVenues();
      this.setData({ venues });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

### 约球列表页 (matches.js)

```javascript
const { matchApi } = require('../../utils/db');

Page({
  data: {
    matches: [],
    filters: {}
  },

  async onLoad() {
    await this.loadMatches();
  },

  async loadMatches() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const matches = await matchApi.getMatches(this.data.filters);
      this.setData({ matches });
    } catch (err) {
      console.error('获取约球列表失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  // 加入约球
  async joinMatch(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      await matchApi.joinMatch(id);
      wx.showToast({ title: '加入成功', icon: 'success' });
      await this.loadMatches();
    } catch (err) {
      wx.showToast({ title: '加入失败', icon: 'error' });
    }
  }
});
```

## 云函数扩展

### 管理员权限云函数

创建 `cloudfunctions/admin/` 用于管理数据：

```javascript
// cloudfunctions/admin/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 管理员openid列表
const ADMIN_OPENIDS = ['your-admin-openid'];

exports.main = async (event, context) => {
  const { action, data } = event;
  const wxContext = cloud.getWXContext();
  
  // 检查管理员权限
  if (!ADMIN_OPENIDS.includes(wxContext.OPENID)) {
    return { code: 403, message: '无权限' };
  }

  switch (action) {
    case 'addVenue':
      return addVenue(data);
    case 'updateVenue':
      return updateVenue(data);
    case 'deleteVenue':
      return deleteVenue(data);
    default:
      return { code: 404, message: '未知操作' };
  }
};

async function addVenue(data) {
  return db.collection('venues').add({
    data: {
      ...data,
      createTime: db.serverDate()
    }
  });
}
```

## 最佳实践

1. **错误处理**: 始终包装数据库操作，提供用户友好的错误提示
2. **加载状态**: 长时间操作显示 loading 提示
3. **权限控制**: 敏感操作使用云函数，前端只读
4. **数据分页**: 列表数据使用 `skip` 和 `limit` 分页
5. **图片压缩**: 上传前使用 wx.compressImage 压缩
6. **缓存策略**: 场馆等不常变数据可本地缓存

## 费用优化

- 数据库读操作是最主要的费用来源
- 使用聚合查询减少请求次数
- 合理使用缓存减少重复读取
- 图片上传到云存储而非 base64 存数据库
