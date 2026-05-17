import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  filterActive: boolean;
}

export default function SearchBar({ value, onChange, onFilterClick, filterActive }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
      <div className={`flex-1 flex items-center bg-gray-50 rounded-full px-3.5 py-2.5 transition-all ${
        focused ? 'ring-2 ring-blue-100 bg-white border border-blue-200' : ''
      }`}>
        <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="搜索场馆名称、地址..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="ml-1 p-0.5 rounded-full bg-gray-200"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>
      <button
        onClick={onFilterClick}
        className={`shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${
          filterActive
            ? 'bg-blue-500 text-white'
            : 'bg-gray-50 text-gray-600 border border-gray-200'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>筛选</span>
      </button>
    </div>
  );
}
