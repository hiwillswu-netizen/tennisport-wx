// pages/index/index.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    searchKeyword: '',
    venues: [],
    matches: [],
    loading: true,
    matchesLoading: true
  },

  onLoad: function () {
    this.loadVenues();
    this.loadMatches();
  },

  onShow: function () {
    // 每次显示页面时刷新约球列表
    this.loadMatches();
  },

  onPullDownRefresh: function () {
    Promise.all([this.loadVenues(), this.loadMatches()]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载场馆列表
  loadVenues: function () {
    this.setData({ loading: true });
    
    return db.collection('venues')
      .where({
        isActive: 'yes'
      })
      .orderBy('_id', 'desc')
      .limit(5)
      .get()
      .then(res => {
        this.setData({
          venues: res.data,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载场馆失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
  },

  // 加载约球列表
  loadMatches: function () {
    this.setData({ matchesLoading: true });
    
    return db.collection('matches')
      .orderBy('createTime', 'desc')
      .limit(5)
      .get()
      .then(res => {
        const matches = res.data.map(item => ({
          ...item,
          createTimeStr: this.formatTime(item.createTime)
        }));
        this.setData({
          matches: matches,
          matchesLoading: false
        });
      })
      .catch(err => {
        console.error('加载约球列表失败:', err);
        this.setData({ matchesLoading: false });
      });
  },

  // 格式化时间
  formatTime: function (timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearch: function () {
    if (this.data.searchKeyword.trim()) {
      wx.navigateTo({
        url: `/pages/venues/venues?keyword=${encodeURIComponent(this.data.searchKeyword)}`
      });
    }
  },

  // 跳转到场馆列表
  goToVenues: function () {
    wx.switchTab({
      url: '/pages/venues/venues'
    });
  },

  // 跳转到约球列表
  goToMatches: function () {
    wx.switchTab({
      url: '/pages/matches/matches'
    });
  },

  // 跳转到发布约球
  goToPublish: function () {
    wx.navigateTo({
      url: '/pages/publish-match/publish-match'
    });
  },

  // 跳转到个人中心
  goToProfile: function () {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  // 跳转到场馆详情
  goToVenueDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${id}`
    });
  },

  // 跳转到约球详情
  goToMatchDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/match-detail/match-detail?id=${id}`
    });
  }
});
