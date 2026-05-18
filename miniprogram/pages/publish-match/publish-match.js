// pages/publish-match/publish-match.js
const { venueApi, matchApi } = require('../../utils/db');
const { userApi } = require('../../utils/db');

Page({
  data: {
    today: '',
    matchDate: '',
    startTime: '',
    endTime: '',
    venueId: '',
    venueName: '',
    venueList: [],
    needPeople: 4,
    peopleOptions: [2, 3, 4, 5, 6, 7, 8],
    level: '',
    levelOptions: ['不限', '初学者 (1.0-2.0)', '中级 (2.5-3.5)', '高级 (4.0-4.5)', '专业 (5.0+)'],
    fee: '',
    remark: '',
    submitting: false
  },

  onLoad: function (options) {
    // 设置今天日期
    const today = this.formatDate(new Date());
    this.setData({ today: today });

    // 如果从场馆详情页跳转过来
    if (options.venueId && options.venueName) {
      this.setData({
        venueId: options.venueId,
        venueName: decodeURIComponent(options.venueName)
      });
    }

    // 加载场馆列表
    this.loadVenues();
  },

  // 格式化日期
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 加载场馆列表
  loadVenues: async function () {
    try {
      const venues = await venueApi.getAllVenues();
      this.setData({ venueList: venues });
    } catch (err) {
      console.error('加载场馆列表失败:', err);
      wx.showToast({ title: '加载场馆失败', icon: 'none' });
    }
  },

  // 选择日期
  onDateChange: function (e) {
    this.setData({ matchDate: e.detail.value });
  },

  // 选择开始时间
  onStartTimeChange: function (e) {
    this.setData({ startTime: e.detail.value });
  },

  // 选择结束时间
  onEndTimeChange: function (e) {
    this.setData({ endTime: e.detail.value });
  },

  // 选择场馆
  onVenueChange: function (e) {
    const index = e.detail.value;
    const venue = this.data.venueList[index];
    if (venue) {
      this.setData({
        venueId: venue._id,
        venueName: venue.name
      });
    }
  },

  // 选择人数
  onPeopleChange: function (e) {
    const index = e.detail.value;
    this.setData({ needPeople: this.data.peopleOptions[index] });
  },

  // 选择水平
  onLevelChange: function (e) {
    const index = e.detail.value;
    this.setData({ level: this.data.levelOptions[index] });
  },

  // 输入费用
  onFeeInput: function (e) {
    this.setData({ fee: e.detail.value });
  },

  // 输入备注
  onRemarkInput: function (e) {
    this.setData({ remark: e.detail.value });
  },

  // 表单验证
  validateForm: function () {
    if (!this.data.matchDate) {
      wx.showToast({ title: '请选择活动日期', icon: 'none' });
      return false;
    }
    if (!this.data.startTime) {
      wx.showToast({ title: '请选择开始时间', icon: 'none' });
      return false;
    }
    if (!this.data.endTime) {
      wx.showToast({ title: '请选择结束时间', icon: 'none' });
      return false;
    }
    if (this.data.startTime >= this.data.endTime) {
      wx.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' });
      return false;
    }
    if (!this.data.venueId) {
      wx.showToast({ title: '请选择活动地点', icon: 'none' });
      return false;
    }
    return true;
  },

  // 提交约球
  submitMatch: async function () {
    if (!this.validateForm()) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...', mask: true });

    try {
      const matchInfo = {
        venueId: this.data.venueId,
        venueName: this.data.venueName,
        date: this.data.matchDate,
        startTime: this.data.startTime,
        endTime: this.data.endTime,
        maxPlayers: this.data.needPeople,
        level: this.data.level,
        fee: this.data.fee,
        remark: this.data.remark
      };

      await matchApi.createMatch(matchInfo);

      wx.hideLoading();
      this.setData({ submitting: false });

      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟返回并刷新列表
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.loadMatches) {
          prevPage.loadMatches(true);
        }
        wx.navigateBack();
      }, 1500);

    } catch (err) {
      wx.hideLoading();
      this.setData({ submitting: false });
      console.error('发布约球失败:', err);
      wx.showToast({
        title: err.message || '发布失败，请重试',
        icon: 'none'
      });
    }
  },

  // 取消发布
  cancelPublish: function () {
    wx.navigateBack();
  }
});
