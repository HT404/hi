'use client';

import { MapPin, Flame } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E85D3A] to-[#F5A623] flex items-center justify-center shadow-sm">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#2D2D2D] leading-tight tracking-tight">
            寻味地图
          </h1>
          <p className="text-[10px] text-[#6B7280] leading-tight">
            大众点评 × 高德扫街榜
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-xs text-[#6B7280]">
        <MapPin className="w-3.5 h-3.5" />
        <span>上榜美食 · 一触即达</span>
      </div>
    </header>
  );
}
