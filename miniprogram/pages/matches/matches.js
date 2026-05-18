// pages/matches/matches.js
const { matchApi } = require('../../utils/db');
const { getTempUrlMap } = require('../../utils/storage');

Page({
  data: {
    matches: [],
    currentTab: 'all',
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 0,
    pageSize: 10,
    filters: {},
    // WeUI tabs 数据
    matchTabs: [
      { title: '全部约球' },
      { title: '我的约球' }
    ],
    activeTabIndex: 0
  },

  onLoad: function () {
    this.loadMatches(true);
  },

  onShow: function () {
    // 检查全局标记，是否需要显示"我的约球"
    const app = getApp();
    if (app.globalData.showMyMatches) {
      app.globalData.showMyMatches = false;
      this.setData({ currentTab: 'mine' });
      this.loadMyMatches();
    } else {
      // 刷新列表
      this.loadMatches(true);
    }
  },

  // 加载约球列表
  loadMatches: async function (reset = false) {
    if (reset) {
      this.setData({ page: 0, matches: [], hasMore: true });
    }

    if (!this.data.hasMore && !reset) return;

    this.setData({ loading: true });

    try {
      const { page, pageSize, filters } = this.data;

      let matches;
      if (this.data.currentTab === 'mine') {
        // 我的约球
        const myCreated = await matchApi.getMyCreatedMatches();
        const myJoined = await matchApi.getMyJoinedMatches();
        // 合并去重
        const matchMap = new Map();
        myCreated.forEach(m => matchMap.set(m._id, m));
        myJoined.forEach(m => matchMap.set(m._id, m));
        matches = Array.from(matchMap.values());
        this.setData({ hasMore: false });
      } else {
        // 全部约球，分页加载
        matches = await matchApi.getMatchesByPage(filters, page, pageSize);
        this.setData({
          hasMore: matches.length === pageSize,
          page: page + 1
        });
      }

      // 获取用户头像的临时URL
      const avatarFileIDs = matches
        .filter(m => m.creatorInfo && m.creatorInfo.avatarUrl)
        .map(m => m.creatorInfo.avatarUrl);

      const playerAvatarIDs = matches
        .flatMap(m => m.players || [])
        .filter(p => p.avatarUrl)
        .map(p => p.avatarUrl);

      const allFileIDs = [...new Set([...avatarFileIDs, ...playerAvatarIDs])];

      let imageUrlMap = {};
      if (allFileIDs.length > 0) {
        imageUrlMap = await getTempUrlMap(allFileIDs);
      }

      // 格式化数据
      const formattedMatches = matches.map(item => ({
        ...item,
        createTimeStr: this.formatTime(item.createTime),
        // 映射字段：数据库存的是 date/startTime/endTime，显示用 matchDate/matchTime
        matchDate: item.date || item.matchDate || '',
        matchTime: item.startTime ? `${item.startTime}-${item.endTime || ''}` : (item.matchTime || ''),
        userNickname: item.creatorInfo?.nickName || item.userNickname || '网球爱好者',
        userAvatar: item.creatorInfo?.avatarUrl
          ? imageUrlMap[item.creatorInfo.avatarUrl] || '/images/avatar-default.png'
          : '/images/avatar-default.png',
        currentPeople: (item.players?.length || 0) + 1,
        needPeople: item.maxPlayers || item.needPeople || 4
      }));

      const newMatches = reset ? formattedMatches : [...this.data.matches, ...formattedMatches];

      this.setData({
        matches: newMatches,
        loading: false,
        refreshing: false
      });
    } catch (err) {
      console.error('加载约球列表失败:', err);
      this.setData({ loading: false, refreshing: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 加载我的约球
  loadMyMatches: async function () {
    this.setData({ page: 0, matches: [], hasMore: false, loading: true });

    try {
      const myCreated = await matchApi.getMyCreatedMatches();
      const myJoined = await matchApi.getMyJoinedMatches();

      // 合并去重
      const matchMap = new Map();
      myCreated.forEach(m => matchMap.set(m._id, { ...m, isCreator: true }));
      myJoined.forEach(m => {
        if (!matchMap.has(m._id)) {
          matchMap.set(m._id, { ...m, isParticipant: true });
        }
      });

      const matches = Array.from(matchMap.values());

      const formattedMatches = matches.map(item => ({
        ...item,
        createTimeStr: this.formatTime(item.createTime),
        // 映射字段：数据库存的是 date/startTime/endTime，显示用 matchDate/matchTime
        matchDate: item.date || item.matchDate || '',
        matchTime: item.startTime ? `${item.startTime}-${item.endTime || ''}` : (item.matchTime || ''),
        userNickname: item.creatorInfo?.nickName || item.userNickname || '网球爱好者',
        userAvatar: item.creatorInfo?.avatarUrl || '/images/avatar-default.png',
        currentPeople: (item.players?.length || 0) + 1,
        needPeople: item.maxPlayers || item.needPeople || 4
      }));

      this.setData({
        matches: formattedMatches,
        loading: false,
        refreshing: false
      });
    } catch (err) {
      console.error('加载我的约球失败:', err);
      this.setData({ loading: false, refreshing: false });
    }
  },

  // 格式化时间
  formatTime: function (timestamp) {
    if (!timestamp) return '';

    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp.getTime) {
      date = new Date(timestamp.getTime());
    } else {
      return '';
    }

    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';

    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  // 切换标签
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.currentTab) {
      this.setData({ currentTab: tab });

      if (tab === 'mine') {
        this.loadMyMatches();
      } else {
        this.loadMatches(true);
      }
    }
  },

  // WeUI tabs 点击事件
  onTabClick: function (e) {
    const index = e.detail.index;
    const tab = index === 0 ? 'all' : 'mine';
    
    this.setData({ 
      activeTabIndex: index,
      currentTab: tab 
    });

    if (tab === 'mine') {
      this.loadMyMatches();
    } else {
      this.loadMatches(true);
    }
  },

  // 加载更多
  loadMore: function () {
    if (!this.data.loading && this.data.hasMore) {
      this.loadMatches();
    }
  },

  // 下拉刷新
  onRefresh: function () {
    this.setData({ refreshing: true });
    if (this.data.currentTab === 'mine') {
      this.loadMyMatches();
    } else {
      this.loadMatches(true);
    }
  },

  // 跳转到发布页
  goToPublish: function () {
    wx.navigateTo({
      url: '/pages/publish-match/publish-match'
    });
  },

  // 跳转到详情
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/match-detail/match-detail?id=${id}`
    });
  },

  // 筛选日期
  filterByDate: function (e) {
    const date = e.detail.value;
    this.setData({
      filters: { ...this.data.filters, date }
    });
    this.loadMatches(true);
  },

  // 筛选场馆
  filterByVenue: function (e) {
    const venueId = e.currentTarget.dataset.id;
    this.setData({
      filters: { ...this.data.filters, venueId }
    });
    this.loadMatches(true);
  },

  // 筛选水平
  filterByLevel: function (e) {
    const level = e.currentTarget.dataset.level;
    this.setData({
      filters: { ...this.data.filters, level }
    });
    this.loadMatches(true);
  },

  // 清除筛选
  clearFilters: function () {
    this.setData({ filters: {} });
    this.loadMatches(true);
  }
});
