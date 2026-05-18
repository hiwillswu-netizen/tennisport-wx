// pages/venue-detail/venue-detail.js
const db = wx.cloud.database();

Page({
  data: {
    venueId: '',
    venue: null,
    tagsArray: [],
    loading: true,
    error: ''
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ venueId: options.id });
      this.loadVenue();
    } else {
      this.setData({ error: '参数错误', loading: false });
    }
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
    if (venue.lat && venue.lng) {
      wx.openLocation({
        latitude: venue.lat,
        longitude: venue.lng,
        name: venue.name,
        address: venue.address,
        scale: 16
      });
    } else {
      // 如果没有经纬度，尝试使用地址搜索
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

  // 分享
  onShareAppMessage: function () {
    return {
      title: `${this.data.venue.name} - TennisFind`,
      path: `/pages/venue-detail/venue-detail?id=${this.data.venueId}`
    };
  }
});
