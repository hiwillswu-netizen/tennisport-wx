/**
 * 数据库初始化云函数
 * 用于创建集合和索引
 */
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 集合配置
const COLLECTIONS = [
  {
    name: 'users',
    description: '用户集合',
    indexes: [
      { name: 'openid_index', key: { openid: 1 }, unique: true }
    ]
  },
  {
    name: 'venues',
    description: '场馆集合',
    indexes: [
      { name: 'location_index', key: { location: '2dsphere' } }
    ]
  },
  {
    name: 'matches',
    description: '约球集合',
    indexes: [
      { name: 'date_index', key: { date: 1 } },
      { name: 'venueId_index', key: { venueId: 1 } },
      { name: 'status_index', key: { status: 1 } },
      { name: 'creatorId_index', key: { creatorId: 1 } }
    ]
  }
];

exports.main = async (event, context) => {
  const { action = 'init' } = event;

  switch (action) {
    case 'init':
      return await initDatabase();
    case 'createSampleData':
      return await createSampleData();
    default:
      return { code: -1, message: '未知操作' };
  }
};

/**
 * 初始化数据库
 */
async function initDatabase() {
  const results = [];

  for (const collection of COLLECTIONS) {
    try {
      // 检查集合是否存在
      try {
        await db.collection(collection.name).limit(1).get();
        results.push({
          name: collection.name,
          status: 'exists',
          message: '集合已存在'
        });
      } catch (err) {
        // 集合不存在，创建它
        if (err.message && err.message.includes('not found')) {
          // 通过添加一个临时文档来创建集合
          const tempDoc = await db.collection(collection.name).add({
            data: {
              _init: true,
              createTime: new Date()
            }
          });

          // 删除临时文档
          await db.collection(collection.name).doc(tempDoc._id).remove();

          results.push({
            name: collection.name,
            status: 'created',
            message: '集合创建成功'
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      results.push({
        name: collection.name,
        status: 'error',
        message: err.message
      });
    }
  }

  return {
    code: 0,
    message: '初始化完成',
    data: results
  };
}

/**
 * 创建示例数据
 */
async function createSampleData() {
  const results = [];

  try {
    // 示例场馆数据
    const sampleVenues = [
      {
        name: '朝阳公园网球中心',
        address: '北京市朝阳区朝阳公园南路1号',
        location: {
          type: 'Point',
          coordinates: [116.489, 39.943]
        },
        phone: '010-12345678',
        images: [],
        facilities: ['停车场', '更衣室', '淋浴', '灯光'],
        courtCount: 12,
        priceRange: { min: 80, max: 150 },
        openTime: '06:00-22:00',
        rating: 4.5,
        createTime: new Date()
      },
      {
        name: '国家网球中心',
        address: '北京市朝阳区林萃路2号',
        location: {
          type: 'Point',
          coordinates: [116.395, 40.008]
        },
        phone: '010-87654321',
        images: [],
        facilities: ['停车场', '更衣室', '淋浴', '灯光', '休息区', '商店'],
        courtCount: 40,
        priceRange: { min: 100, max: 300 },
        openTime: '07:00-23:00',
        rating: 4.8,
        createTime: new Date()
      },
      {
        name: '奥体中心网球场',
        address: '北京市朝阳区安定路1号',
        location: {
          type: 'Point',
          coordinates: [116.402, 39.987]
        },
        phone: '010-98765432',
        images: [],
        facilities: ['停车场', '更衣室', '灯光'],
        courtCount: 8,
        priceRange: { min: 60, max: 120 },
        openTime: '06:30-21:30',
        rating: 4.3,
        createTime: new Date()
      }
    ];

    // 插入示例场馆
    for (const venue of sampleVenues) {
      const existVenue = await db.collection('venues')
        .where({ name: venue.name })
        .get();

      if (existVenue.data.length === 0) {
        await db.collection('venues').add({ data: venue });
        results.push({ type: 'venue', name: venue.name, status: 'created' });
      } else {
        results.push({ type: 'venue', name: venue.name, status: 'exists' });
      }
    }

    return {
      code: 0,
      message: '示例数据创建完成',
      data: results
    };
  } catch (err) {
    return {
      code: -1,
      message: '创建示例数据失败',
      error: err.message
    };
  }
}
