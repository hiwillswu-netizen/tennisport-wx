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
    // 区域下拉
    districtOptions: ['杭州', '滨江区', '萧山区', '上城区', '西湖区', '拱墅区', '余杭区', '临平区', '钱塘区'],
    districtIndex: 0,
    currentDistrict: '',
    // 场地类型下拉
    typeOptions: ['场地', '室内', '室外'],
    typeIndex: 0,
    currentType: '',
    // 是否可预定下拉
    bookableOptions: ['预定', '可预定', '不可预定'],
    bookableIndex: 0,
    currentBookable: '',
    bookableFilter: 'all', // 'all', 'yes', 'no'
    
    currentFilter: 'all',
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
    mapScale: 12,
    markers: [],
    selectedVenue: null, // 当前选中的场馆
    
    // 筛选抽屉（保留兼容）
    filterDrawerOpen: false,
    hasActiveFilter: false,
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
    const districtOptions = ['区域', ...districts];
    this.setData({ districts, districtOptions });
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
      const { userLocation } = this.data;

      // 获取所有场馆（已解决20条限制）
      if (userLocation) {
        venues = await venueApi.getNearbyVenues(
          userLocation.longitude,
          userLocation.latitude,
          100000 // 100km范围，基本覆盖杭州全市
        );
      } else {
        venues = await venueApi.getAllVenues();
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

      this.setData({
        allVenues: venuesWithImages,
        loading: false,
        refreshing: false,
        hasMore: false, // 一次性加载完成
        totalCount: venuesWithImages.length
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
    const { currentFilter, currentDistrict, bookableFilter, searchValue } = this.data;

    // 类型筛选
    if (currentFilter !== 'all') {
      filtered = filtered.filter(v => v.type === currentFilter);
    }

    // 区域筛选
    if (currentDistrict) {
      filtered = filtered.filter(v => v.district === currentDistrict);
    }

    // 是否可预定筛选
    if (bookableFilter !== 'all') {
      filtered = filtered.filter(v => {
        const hasBooking = !!(v.bookingMiniProgram || v.bookingUrl || v.bookingPhone);
        return bookableFilter === 'yes' ? hasBooking : !hasBooking;
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
        // 支持多种格式: location.coordinates / location.longitude,latitude / lat,lng
        if (v.location && v.location.coordinates && Array.isArray(v.location.coordinates)) return true;
        if (v.location && typeof v.location.longitude === 'number' && typeof v.location.latitude === 'number') return true;
        if (typeof v.lat === 'number' && typeof v.lng === 'number') return true;
        if (typeof v.latitude === 'number' && typeof v.longitude === 'number') return true;
        return false;
      })
      .map((venue, index) => {
        // 兼容多种数据格式
        let lat, lng;
        
        if (venue.location && venue.location.coordinates && Array.isArray(venue.location.coordinates)) {
          // GeoJSON 格式: [longitude, latitude]
          [lng, lat] = venue.location.coordinates;
        } else if (venue.location && typeof venue.location.longitude === 'number') {
          // 对象格式: { longitude, latitude }
          lng = venue.location.longitude;
          lat = venue.location.latitude;
        } else if (typeof venue.lat === 'number' && typeof venue.lng === 'number') {
          // 扁平格式: lat, lng
          lat = venue.lat;
          lng = venue.lng;
        } else if (typeof venue.latitude === 'number' && typeof venue.longitude === 'number') {
          // 扁平格式: latitude, longitude
          lat = venue.latitude;
          lng = venue.longitude;
        }
        
        // 验证坐标是否在合理范围内（中国区域）
        if (!lat || !lng || lat < 3 || lat > 54 || lng < 73 || lng > 136) {
          console.warn(`场馆 ${venue.name} 坐标无效:`, { lat, lng, location: venue.location });
          return null;
        }
        
        const isIndoor = venue.type === '室内';
        
        return {
          id: index,
          venueId: venue._id,
          latitude: lat,
          longitude: lng,
          title: venue.name,
          width: 36,
          height: 36,
          iconPath: isIndoor ? '/images/marker-tennis-indoor.png' : '/images/marker-tennis-outdoor.png',
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
      })
      .filter(m => m !== null); // 过滤无效标记

    console.log('地图标记数据:', markers.slice(0, 3)); // 调试：输出前3个标记
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

  // 设置区域筛选（picker 下拉选择）
  onDistrictChange: function (e) {
    const index = parseInt(e.detail.value);
    const districtOptions = this.data.districtOptions;
    const district = index === 0 ? '' : districtOptions[index];
    
    this.setData({
      districtIndex: index,
      currentDistrict: district
    });
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 设置场地类型（picker 下拉选择）
  onTypeChange: function (e) {
    const index = parseInt(e.detail.value);
    const typeOptions = this.data.typeOptions;
    const type = index === 0 ? '' : typeOptions[index];
    
    this.setData({
      typeIndex: index,
      currentType: type,
      currentFilter: index === 0 ? 'all' : type
    });
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 设置是否可预定（picker 下拉选择）
  onBookableChange: function (e) {
    const index = parseInt(e.detail.value);
    const bookableMap = ['all', 'yes', 'no'];
    const bookableLabels = ['', '可预定', '不可预定'];
    
    this.setData({
      bookableIndex: index,
      currentBookable: bookableLabels[index],
      bookableFilter: bookableMap[index]
    });
    this.applyFiltersToList();
    this.updateMapMarkers();
  },

  // 设置区域筛选（旧方法保留兼容）
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
      // 找到对应的场馆
      const venue = this.data.venues.find(v => v._id === marker.venueId);
      if (venue) {
        this.setData({ selectedVenue: venue });
      }
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

  // 关闭球馆弹窗
  closeVenuePopup: function () {
    this.setData({ selectedVenue: null });
  },

  // 从弹窗跳转详情
  goToDetailFromPopup: function () {
    const venue = this.data.selectedVenue;
    if (venue) {
      wx.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${venue._id}`
      });
    }
  },

  // 移动到我的位置
  moveToMyLocation: function () {
    const { userLocation } = this.data;
    
    if (userLocation) {
      // 已有位置，直接移动
      this.setData({
        mapCenter: userLocation,
        mapScale: 14
      });
    } else {
      // 重新获取位置
      wx.showLoading({ title: '定位中...' });
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
            },
            mapScale: 14
          });
          wx.hideLoading();
        },
        fail: () => {
          wx.hideLoading();
          wx.showModal({
            title: '定位失败',
            content: '请在系统设置中开启位置权限',
            showCancel: false
          });
        }
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
