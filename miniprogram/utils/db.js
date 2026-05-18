/**
 * 云开发数据库操作封装
 * 包含用户、场馆、约球的数据操作方法
 */

const db = wx.cloud.database();
const _ = db.command;

// ============== 用户相关 ==============
const userApi = {
  /**
   * 获取当前用户信息
   * @returns {Promise<Object|null>}
   */
  async getCurrentUser() {
    try {
      // 获取当前用户openid
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId'
      });
      const openid = result.openid;

      const { data } = await db.collection('users')
        .where({ openid })
        .get();

      return data[0] || null;
    } catch (err) {
      console.error('获取用户信息失败', err);
      return null;
    }
  },

  /**
   * 更新或创建用户信息
   * @param {Object} userInfo 用户信息
   * @returns {Promise<Object>}
   */
  async updateUser(userInfo) {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    const existUser = await this.getCurrentUser();

    if (existUser) {
      // 更新
      return db.collection('users').doc(existUser._id).update({
        data: {
          ...userInfo,
          updateTime: db.serverDate()
        }
      });
    } else {
      // 创建
      return db.collection('users').add({
        data: {
          openid,
          ...userInfo,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
    }
  },

  /**
   * 获取用户参与的约球
   * @param {String} openid 用户openid
   * @returns {Promise<Array>}
   */
  async getUserMatches(openid) {
    const { data } = await db.collection('matches')
      .where({
        'players.openid': openid
      })
      .orderBy('date', 'desc')
      .get();
    return data;
  }
};

// ============== 场馆相关 ==============
const venueApi = {
  /**
   * 获取附近场馆（按地理位置）
   * @param {Number} longitude 经度
   * @param {Number} latitude 纬度
   * @param {Number} maxDistance 最大距离（米），默认5000
   * @returns {Promise<Array>}
   */
  async getNearbyVenues(longitude, latitude, maxDistance = 5000) {
    try {
      // 小程序端单次最多返回20条，需要分批获取
      const MAX_LIMIT = 20;
      const countResult = await db.collection('venues').count();
      const total = countResult.total;
      
      // 分批获取所有数据
      const batchTimes = Math.ceil(total / MAX_LIMIT);
      const tasks = [];
      for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection('venues')
          .skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT)
          .get();
        tasks.push(promise);
      }
      const results = await Promise.all(tasks);
      let allVenues = results.reduce((acc, cur) => acc.concat(cur.data), []);
      
      // 过滤有坐标的场馆并计算距离
      allVenues = allVenues
        .filter(v => {
          if (v.location && v.location.coordinates) return true;
          if (v.location && typeof v.location.longitude === 'number') return true;
          if (typeof v.lat === 'number' && typeof v.lng === 'number') return true;
          if (typeof v.latitude === 'number' && typeof v.longitude === 'number') return true;
          return true; // 保留没有坐标的场馆
        })
        .map(v => {
          // 计算距离
          let vLat, vLng;
          if (v.location && v.location.coordinates) {
            [vLng, vLat] = v.location.coordinates;
          } else if (v.location && typeof v.location.longitude === 'number') {
            vLng = v.location.longitude;
            vLat = v.location.latitude;
          } else if (typeof v.lat === 'number') {
            vLat = v.lat;
            vLng = v.lng;
          } else if (typeof v.latitude === 'number') {
            vLat = v.latitude;
            vLng = v.longitude;
          }
          
          if (vLat && vLng) {
            // 简单距离计算（单位：米）
            const radLat1 = latitude * Math.PI / 180;
            const radLat2 = vLat * Math.PI / 180;
            const a = radLat1 - radLat2;
            const b = (longitude - vLng) * Math.PI / 180;
            const s = 2 * Math.asin(Math.sqrt(
              Math.pow(Math.sin(a / 2), 2) +
              Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
            ));
            v._distance = Math.round(s * 6378137); // 地球半径
          } else {
            v._distance = 999999; // 无坐标的放最后
          }
          return v;
        })
        .filter(v => v._distance <= maxDistance || v._distance === 999999)
        .sort((a, b) => a._distance - b._distance);
      
      return allVenues;
    } catch (err) {
      console.error('获取附近场馆失败', err);
      // 降级返回所有场馆
      return this.getAllVenues();
    }
  },

  /**
   * 获取所有场馆（解决20条限制）
   * @returns {Promise<Array>}
   */
  async getAllVenues() {
    const MAX_LIMIT = 20;
    const countResult = await db.collection('venues').count();
    const total = countResult.total;
    
    // 分批获取所有数据
    const batchTimes = Math.ceil(total / MAX_LIMIT);
    const tasks = [];
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('venues')
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get();
      tasks.push(promise);
    }
    const results = await Promise.all(tasks);
    return results.reduce((acc, cur) => acc.concat(cur.data), []);
  },

  /**
   * 分页获取场馆
   * @param {Number} page 页码，从0开始
   * @param {Number} pageSize 每页数量
   * @returns {Promise<Array>}
   */
  async getVenuesByPage(page = 0, pageSize = 10) {
    const { data } = await db.collection('venues')
      .skip(page * pageSize)
      .limit(pageSize)
      .get();
    return data;
  },

  /**
   * 根据ID获取场馆详情
   * @param {String} id 场馆ID
   * @returns {Promise<Object>}
   */
  async getVenueById(id) {
    const { data } = await db.collection('venues').doc(id).get();
    return data;
  },

  /**
   * 搜索场馆
   * @param {String} keyword 关键词
   * @returns {Promise<Array>}
   */
  async searchVenues(keyword) {
    const { data } = await db.collection('venues')
      .where(_.or([
        { name: db.RegExp({ regexp: keyword, options: 'i' }) },
        { address: db.RegExp({ regexp: keyword, options: 'i' }) }
      ]))
      .get();
    return data;
  }
};

