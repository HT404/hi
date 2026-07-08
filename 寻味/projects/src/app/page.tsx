'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { FoodShop, Location, DistanceOption } from '@/lib/types';
import { FoodList } from '@/components/food-list';
import { DistanceFilter } from '@/components/distance-filter';
import { LocationStatus } from '@/components/location-status';
import { Header } from '@/components/header';

// 动态导入地图组件，避免SSR问题
const FoodMap = dynamic(
  () => import('@/components/food-map').then(mod => ({ default: mod.FoodMap })),
  { ssr: false }
);

// 地图包装组件，确保只在客户端渲染
function MapWrapper({ shops, center, radius }: { shops: FoodShop[]; center: Location | null; radius: DistanceOption }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !center) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#E8E4DF]">
        <div className="text-sm text-[#6B7280]">加载地图中...</div>
      </div>
    );
  }

  return <FoodMap shops={shops} center={center} radius={radius} />;
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [shops, setShops] = useState<FoodShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState<DistanceOption>(1.5);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviewCount'>('distance');

  // 获取定位
  const getLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理定位');
      setIsLocating(false);
      // 使用默认位置（杭州西湖）
      const defaultLoc = { latitude: 30.2590, longitude: 120.2194, address: '杭州西湖' };
      setLocation(defaultLoc);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        setIsLocating(false);
      },
      (error) => {
        let msg = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = '定位权限被拒绝，请允许定位或使用默认位置';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = '无法获取位置信息';
            break;
          case error.TIMEOUT:
            msg = '定位超时，请重试';
            break;
        }
        setLocationError(msg);
        setIsLocating(false);
        // 使用默认位置
        const defaultLoc = { latitude: 30.2590, longitude: 120.2194, address: '杭州西湖' };
        setLocation(defaultLoc);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // 搜索美食
  const searchShops = useCallback(async () => {
    if (!location) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        lat: String(location.latitude),
        lng: String(location.longitude),
        radius: String(distance),
        sortBy,
      });
      const res = await fetch(`/api/food/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setShops(data.data);
      }
    } catch {
      // 静默处理错误
    } finally {
      setIsLoading(false);
    }
  }, [location, distance, sortBy]);

  // 初始化定位
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // 定位或筛选条件变化时重新搜索
  useEffect(() => {
    if (location) {
      searchShops();
    }
  }, [location, distance, sortBy, searchShops]);

  return (
    <div className="h-screen flex flex-col bg-[#FAF7F2] overflow-hidden">
      <Header />

      {/* 定位状态栏 */}
      <LocationStatus
        location={location}
        isLocating={isLocating}
        error={locationError}
        onRetry={getLocation}
      />

      {/* 距离筛选 */}
      <DistanceFilter
        value={distance}
        onChange={setDistance}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={shops.length}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* 地图区域 */}
        <div className="h-[40vh] lg:h-auto lg:w-[55%] relative border-b lg:border-b-0 lg:border-r border-gray-200/60">
          <MapWrapper shops={shops} center={location} radius={distance} />
        </div>

        {/* 列表区域 */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <FoodList shops={shops} isLoading={isLoading} center={location} />
        </div>
      </div>
    </div>
  );
}
