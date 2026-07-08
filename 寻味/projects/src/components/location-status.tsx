'use client';

import { MapPin, RefreshCw, Loader2 } from 'lucide-react';
import type { Location } from '@/lib/types';

interface LocationStatusProps {
  location: Location | null;
  isLocating: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LocationStatus({
  location,
  isLocating,
  error,
  onRetry,
}: LocationStatusProps) {
  if (isLocating) {
    return (
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-sm text-blue-700 shrink-0">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>正在获取您的位置...</span>
      </div>
    );
  }

  if (error && location) {
    return (
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-sm text-amber-700 shrink-0">
        <MapPin className="w-4 h-4 shrink-0" />
        <span className="truncate flex-1">{error}，已切换至默认位置</span>
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors text-xs font-medium shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-sm text-emerald-700 shrink-0">
      <MapPin className="w-4 h-4 shrink-0" />
      <span className="truncate">
        当前位置：{location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
      </span>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 transition-colors text-xs font-medium shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        刷新
      </button>
    </div>
  );
}
