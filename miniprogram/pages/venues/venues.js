// pages/venues/venues.js
const { venueApi } = require('../../utils/db');
const { getTempUrlMap } = require('../../utils/storage');

// 杭州中心坐标
const HANGZHOU_CENTER = {
  longitude: 120.15,
  latitude: 30.27
};

Page({
  data: {
    venues: [],
    allVenues: [], // 用于筛选
    districts: [],
    currentFilter: 'all',
    currentDistrict: '',
    priceRange: 'all',
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 0,
    pageSize: 20,
    userLocation: null,
    searchValue: '',
    searchFocused: false,
    totalCount: 0,
    
    // 视图模式: 'list' 或 'map'
    viewMode: 'list',
    
    // 地图相关数据
    mapCenter: HANGZHOU_CENTER,
    mapScale: 11,
    markers: [],
    
    // 筛选抽屉
    filterDrawerOpen: false,
    hasActiveFilter: false,
    
    // 临时筛选值
    tempFilter: 'all',
    tempPriceRange: 'all'
  },

  onLoad: function (options) {
    if (options.keyword) {
      this.setData({ searchValue: options.keyword });
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
          },
          mapCenter: {
            longitude: res.longitude,
            latitude: res.latitude
          }
        });
        this.loadVenues(true);
      },
      fail: () => {
        // 用户拒绝位置权限，使用杭州中心
        this.setData({ mapCenter: HANGZHOU_CENTER });
        this.loadVenues(true);
      }
    });
  },

  // 加载区域列表
  loadDistricts: function () {
    const districts = [...new Set(this.data.allVenues.map(v => v.district).filter(Boolean))];
    this.setData({ districts });
  },

  // 加载场馆列表
  loadVenues: async function (reset = false) {
    if (reset) {
      this.setData({ page: 0, venues: [], allVenues: [], hasMore: true });
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
          50000 // 50km范围
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

      const allVenues = reset ? venuesWithImages : [...this.data.allVenues, ...venuesWithImages];

      this.setData({
        allVenues,
        loading: false,
        refreshing: false,
        hasMore: venues.length === pageSize,
        page: page + 1,
        totalCount: allVenues.length
      });

      // 更新区域列表
      this.loadDistricts();
      
      // 应用当前筛选条件
      this.applyFiltersToList();
      
      // 更新地图标记
      this.updateMapMarkers();
    } catch (err) {
      console.error('加载场馆失败:', err);
      this.setData({ loading: false, refreshing: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 应用筛选到列表
  applyFiltersToList: function () {
    let filtered = [...this.data.allVenues];
    const { currentFilter, currentDistrict, priceRange, searchValue } = this.data;

    // 类型筛选
    if (currentFilter !== 'all') {
      filtered = filtered.filter(v => v.type === currentFilter);
    }

    // 区域筛选
    if (currentDistrict) {
      filtered = filtered.filter(v => v.district === currentDistrict);
    }

    // 价格筛选
    if (priceRange !== 'all') {
      filtered = filtered.filter(v => {
        if (!v.priceWeekday) return false;
        // 提取价格数字
        const match = v.priceWeekday.match(/\d+/);
        if (!match) return false;
        const price = parseInt(match[0]);
        
        switch (priceRange) {
          case 'low': return price < 50;
          case 'mid': return price >= 50 && price <= 100;
          case 'high': return price > 100;
          default: return true;
        }
      });
    }

    // 搜索筛选
    if (searchValue) {
      const keyword = searchValue.toLowerCase();
      filtered = filtered.filter(v => 
        (v.name && v.name.toLowerCase().includes(keyword)) ||
        (v.address && v.address.toLowerCase().includes(keyword))
      );
    }

    this.setData({ venues: filtered });
  },

  // 更新地图标记
  updateMapMarkers: function () {
    const markers = this.data.venues
      .filter(v => {
        // 支持两种格式: location.coordinates 或 lat/lng
        if (v.location && v.location.coordinates) return true;
        if (v.lat && v.lng) return true;
        return false;
      })
      .map((venue, index) => {
        // 兼容两种数据格式
        let lat, lng;
        if (venue.location && venue.location.coordinates) {
          [lng, lat] = venue.location.coordinates;
        } else {
          lat = venue.lat;
          lng = venue.lng;
        }
        const isIndoor = venue.type === '室内';
        
        return {
          id: index,
          venueId: venue._id,
          latitude: lat,
          longitude: lng,
          title: venue.name,
          width: 28,
          height: 36,
          // 使用自定义标记样式
          customCallout: {
            display: 'BYCLICK',
            anchorX: 0,
            anchorY: 0
          },
          label: {
            content: '🎾',
            color: isIndoor ? '#2563eb' : '#16a34a',
            fontSize: 16,
            anchorX: -8,
            anchorY: -20,
            bgColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: isIndoor ? '#2563eb' : '#16a34a',
            padding: 4
          },
          callout: {
            content: `${venue.name}\n${venue.priceWeekday || '价格待定'}`,
            color: '#333333',
            fontSize: 13,
            borderRadius: 8,
            padding: 10,
            bgColor: '#ffffff',
            display: 'BYCLICK',
            textAlign: 'center'
          }
        };
      });

    this.setData({ markers });
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({ searchValue: e.detail.value });
  },

  // 搜索确认
  onSearch: function (e) {
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 搜索框聚焦
  onSearchFocus: function () {
    this.setData({ searchFocused: true });
  },

  // 搜索框失焦
  onSearchBlur: function () {
    this.setData({ searchFocused: false });
  },

  // 清除搜索
  onClearSearch: function () {
    this.setData({ searchValue: '' });
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 设置区域筛选
  setDistrict: function (e) {
    const district = e.currentTarget.dataset.district;
    if (district !== this.data.currentDistrict) {
      this.setData({ currentDistrict: district });
      this.applyFiltersToList();
      this.updateMapMarkers();
    }
  },

  // 切换视图模式
  switchViewMode: function (e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode !== this.data.viewMode) {
      this.setData({ viewMode: mode });
      
      if (mode === 'map') {
        this.updateMapMarkers();
      }
    }
  },

  // 地图标记点击
  onMarkerTap: function (e) {
    const markerId = e.markerId;
    const marker = this.data.markers[markerId];
    if (marker && marker.venueId) {
      // 不跳转，只显示callout
    }
  },

  // 地图callout点击
  onCalloutTap: function (e) {
    const markerId = e.markerId;
    const marker = this.data.markers[markerId];
    if (marker && marker.venueId) {
      wx.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${marker.venueId}`
      });
    }
  },

  // 打开筛选抽屉
  openFilterDrawer: function () {
    this.setData({
      filterDrawerOpen: true,
      tempFilter: this.data.currentFilter,
      tempPriceRange: this.data.priceRange
    });
  },

  // 关闭筛选抽屉
  closeFilterDrawer: function () {
    this.setData({ filterDrawerOpen: false });
  },

  // 设置类型筛选
  setFilter: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ tempFilter: type });
  },

  // 设置价格范围
  setPriceRange: function (e) {
    const range = e.currentTarget.dataset.range;
    this.setData({ tempPriceRange: range });
  },

  // 应用筛选
  applyFilters: function () {
    const hasActiveFilter = this.data.tempFilter !== 'all' || this.data.tempPriceRange !== 'all';
    
    this.setData({
      currentFilter: this.data.tempFilter,
      priceRange: this.data.tempPriceRange,
      hasActiveFilter,
      filterDrawerOpen: false
    });
    
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 重置筛选
  resetFilters: function () {
    this.setData({
      tempFilter: 'all',
      tempPriceRange: 'all',
      currentFilter: 'all',
      priceRange: 'all',
      currentDistrict: '',
      searchValue: '',
      hasActiveFilter: false,
      filterDrawerOpen: false
    });
    
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 阻止触摸穿透
  preventTouchMove: function () {
    return false;
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
