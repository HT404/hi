'use client';

import { Star, MapPin, Clock, Users, ChevronRight, Award } from 'lucide-react';
import type { FoodShop, Location } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface FoodListProps {
  shops: FoodShop[];
  isLoading: boolean;
  center: Location | null;
}

// 扫街榜小分类颜色
const SUB_CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  '烟火小店': { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', icon: '🔥' },
  '本地人爱去': { bg: 'bg-[#E85D3A]/10', text: 'text-[#E85D3A]', icon: '❤️' },
  '人气餐厅': { bg: 'bg-[#F5A623]/10', text: 'text-[#F5A623]', icon: '🔥' },
  '深夜食堂': { bg: 'bg-[#9B59B6]/10', text: 'text-[#9B59B6]', icon: '🌙' },
  '老字号': { bg: 'bg-[#C0392B]/10', text: 'text-[#C0392B]', icon: '🏛️' },
  '口碑好店': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', icon: '⭐' },
  '街坊推荐': { bg: 'bg-[#3B7FFF]/10', text: 'text-[#3B7FFF]', icon: '👍' },
};

function getCategoryEmoji(category: string): string {
  if (category.includes('中餐厅') || category.includes('浙菜')) return '🍜';
  if (category.includes('快餐厅')) return '🍱';
  if (category.includes('面') || category.includes('粉')) return '🍝';
  if (category.includes('小吃') || category.includes('糕')) return '🥟';
  if (category.includes('火锅') || category.includes('煲')) return '🍲';
  if (category.includes('烧烤') || category.includes('烧鸟')) return '🍢';
  if (category.includes('海鲜')) return '🦐';
  if (category.includes('茶') || category.includes('咖啡')) return '☕';
  if (category.includes('清真')) return '🍖';
  if (category.includes('比萨') || category.includes('西餐')) return '🍕';
  if (category.includes('炸鸡')) return '🍗';
  if (category.includes('馄饨') || category.includes('饺子')) return '🥟';
  return '🍽️';
}

function FoodCard({ shop }: { shop: FoodShop }) {
  const emoji = getCategoryEmoji(shop.category);
  const subStyle = shop.listSubCategory ? SUB_CATEGORY_STYLES[shop.listSubCategory] : null;

  return (
    <div className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#E85D3A]/20 hover:shadow-md hover:shadow-orange-50 transition-all duration-200 active:scale-[0.98] cursor-pointer">
      <div className="flex gap-3">
        {/* 左侧图标区 */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-2xl shrink-0 border border-orange-100/50">
          {emoji}
        </div>

        {/* 中间信息区 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#2D2D2D] text-sm leading-tight truncate">
              {shop.name}
            </h3>
            {/* 扫街榜小分类标签 */}
            {subStyle && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${subStyle.bg} ${subStyle.text}`}>
                {subStyle.icon} {shop.listSubCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
              <span className="text-sm font-bold text-[#2D2D2D]">{shop.rating}</span>
            </div>
            <span className="text-[10px] text-[#6B7280]">
              {shop.reviewCount > 10000
                ? `${(shop.reviewCount / 10000).toFixed(1)}万`
                : shop.reviewCount}
              条点评
            </span>
            <span className="text-[10px] text-[#6B7280]">
              人均¥{shop.avgPrice}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-0.5 text-xs text-[#6B7280]">
              <MapPin className="w-3 h-3" />
              {shop.distance < 1
                ? `${Math.round(shop.distance * 1000)}m`
                : `${shop.distance}km`}
            </span>
            {shop.openTime && (
              <span className="flex items-center gap-0.5 text-xs text-[#6B7280]">
                <Clock className="w-3 h-3" />
                {shop.openTime}
              </span>
            )}
          </div>

          {/* 地址 + 来源 */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-[#6B7280] truncate flex-1">
              {shop.address}
            </span>
            {shop.listName && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#3B7FFF] shrink-0">
                <Award className="w-3 h-3" />
                {shop.listName}
              </span>
            )}
          </div>
        </div>

        {/* 右侧箭头 */}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#E85D3A] transition-colors shrink-0 mt-1" />
      </div>
    </div>
  );
}

export function FoodList({ shops, isLoading, center }: FoodListProps) {
  if (!center) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#6B7280]">
        正在获取位置信息...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex gap-3">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="text-4xl mb-3">🍽️</div>
        <p className="text-sm text-[#6B7280]">当前范围内暂无上榜美食</p>
        <p className="text-xs text-[#6B7280] mt-1">试试扩大搜索范围</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* 列表头部 */}
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-[#E85D3A]" />
        <span className="text-sm font-semibold text-[#2D2D2D]">高德扫街榜</span>
        <span className="text-xs text-[#6B7280]">· 附近上榜好店</span>
      </div>

      {shops.map((shop) => (
        <FoodCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}
