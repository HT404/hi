# AGENTS.md

## 项目概览
寻味地图 - 整合大众点评和高德扫街榜数据的美食查询网页应用。支持位置定位、距离筛选（1.5km/2km/5km），展示周边上榜美食店铺。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Canvas 地图渲染（纯前端实现）

## 目录结构
```
src/
├── app/
│   ├── api/food/search/route.ts  # 美食搜索API（支持高德API代理+模拟数据）
│   ├── page.tsx                   # 主页面（定位+筛选+地图+列表）
│   ├── layout.tsx                 # 根布局
│   └── globals.css                # 全局样式
├── components/
│   ├── header.tsx                 # 顶部导航
│   ├── food-map.tsx               # Canvas地图组件（店铺标记+距离圈）
│   ├── food-list.tsx              # 美食列表（卡片式展示）
│   ├── distance-filter.tsx        # 距离/排序筛选栏
│   └── location-status.tsx        # 定位状态提示
└── lib/
    ├── types.ts                   # 类型定义
    ├── food-data.ts               # 模拟数据（杭州西湖周边15家店铺）
    └── utils.ts                   # 工具函数
```

## 开发命令
- `pnpm dev` - 启动开发服务
- `pnpm build` - 构建生产版本
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查

## 关键实现
- **定位**：浏览器 Geolocation API，失败时降级至默认位置（杭州西湖 30.259, 120.219）
- **数据**：默认使用模拟数据；配置 `AMAP_API_KEY` 环境变量后可切换为高德真实API
- **地图**：Canvas 绘制，支持 hover 交互显示店铺信息
- **筛选**：距离（1.5/2/5km）+ 排序（距离/评分/人气）
