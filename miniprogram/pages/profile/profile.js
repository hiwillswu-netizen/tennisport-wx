// pages/profile/profile.js
const { userApi } = require('../../utils/db');
const { uploadAvatar, getTempUrl } = require('../../utils/storage');

Page({
  data: {
    userInfo: null,
    openid: '',
    myMatchesCount: 0,
    myJoinsCount: 0,
    collectCount: 0,
    loading: false
  },

  onLoad: function () {
    this.checkLogin();
  },

  onShow: function () {
    if (this.data.openid) {
      this.loadStats();
    }
  },

  // 检查登录状态
  checkLogin: async function () {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId'
      });
      const openid = result.openid;
      this.setData({ openid: openid });

      // 从数据库获取用户信息
      const userInfo = await userApi.getCurrentUser();
      if (userInfo) {
        // 如果有头像文件ID，获取临时URL
        if (userInfo.avatarUrl && userInfo.avatarUrl.startsWith('cloud://')) {
          const tempUrl = await getTempUrl(userInfo.avatarUrl);
          userInfo.avatarTempUrl = tempUrl.tempFileURL;
        }
        this.setData({ userInfo });
      }

      this.loadStats();
    } catch (err) {
      console.error('获取 openid 失败:', err);
    }
  },

  // 获取用户信息（微信授权）
  getUserProfile: async function () {
    try {
      const { userInfo: wxUserInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      this.setData({ loading: true });

      // 保存到数据库
      await userApi.updateUser({
        nickName: wxUserInfo.nickName,
        avatarUrl: wxUserInfo.avatarUrl,
        gender: wxUserInfo.gender
      });

      // 重新加载用户信息
      const userInfo = await userApi.getCurrentUser();
      this.setData({
        userInfo: { ...userInfo, avatarTempUrl: wxUserInfo.avatarUrl },
        loading: false
      });

      wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (err) {
      this.setData({ loading: false });
      if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    }
  },

  // 选择并上传头像
  chooseAvatar: async function () {
    if (!this.data.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    try {
      const { tempFiles } = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      });

      this.setData({ loading: true });
      wx.showLoading({ title: '上传中...' });

      // 上传头像到云存储
      const fileID = await uploadAvatar(tempFiles[0].tempFilePath);

      // 更新用户资料
      await userApi.updateUser({ avatarUrl: fileID });

      // 获取临时URL显示
      const tempUrl = await getTempUrl(fileID);

      this.setData({
        'userInfo.avatarUrl': fileID,
        'userInfo.avatarTempUrl': tempUrl.tempFileURL,
        loading: false
      });

      wx.hideLoading();
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('上传头像失败:', err);
      wx.showToast({ title: '上传失败', icon: 'error' });
    }
  },

  // 编辑昵称
  editNickname: async function () {
    if (!this.data.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    try {
      const { confirm, content } = await wx.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入昵称',
        content: this.data.userInfo.nickName || ''
      });

      if (confirm && content.trim()) {
        this.setData({ loading: true });

        await userApi.updateUser({ nickName: content.trim() });

        this.setData({
          'userInfo.nickName': content.trim(),
          loading: false
        });

        wx.showToast({ title: '修改成功', icon: 'success' });
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '修改失败', icon: 'error' });
    }
  },

  // 编辑网球水平
  editLevel: async function () {
    if (!this.data.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const levels = [
      { value: 'beginner', label: '初学者 (1.0-2.0)' },
      { value: 'intermediate', label: '中级 (2.5-3.5)' },
      { value: 'advanced', label: '高级 (4.0-4.5)' },
      { value: 'pro', label: '专业 (5.0+)' }
    ];

    const levelLabels = levels.map(l => l.label);

    try {
      const { tapIndex } = await wx.showActionSheet({
        itemList: levelLabels
      });

      this.setData({ loading: true });

      await userApi.updateUser({ level: levels[tapIndex].value });

      this.setData({
        'userInfo.level': levels[tapIndex].value,
        loading: false
      });

      wx.showToast({ title: '修改成功', icon: 'success' });
    } catch (err) {
      this.setData({ loading: false });
      // 用户取消
      if (err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
      wx.showToast({ title: '修改失败', icon: 'error' });
    }
  },

  // 加载统计数据
  loadStats: async function () {
    const openid = this.data.openid;
    if (!openid) return;

    try {
      // 获取我的发布数量
      const myCreated = await userApi.getUserMatches(openid);
      this.setData({ myMatchesCount: myCreated.length });

      // 获取我参与的数量
      const { matchApi } = require('../../utils/db');
      const myJoined = await matchApi.getMyJoinedMatches();
      this.setData({ myJoinsCount: myJoined.length });
    } catch (err) {
      console.error('加载统计数据失败:', err);
    }
  },

  // 跳转到我的发布
  goToMyMatches: function () {
    wx.switchTab({
      url: '/pages/matches/matches'
    });
    // 由于 switchTab 后需要切换到"我的约球"标签
    const app = getApp();
    app.globalData.showMyMatches = true;
  },

  // 跳转到我参与的
  goToMyJoins: function () {
    wx.switchTab({
      url: '/pages/matches/matches'
    });
    const app = getApp();
    app.globalData.showMyMatches = true;
  },

  // 跳转到收藏
  goToFavorites: function () {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 意见反馈
  goToFeedback: function () {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 关于我们
  goToAbout: function () {
    wx.showModal({
      title: '关于 TennisFind',
      content: 'TennisFind 是一款网球约球找球友的小程序，帮助网球爱好者快速找到合适的场馆和球友。\n\n版本：1.0.0\n技术支持：腾讯云 CloudBase',
      showCancel: false
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: 'TennisFind - 找球友，约球更方便',
      path: '/pages/index/index'
    };
  }
});
