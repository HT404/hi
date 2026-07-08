import { NextRequest, NextResponse } from 'next/server';
import { generateMockShops } from '@/lib/food-data';
import type { FoodShop } from '@/lib/types';

// 根据店铺特征生成扫街榜小分类
function getListSubCategory(
  category: string,
  rating: number,
  avgPrice: number,
  reviewCount: number,
  name: string
): string {
  // 老字号判断
  if (name.includes('老') || name.includes('传统') || category.includes('传统')) {
    return '老字号';
  }
  // 烟火小店：小吃快餐、低人均
  if (
    (category.includes('快餐厅') || category.includes('小吃') || category.includes('面')) &&
    avgPrice < 50
  ) {
    return '烟火小店';
  }
  // 本地人爱去：高评分、中等价位
  if (rating >= 4.3 && avgPrice >= 30 && avgPrice <= 150) {
    return '本地人爱去';
  }
  // 人气餐厅：高评论数
  if (reviewCount > 5000) {
    return '人气餐厅';
  }
  // 深夜食堂：营业时间晚
  if (category.includes('烧烤') || category.includes('酒吧') || category.includes('小龙虾')) {
    return '深夜食堂';
  }
  // 默认分类
  if (rating >= 4.0) {
    return '口碑好店';
  }
  return '街坊推荐';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '1.5');
  const sortBy = searchParams.get('sortBy') || 'distance';

  if (!lat || !lng) {
    return NextResponse.json(
      { error: '请提供经纬度参数 (lat, lng)' },
      { status: 400 }
    );
  }

  try {
    // 尝试调用高德API（如果配置了Key）
    const amapKey = process.env.AMAP_API_KEY;
    let shops: FoodShop[] = [];

    if (amapKey) {
      try {
        const amapUrl = new URL('https://restapi.amap.com/v3/place/around');
        amapUrl.searchParams.set('key', amapKey);
        amapUrl.searchParams.set('location', `${lng},${lat}`);
        amapUrl.searchParams.set('types', '050000');
        amapUrl.searchParams.set('radius', String(radius * 1000));
        amapUrl.searchParams.set('offset', '25');
        amapUrl.searchParams.set('page', '1');
        amapUrl.searchParams.set('sortrule', 'distance');

        const res = await fetch(amapUrl.toString(), { next: { revalidate: 300 } });
        const data = await res.json();

        if (data.status === '1' && data.pois?.length > 0) {
          shops = data.pois.map((poi: Record<string, unknown>, index: number) => {
            const location = poi.location as string || '0,0';
            const [poiLng, poiLat] = location.split(',');
            const bizExt = (poi.biz_ext || {}) as Record<string, string>;
            const typeStr = (poi.type as string) || '美食';
            const name = (poi.name as string) || '未知店铺';
            // 取最细粒度的分类名（第三级）
            const typeParts = typeStr.split(';');
            const category = typeParts.length >= 3 ? typeParts[2] : typeParts.length >= 2 ? typeParts[1] : typeParts[0];
            const rating = parseFloat(bizExt.rating || '0') || 4 + Math.random() * 0.8;
            const reviewCount = parseInt(bizExt.review_total || '0') || Math.floor(Math.random() * 10000);
            const avgPrice = parseInt(bizExt.cost || '0') || Math.floor(30 + Math.random() * 150);

            return {
              id: `amap-${(poi.id as string) || index}`,
              name,
              category: category || '美食',
              rating: Math.round(rating * 10) / 10,
              reviewCount,
              avgPrice,
              address: (poi.address as string) || [poi.pname as string, poi.cityname as string, poi.adname as string].filter(Boolean).join('') || '',
              distance: parseFloat((poi.distance as string) || '0') / 1000,
              latitude: parseFloat(poiLat),
              longitude: parseFloat(poiLng),
              image: '',
              tags: [],
              source: 'gaode' as const,
              isOnList: true,
              listName: '高德扫街榜',
              listSubCategory: getListSubCategory(category || '美食', rating, avgPrice, reviewCount, name),
              openTime: (bizExt.opentime as string) || (bizExt.opentime2 as string) || '',
            };
          });
        }
      } catch {
        // 高德API调用失败，使用模拟数据
      }
    }

    // 如果没有从API获取到数据，使用模拟数据
    if (shops.length === 0) {
      shops = generateMockShops(lat, lng);
    }

    // 按距离筛选
    shops = shops.filter((shop) => shop.distance <= radius);

    // 排序
    switch (sortBy) {
      case 'rating':
        shops.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviewCount':
        shops.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'distance':
      default:
        shops.sort((a, b) => a.distance - b.distance);
        break;
    }

    return NextResponse.json({
      success: true,
      data: shops,
      total: shops.length,
      center: { latitude: lat, longitude: lng },
      radius,
    });
  } catch {
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}