// ============== 约球相关 ==============
const matchApi = {
  /**
   * 获取约球列表
   * @param {Object} filters 筛选条件
   * @param {String} filters.date 日期 YYYY-MM-DD
   * @param {String} filters.venueId 场馆ID
   * @param {String} filters.level 水平要求
   * @param {String} filters.status 状态
   * @returns {Promise<Array>}
   */
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
    if (filters.status) {
      query = query.where({ status: filters.status });
    }

    const { data } = await query
      .orderBy('date', 'asc')
      .orderBy('startTime', 'asc')
      .get();

    return data;
  },

  /**
   * 分页获取约球列表
   * @param {Object} filters 筛选条件
   * @param {Number} page 页码
   * @param {Number} pageSize 每页数量
   * @returns {Promise<Array>}
   */
  async getMatchesByPage(filters = {}, page = 0, pageSize = 10) {
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
    if (filters.status) {
      query = query.where({ status: filters.status });
    }

    const { data } = await query
      .orderBy('date', 'asc')
      .orderBy('startTime', 'asc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get();

    return data;
  },

  /**
   * 获取约球详情
   * @param {String} matchId 约球ID
   * @returns {Promise<Object>}
   */
  async getMatchById(matchId) {
    const { data } = await db.collection('matches').doc(matchId).get();
    return data;
  },

  /**
   * 创建约球
   * @param {Object} matchInfo 约球信息
   * @returns {Promise<Object>}
   */
  async createMatch(matchInfo) {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    // 获取用户信息作为创建者信息
    const userInfo = await userApi.getCurrentUser();

    return db.collection('matches').add({
      data: {
        ...matchInfo,
        creatorId: openid,
        creatorInfo: {
          nickName: userInfo?.nickName || '',
          avatarUrl: userInfo?.avatarUrl || ''
        },
        status: 'open',
        players: [],
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });
  },

  /**
   * 加入约球
   * @param {String} matchId 约球ID
   * @returns {Promise<Object>}
   */
  async joinMatch(matchId) {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    const userInfo = await userApi.getCurrentUser();

    // 先检查是否已加入
    const match = await this.getMatchById(matchId);
    const alreadyJoined = match.players.some(p => p.openid === openid);

    if (alreadyJoined) {
      throw new Error('您已加入该约球');
    }

    if (match.players.length >= match.maxPlayers) {
      throw new Error('人数已满');
    }

    return db.collection('matches').doc(matchId).update({
      data: {
        players: _.push([{
          openid,
          nickName: userInfo?.nickName || '',
          avatarUrl: userInfo?.avatarUrl || ''
        }]),
        updateTime: db.serverDate()
      }
    });
  },

  /**
   * 退出约球
   * @param {String} matchId 约球ID
   * @returns {Promise<Object>}
   */
  async leaveMatch(matchId) {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    const match = await this.getMatchById(matchId);
    const newPlayers = match.players.filter(p => p.openid !== openid);

    return db.collection('matches').doc(matchId).update({
      data: {
        players: newPlayers,
        updateTime: db.serverDate()
      }
    });
  },

  /**
   * 取消约球（仅创建者可操作）
   * @param {String} matchId 约球ID
   * @returns {Promise<Object>}
   */
  async cancelMatch(matchId) {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    const match = await this.getMatchById(matchId);

    if (match.creatorId !== openid) {
      throw new Error('只有创建者可以取消');
    }

    return db.collection('matches').doc(matchId).update({
      data: {
        status: 'cancelled',
        updateTime: db.serverDate()
      }
    });
  },

  /**
   * 获取我创建的约球
   * @returns {Promise<Array>}
   */
  async getMyCreatedMatches() {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    const { data } = await db.collection('matches')
      .where({ creatorId: openid })
      .orderBy('createTime', 'desc')
      .get();

    return data;
  },

  /**
   * 获取我参与的约球
   * @returns {Promise<Array>}
   */
  async getMyJoinedMatches() {
    const { result } = await wx.cloud.callFunction({
      name: 'getOpenId'
    });
    const openid = result.openid;

    const { data } = await db.collection('matches')
      .where({
        'players.openid': openid
      })
      .orderBy('date', 'desc')
      .get();

    return data;
  }
};

module.exports = {
  db,
  _,
  userApi,
  venueApi,
  matchApi
};
