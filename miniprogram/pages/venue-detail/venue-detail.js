// pages/venue-detail/venue-detail.js
const db = wx.cloud.database();

Page({
  data: {
    venueId: '',
    venue: null,
    tagsArray: [],
    loading: true,
    error: '',
    isFavorited: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ venueId: options.id });
      this.loadVenue();
      this.checkFavorite();
    } else {
      this.setData({ error: '参数错误', loading: false });
    }
  },

  // 检查是否已收藏
  checkFavorite: function () {
    const favorites = wx.getStorageSync('favorites') || [];
    const isFavorited = favorites.includes(this.data.venueId);
    this.setData({ isFavorited });
  },

  // 切换收藏状态
  toggleFavorite: function () {
    let favorites = wx.getStorageSync('favorites') || [];
    const venueId = this.data.venueId;
    
    if (this.data.isFavorited) {
      // 取消收藏
      favorites = favorites.filter(id => id !== venueId);
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      // 添加收藏
      favorites.unshift(venueId);
      wx.showToast({ title: '收藏成功', icon: 'success' });
    }
    
    wx.setStorageSync('favorites', favorites);
    this.setData({ isFavorited: !this.data.isFavorited });
  },

  // 加载场馆详情
  loadVenue: function () {
    this.setData({ loading: true, error: '' });

    db.collection('venues')
      .doc(this.data.venueId)
      .get()
      .then(res => {
        const venue = res.data;
        // 解析标签
        let tagsArray = [];
        if (venue.tags) {
          try {
            tagsArray = typeof venue.tags === 'string' ? JSON.parse(venue.tags) : venue.tags;
          } catch (e) {
            tagsArray = venue.tags.split(',').map(t => t.trim()).filter(Boolean);
          }
        }

        this.setData({
          venue: venue,
          tagsArray: Array.isArray(tagsArray) ? tagsArray : [],
          loading: false
        });

        // 设置页面标题
        wx.setNavigationBarTitle({ title: venue.name });
      })
      .catch(err => {
        console.error('加载场馆详情失败:', err);
        this.setData({
          loading: false,
          error: '加载失败，请重试'
        });
      });
  },

  // 拨打电话
  makePhoneCall: function () {
    if (this.data.venue.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.venue.phone.replace(/[^0-9]/g, '')
      });
    }
  },

  // 打开地图
  openLocation: function () {
    const venue = this.data.venue;
    let lat, lng;
    
    // 兼容两种数据格式：GeoJSON 和 flat lat/lng
    if (venue.location && venue.location.coordinates) {
      [lng, lat] = venue.location.coordinates;
    } else if (venue.lat && venue.lng) {
      lat = venue.lat;
      lng = venue.lng;
    }
    
    if (lat && lng) {
      wx.openLocation({
        latitude: lat,
        longitude: lng,
        name: venue.name,
        address: venue.address,
        scale: 16
      });
    } else {
      // 如果没有经纬度，提供复制地址功能
      wx.showModal({
        title: '提示',
        content: `场馆地址：${venue.address}`,
        showCancel: true,
        cancelText: '取消',
        confirmText: '复制地址',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: venue.address,
              success: () => {
                wx.showToast({ title: '已复制地址', icon: 'success' });
              }
            });
          }
        }
      });
    }
  },

  // 发布约球
  publishMatch: function () {
    wx.navigateTo({
      url: `/pages/publish-match/publish-match?venueId=${this.data.venueId}&venueName=${encodeURIComponent(this.data.venue.name)}`
    });
  },

  // 跳转预定小程序
  navigateToBooking: function () {
    const venue = this.data.venue;
    
    // 如果配置了 AppID，直接跳转
    if (venue.bookingAppId) {
      wx.navigateToMiniProgram({
        appId: venue.bookingAppId,
        path: venue.bookingPath || '', // 可选的小程序页面路径
        extraData: {
          venueId: this.data.venueId,
          venueName: venue.name
        },
        success: () => {
          console.log('跳转小程序成功');
        },
        fail: (err) => {
          console.error('跳转小程序失败:', err);
          wx.showToast({ title: '无法打开预定小程序', icon: 'none' });
        }
      });
    } else if (venue.bookingMiniProgram) {
      // 如果只有小程序名称，提示用户搜索
      wx.showModal({
        title: '预定场地',
        content: `请搜索「${venue.bookingMiniProgram}」小程序进行预定`,
        showCancel: true,
        cancelText: '取消',
        confirmText: '复制名称',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: venue.bookingMiniProgram,
              success: () => {
                wx.showToast({ title: '已复制', icon: 'success' });
              }
            });
          }
        }
      });
    } else {
      wx.showToast({ title: '暂无预定渠道', icon: 'none' });
    }
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: `${this.data.venue.name} - TennisFind`,
      path: `/pages/venue-detail/venue-detail?id=${this.data.venueId}`
    };
  }
});
