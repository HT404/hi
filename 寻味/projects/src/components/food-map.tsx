/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Navigation, Loader2 } from 'lucide-react';
import type { FoodShop, Location, DistanceOption } from '@/lib/types';

interface FoodMapProps {
  shops: FoodShop[];
  center: Location | null;
  radius: DistanceOption;
}

// 扫街榜小分类颜色映射
const SUB_CATEGORY_COLORS: Record<string, string> = {
  '烟火小店': '#FF6B35',
  '本地人爱去': '#E85D3A',
  '人气餐厅': '#F5A623',
  '深夜食堂': '#9B59B6',
  '老字号': '#C0392B',
  '口碑好店': '#10B981',
  '街坊推荐': '#3B7FFF',
};

function getMarkerColor(subCategory?: string): string {
  if (!subCategory) return '#E85D3A';
  return SUB_CATEGORY_COLORS[subCategory] || '#E85D3A';
}

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

export function FoodMap({ shops, center, radius }: FoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || !center) return;

    window._AMapSecurityConfig = {
      securityJsCode: '',
    };

    AMapLoader.load({
      key: 'fe55fd7b89dcbbfac3cf840f79b2aa1a',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    }).then((AMap: any) => {
      window.AMap = AMap;

      const map = new AMap.Map(mapContainerRef.current, {
        zoom: 15,
        center: [center.longitude, center.latitude],
        mapStyle: 'amap://styles/whitesmoke',
        resizeEnable: true,
        viewMode: '2D',
      });

      mapRef.current = map;

      // 添加比例尺和缩放工具
      map.addControl(new AMap.Scale());
      map.addControl(new AMap.ToolBar({ position: 'RB' }));

      // 创建信息窗口
      const infoWindow = new AMap.InfoWindow({
        isCustom: true,
        autoMove: true,
        offset: new AMap.Pixel(0, -30),
      });
      infoWindowRef.current = infoWindow;

      setMapLoaded(true);
    }).catch(() => {
      // 加载失败
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 更新中心点和距离圈
  useEffect(() => {
    if (!mapRef.current || !center || !mapLoaded) return;
    const AMap = window.AMap;

    // 移动中心点
    mapRef.current.setCenter([center.longitude, center.latitude]);

    // 移除旧的圈
    if (circleRef.current) {
      mapRef.current.remove(circleRef.current);
    }

    // 移除旧的用户标记
    if (userMarkerRef.current) {
      mapRef.current.remove(userMarkerRef.current);
    }

    // 绘制距离圈
    const circle = new AMap.Circle({
      center: new AMap.LngLat(center.longitude, center.latitude),
      radius: radius * 1000,
      strokeColor: '#E85D3A',
      strokeWeight: 2,
      strokeOpacity: 0.5,
      strokeStyle: 'dashed',
      fillColor: '#E85D3A',
      fillOpacity: 0.05,
    });
    mapRef.current.add(circle);
    circleRef.current = circle;

    // 添加用户位置标记
    const userMarker = new AMap.Marker({
      position: new AMap.LngLat(center.longitude, center.latitude),
      content: `<div style="
        width: 20px; height: 20px; 
        background: #E85D3A; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(232,93,58,0.4);
      "></div>`,
      offset: new AMap.Pixel(-10, -10),
      zIndex: 200,
    });
    mapRef.current.add(userMarker);
    userMarkerRef.current = userMarker;
  }, [center, radius, mapLoaded]);

  // 更新店铺标记
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const AMap = window.AMap;

    // 清除旧标记
    markersRef.current.forEach((m: any) => {
      mapRef.current?.remove(m);
    });
    markersRef.current = [];

    // 添加新标记
    shops.forEach((shop: FoodShop) => {
      const color = getMarkerColor(shop.listSubCategory);

      const markerContent = `
        <div style="position: relative; cursor: pointer;">
          <div style="width: 28px; height: 36px; position: relative;">
            <svg width="28" height="36" viewBox="0 0 28 36">
              <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${color}"/>
              <circle cx="14" cy="13" r="6" fill="white"/>
            </svg>
          </div>
        </div>
      `;

      const marker = new AMap.Marker({
        position: new AMap.LngLat(shop.longitude, shop.latitude),
        content: markerContent,
        offset: new AMap.Pixel(-14, -36),
        zIndex: 100,
        extData: shop,
      });

      // 点击事件
      marker.on('click', () => {
        const infoContent = `
          <div style="
            background: white; 
            border-radius: 12px; 
            padding: 12px 16px; 
            min-width: 200px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            border: 1px solid #f0f0f0;
          ">
            <div style="font-size: 14px; font-weight: 600; color: #2D2D2D; margin-bottom: 4px;">
              ${shop.name}
            </div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">
              ${shop.category}${shop.listSubCategory ? ` · ${shop.listSubCategory}` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <span style="color: #F5A623; font-weight: 600;">★ ${shop.rating}</span>
              <span style="color: #6B7280;">人均¥${shop.avgPrice}</span>
              <span style="color: #6B7280;">${shop.distance < 1 ? `${Math.round(shop.distance * 1000)}m` : `${shop.distance}km`}</span>
            </div>
            ${shop.listName ? `<div style="margin-top: 6px; font-size: 10px; color: ${color}; background: ${color}15; padding: 2px 6px; border-radius: 4px; display: inline-block;">${shop.listName}${shop.listSubCategory ? ` · ${shop.listSubCategory}` : ''}</div>` : ''}
          </div>
        `;
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapRef.current, marker.getPosition());
        }
      });

      // 鼠标移入效果
      marker.on('mouseover', () => {
        marker.setzIndex(150);
      });
      marker.on('mouseout', () => {
        marker.setzIndex(100);
      });

      mapRef.current?.add(marker);
      markersRef.current.push(marker);
    });

    // 自动调整视野
    if (shops.length > 0 && center) {
      const allPositions = [
        new AMap.LngLat(center.longitude, center.latitude),
        ...shops.map((s: FoodShop) => new AMap.LngLat(s.longitude, s.latitude)),
      ];
      mapRef.current.setFitView(allPositions, false, [60, 60, 60, 60]);
    }
  }, [shops, mapLoaded]);

  return (
    <div className="w-full h-full relative">
      {/* 地图容器 - 独立div，避免React管理其内部DOM */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* 加载状态 */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#E8E4DF] z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-[#E85D3A] animate-spin" />
            <span className="text-sm text-[#6B7280]">加载地图中...</span>
          </div>
        </div>
      )}

      {/* 地图图例 - 覆盖层 */}
      {mapLoaded && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 z-10">
          <div className="text-[10px] text-[#6B7280] mb-1.5 font-medium">扫街榜分类</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(SUB_CATEGORY_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 范围标签 */}
      {mapLoaded && (
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100 flex items-center gap-1.5 z-10">
          <Navigation className="w-3 h-3 text-[#E85D3A]" />
          <span className="text-xs text-[#2D2D2D] font-medium">{radius}km范围</span>
        </div>
      )}
    </div>
  );
}
