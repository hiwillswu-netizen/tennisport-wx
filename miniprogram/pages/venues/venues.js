// pages/venues/venues.js
const { venueApi } = require('../../utils/db');
const { getTempUrlMap } = require('../../utils/storage');

Page({
  data: {
    venues: [],
    districts: [],
    currentFilter: 'all',
    currentDistrict: '',
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 0,
    pageSize: 10,
    userLocation: null
  },

  onLoad: function (options) {
    if (options.keyword) {
      this.setData({ searchKeyword: options.keyword });
    }
    this.getUserLocation();
  },

  onShow: function () {
    if (this.data.venues.length === 0) {
      this.loadVenues(true);
    }
  },

  // 获取用户位置
  getUserLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          userLocation: {
            longitude: res.longitude,
            latitude: res.latitude
          }
        });
        this.loadVenues(true);
      },
      fail: () => {
        // 用户拒绝位置权限，加载所有场馆
        this.loadVenues(true);
      }
    });
  },

  // 加载区域列表
  loadDistricts: function () {
    const districts = [...new Set(this.data.venues.map(v => v.district).filter(Boolean))];
    this.setData({ districts });
  },

  // 加载场馆列表
  loadVenues: async function (reset = false) {
    if (reset) {
      this.setData({ page: 0, venues: [], hasMore: true });
    }

    if (!this.data.hasMore && !reset) return;

    this.setData({ loading: true });

    try {
      let venues;
      const { userLocation, page, pageSize } = this.data;

      // 如果有用户位置，优先获取附近场馆
      if (userLocation && reset) {
        venues = await venueApi.getNearbyVenues(
          userLocation.longitude,
          userLocation.latitude,
          10000 // 10km范围
        );
      } else {
        // 分页加载所有场馆
        venues = await venueApi.getVenuesByPage(page, pageSize);
      }

      // 获取场馆图片的临时URL
      const imageFileIDs = venues
        .filter(v => v.images && v.images.length > 0)
        .map(v => v.images[0]);

      let imageUrlMap = {};
      if (imageFileIDs.length > 0) {
        imageUrlMap = await getTempUrlMap(imageFileIDs);
      }

      // 合并图片URL
      const venuesWithImages = venues.map(venue => ({
        ...venue,
        coverImage: venue.images && venue.images.length > 0
          ? imageUrlMap[venue.images[0]] || '/images/venue-default.png'
          : '/images/venue-default.png'
      }));

      const newVenues = reset ? venuesWithImages : [...this.data.venues, ...venuesWithImages];

      this.setData({
        venues: newVenues,
        loading: false,
        refreshing: false,
        hasMore: venues.length === pageSize,
        page: page + 1
      });

      // 更新区域列表
      this.loadDistricts();
    } catch (err) {
      console.error('加载场馆失败:', err);
      this.setData({ loading: false, refreshing: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 搜索场馆
  searchVenues: async function (e) {
    const keyword = e.detail.value;
    if (!keyword.trim()) {
      this.loadVenues(true);
      return;
    }

    this.setData({ loading: true });

    try {
      const venues = await venueApi.searchVenues(keyword);
      this.setData({
        venues,
        loading: false,
        hasMore: false
      });
    } catch (err) {
      console.error('搜索失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }
  },

  // 设置类型筛选
  setFilter: function (e) {
    const type = e.currentTarget.dataset.type;
    if (type !== this.data.currentFilter) {
      this.setData({ currentFilter: type });
      this.loadVenues(true);
    }
  },

  // 设置区域筛选
  setDistrict: function (e) {
    const district = e.currentTarget.dataset.district;
    if (district !== this.data.currentDistrict) {
      this.setData({ currentDistrict: district });
      this.loadVenues(true);
    }
  },

  // 加载更多
  loadMore: function () {
    if (!this.data.loading && this.data.hasMore) {
      this.loadVenues();
    }
  },

  // 下拉刷新
  onRefresh: function () {
    this.setData({ refreshing: true });
    this.loadVenues(true);
  },

  // 跳转到详情
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${id}`
    });
  }
});
