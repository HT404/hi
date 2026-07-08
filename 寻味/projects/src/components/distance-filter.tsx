'use client';

import type { DistanceOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DistanceFilterProps {
  value: DistanceOption;
  onChange: (value: DistanceOption) => void;
  sortBy: 'distance' | 'rating' | 'reviewCount';
  onSortChange: (value: 'distance' | 'rating' | 'reviewCount') => void;
  totalCount: number;
}

const distanceOptions: { label: string; value: DistanceOption }[] = [
  { label: '1.5km', value: 1.5 },
  { label: '2km', value: 2 },
  { label: '5km', value: 5 },
];

const sortOptions: { label: string; value: 'distance' | 'rating' | 'reviewCount' }[] = [
  { label: '距离优先', value: 'distance' },
  { label: '评分优先', value: 'rating' },
  { label: '人气优先', value: 'reviewCount' },
];

export function DistanceFilter({
  value,
  onChange,
  sortBy,
  onSortChange,
  totalCount,
}: DistanceFilterProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-3">
        {/* 距离筛选 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#6B7280] mr-1">范围</span>
          {distanceOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                value === option.value
                  ? 'bg-[#E85D3A] text-white shadow-sm shadow-orange-200'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-5 bg-gray-200" />

        {/* 排序 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#6B7280] mr-1">排序</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                sortBy === option.value
                  ? 'bg-[#2D2D2D] text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 结果数量 */}
        <div className="ml-auto text-xs text-[#6B7280] shrink-0">
          共 <span className="font-semibold text-[#E85D3A]">{totalCount}</span> 家上榜店铺
        </div>
      </div>
    </div>
  );
}
