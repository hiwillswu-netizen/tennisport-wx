// pages/favorites/favorites.js
const db = wx.cloud.database();

Page({
  data: {
    venues: [],
    loading: true
  },

  onLoad: function () {
    this.loadFavorites();
  },

  onShow: function () {
    // 每次显示页面时刷新收藏列表
    if (!this.data.loading) {
      this.loadFavorites();
    }
  },

  // 加载收藏的场馆
  loadFavorites: async function () {
    const favorites = wx.getStorageSync('favorites') || [];
    
    if (favorites.length === 0) {
      this.setData({ venues: [], loading: false });
      return;
    }

    this.setData({ loading: true });

    try {
      // 批量查询收藏的场馆
      const _ = db.command;
      const res = await db.collection('venues')
        .where({
          _id: _.in(favorites)
        })
        .get();

      // 按收藏顺序排列
      const venuesMap = {};
      res.data.forEach(v => {
        // 解析标签
        let tagsArray = [];
        if (v.tags) {
          try {
            tagsArray = typeof v.tags === 'string' ? JSON.parse(v.tags) : v.tags;
          } catch (e) {
            tagsArray = v.tags.split(',').map(t => t.trim()).filter(Boolean);
          }
        }
        v.tagsArray = Array.isArray(tagsArray) ? tagsArray.slice(0, 3) : [];
        venuesMap[v._id] = v;
      });

      // 保持收藏顺序
      const venues = favorites
        .map(id => venuesMap[id])
        .filter(Boolean);

      this.setData({ venues, loading: false });
    } catch (err) {
      console.error('加载收藏失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 跳转到场馆详情
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${id}`
    });
  },

  // 移除收藏
  removeFavorite: function (e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          let favorites = wx.getStorageSync('favorites') || [];
          favorites = favorites.filter(fid => fid !== id);
          wx.setStorageSync('favorites', favorites);
          
          // 从列表中移除
          const venues = this.data.venues.filter(v => v._id !== id);
          this.setData({ venues });
          
          wx.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  },

  // 去逛逛场馆
  goToVenues: function () {
    wx.switchTab({
      url: '/pages/venues/venues'
    });
  }
});
