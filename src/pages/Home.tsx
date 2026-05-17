import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useVenueSync } from '@/hooks/useVenueSync';
import type { Venue, FilterOptions } from '@/types/venue';
import { getDistricts, filterVenues, searchVenues } from '@/services/venueService';
import SearchBar from '@/components/SearchBar';
import VenueCard from '@/components/VenueCard';
import FilterDrawer from '@/components/FilterDrawer';
import EmptyState from '@/components/EmptyState';
import MapView from '@/components/MapView';
import { MapPin, List, Map, Shield } from 'lucide-react';

type ViewMode = 'list' | 'map';

const ALL_DISTRICTS = ['all', '西湖区', '拱墅区', '萧山区', '滨江区', '余杭区', '上城区', '临平区', '钱塘区', '富阳区', '临安区', '桐庐县'];

export default function Home() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    district: 'all',
    type: 'all',
    priceRange: 'all',
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // 使用本地同步的场馆数据
  const { venues, loading: isLoading } = useVenueSync();

  const districts = useMemo(() => getDistricts(venues), [venues]);

  const filteredVenues = useMemo(() => {
    let result = venues;
    result = filterVenues(result, filters);
    result = searchVenues(result, searchKeyword);
    return result;
  }, [venues, filters, searchKeyword]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.district !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    return count;
  }, [filters]);

  const handleVenueClick = (venue: Venue) => {
    navigate(`/detail/${venue.id}`);
  };

  const handleDistrictClick = (district: string) => {
    setFilters(prev => ({ ...prev, district }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 bg-white">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-emerald-500" />
              杭州网球订场
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">共 {venues.length} 个场馆 · 覆盖杭州主城区</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="管理后台"
            >
              <Shield className="w-4 h-4" />
            </button>
            <div className="px-2.5 py-1 bg-emerald-50 rounded-full">
              <span className="text-xs text-emerald-600 font-medium">杭州</span>
            </div>
          </div>
        </div>

        {/* District Quick Filter */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {ALL_DISTRICTS.map((d) => {
            const isActive = filters.district === d;
            const label = d === 'all' ? '全部' : d;
            return (
              <button
                key={d}
                onClick={() => handleDistrictClick(d)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <SearchBar
          value={searchKeyword}
          onChange={setSearchKeyword}
          onFilterClick={() => setFilterDrawerOpen(true)}
          filterActive={activeFilterCount > 0}
        />
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'list' ? (
          <div className="h-full overflow-y-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">找到 {filteredVenues.length} 个场馆</span>
            </div>
            {filteredVenues.map(venue => (
              <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
            ))}
            <div className="text-center py-6">
              <p className="text-xs text-gray-400">已经到底了</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0">
            <MapView venues={filteredVenues} onVenueClick={handleVenueClick} />
          </div>
        )}
      </div>

      {/* View Mode Switcher */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100]">
        <div className="flex bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all ${
              viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            列表
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all ${
              viewMode === 'map' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Map className="w-4 h-4" />
            地图
          </button>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setFilterDrawerOpen(false);
        }}
        districts={districts}
      />
    </div>
  );
}
