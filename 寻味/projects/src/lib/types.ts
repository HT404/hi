export interface FoodShop {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  avgPrice: number;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
  image: string;
  tags: string[];
  source: 'dianping' | 'gaode' | 'both';
  isOnList: boolean;
  listName?: string;
  listSubCategory?: string; // 扫街榜小分类：烟火小店、本地人爱去、人气餐厅等
  openTime?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type DistanceOption = 1.5 | 2 | 5;

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  category?: string;
  sortBy?: 'distance' | 'rating' | 'reviewCount';
}
