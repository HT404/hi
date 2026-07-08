import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '寻味地图 - 大众点评×高德扫街榜 上榜美食查询',
  description: '整合大众点评和高德扫街榜数据，发现你身边的上榜美食店铺。支持位置定位、距离筛选，快速查找1.5km-5km范围内的好味道。',
  keywords: ['美食', '大众点评', '高德', '扫街榜', '必吃榜', '附近美食', '美食推荐'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
