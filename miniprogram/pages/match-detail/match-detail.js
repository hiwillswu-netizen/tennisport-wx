// pages/match-detail/match-detail.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    matchId: '',
    match: null,
    participants: [],
    loading: true,
    isOwner: false,
    hasJoined: false,
    currentOpenid: ''
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ matchId: options.id });
      this.loadMatch();
    }
  },

  onShow: function () {
    if (this.data.matchId) {
      this.loadMatch();
    }
  },

  // 加载约球详情
  loadMatch: function () {
    this.setData({ loading: true });

    // 先获取当前用户 openid
    wx.cloud.callFunction({
      name: 'getOpenId'
    }).then(res => {
      const openid = res.result.openid;
      this.setData({ currentOpenid: openid });
      return this.fetchMatchDetail(openid);
    }).catch(err => {
      console.error('获取openid失败:', err);
      // 即使获取openid失败，也继续加载详情
      this.fetchMatchDetail('');
    });
  },

  fetchMatchDetail: function (currentOpenid) {
    db.collection('matches')
      .doc(this.data.matchId)
      .get()
      .then(res => {
        const match = res.data;
        match.createTimeStr = this.formatTime(match.createTime);

        const isOwner = match._openid === currentOpenid;

        this.setData({
          match: match,
          isOwner: isOwner,
          loading: false
        });

        // 加载参与者列表
        this.loadParticipants(currentOpenid);
      })
      .catch(err => {
        console.error('加载约球详情失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  // 加载参与者
  loadParticipants: function (currentOpenid) {
    db.collection('match_participants')
      .where({
        matchId: this.data.matchId
      })
      .get()
      .then(res => {
        const hasJoined = res.data.some(p => p._openid === currentOpenid);
        this.setData({
          participants: res.data,
          hasJoined: hasJoined
        });
      })
      .catch(err => {
        console.error('加载参与者失败:', err);
      });
  },

  // 格式化时间
  formatTime: function (timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 报名参加
  joinMatch: function () {
    wx.showLoading({ title: '报名中...' });

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于展示报名信息',
      success: (userRes) => {
        const userInfo = userRes.userInfo;
        
        db.collection('match_participants').add({
          data: {
            matchId: this.data.matchId,
            userNickname: userInfo.nickName,
            userAvatar: userInfo.avatarUrl,
            createTime: db.serverDate()
          }
        }).then(() => {
          // 更新约球的当前人数
          const newCount = (this.data.match.currentPeople || 1) + 1;
          const updateData = { currentPeople: newCount };
          
          // 如果满员，更新状态
          if (newCount >= this.data.match.needPeople) {
            updateData.status = 'closed';
          }

          return db.collection('matches').doc(this.data.matchId).update({
            data: updateData
          });
        }).then(() => {
          wx.hideLoading();
          wx.showToast({ title: '报名成功', icon: 'success' });
          this.loadMatch();
        }).catch(err => {
          wx.hideLoading();
          console.error('报名失败:', err);
          wx.showToast({ title: '报名失败', icon: 'none' });
        });
      },
      fail: (err) => {
        wx.hideLoading();
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '需要授权才能报名', icon: 'none' });
        }
      }
    });
  },

  // 跳转到场馆
  goToVenue: function (e) {
    const venueId = e.currentTarget.dataset.id;
    if (venueId) {
      wx.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${venueId}`
      });
    }
  },

  // 管理约球
  manageMatch: function () {
    wx.showActionSheet({
      itemList: ['修改状态', '删除约球'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.toggleStatus();
        } else if (res.tapIndex === 1) {
          this.deleteMatch();
        }
      }
    });
  },

  // 切换状态
  toggleStatus: function () {
    const newStatus = this.data.match.status === 'open' ? 'closed' : 'open';
    
    db.collection('matches').doc(this.data.matchId).update({
      data: { status: newStatus }
    }).then(() => {
      wx.showToast({ title: '状态已更新', icon: 'success' });
      this.loadMatch();
    }).catch(err => {
      console.error('更新状态失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  // 删除约球
  deleteMatch: function () {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('matches').doc(this.data.matchId).remove()
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            })
            .catch(err => {
              console.error('删除失败:', err);
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: `约球：${this.data.match.matchDate} ${this.data.match.venueName || ''}`,
      path: `/pages/match-detail/match-detail?id=${this.data.matchId}`
    };
  }
});
