import { X, Check } from 'lucide-react';
import { useState } from 'react';
import type { FilterOptions } from '@/types/venue';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  districts: string[];
}

const PRICE_RANGES = [
  { value: 'all', label: '全部价格' },
  { value: 'free', label: '免费' },
  { value: '0-50', label: '50元以下' },
  { value: '50-100', label: '50-100元' },
  { value: '100+', label: '100元以上' },
];

const TYPES = [
  { value: 'all', label: '全部类型' },
  { value: '室内', label: '室内' },
  { value: '室外', label: '室外' },
];

export default function FilterDrawer({ open, onClose, filters, onApply, districts }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>({ ...filters });

  if (!open) return null;

  const handleReset = () => {
    setLocalFilters({ district: 'all', type: 'all', priceRange: 'all' });
  };

  const isActive = localFilters.district !== 'all' || localFilters.type !== 'all' || localFilters.priceRange !== 'all';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-1 -ml-1 active:opacity-60">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">筛选条件</h2>
        <div className="w-7" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 区域 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">所在区域</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLocalFilters(prev => ({ ...prev, district: 'all' }))}
              className={`px-3.5 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                localFilters.district === 'all'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              全部区域
            </button>
            {districts.map(d => (
              <button
                key={d}
                onClick={() => setLocalFilters(prev => ({ ...prev, district: d }))}
                className={`px-3.5 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                  localFilters.district === d
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 场地类型 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">场地类型</h3>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setLocalFilters(prev => ({ ...prev, type: t.value }))}
                className={`px-3.5 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                  localFilters.type === t.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 价格范围 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">价格范围</h3>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map(p => (
              <button
                key={p.value}
                onClick={() => setLocalFilters(prev => ({ ...prev, priceRange: p.value }))}
                className={`px-3.5 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                  localFilters.priceRange === p.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-3 safe-area-bottom">
        <button
          onClick={handleReset}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 active:bg-gray-200"
        >
          重置
        </button>
        <button
          onClick={() => onApply(localFilters)}
          className={`flex-1 py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1 active:opacity-90 ${
            isActive ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
        >
          <Check className="w-4 h-4" />
          确定
        </button>
      </div>
    </div>
  );
}
