# TabBar 图标说明

请在 `miniprogram/images/` 目录下放置以下图标文件：

## 必需的图标文件（建议尺寸 81x81 像素）

1. `tab-home.png` - 首页图标（未选中状态，灰色）
2. `tab-home-active.png` - 首页图标（选中状态，绿色 #16a34a）
3. `tab-venue.png` - 场馆图标（未选中状态）
4. `tab-venue-active.png` - 场馆图标（选中状态）
5. `tab-match.png` - 约球图标（未选中状态）
6. `tab-match-active.png` - 约球图标（选中状态）
7. `tab-profile.png` - 我的图标（未选中状态）
8. `tab-profile-active.png` - 我的图标（选中状态）

## 其他图标

9. `icon-search.png` - 搜索图标（24x24 像素）
10. `default-avatar.png` - 默认头像（100x100 像素）

## 推荐图标来源

- [Iconfont](https://www.iconfont.cn/)
- [IconPark](https://iconpark.oceanengine.com/)
- [Heroicons](https://heroicons.com/)

## 临时解决方案

如果暂时没有图标，可以先使用文字占位，再补齐图标资产：

```json
"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页"
    }
  ]
}
```

去掉 `iconPath` 和 `selectedIconPath` 属性即可只显示文字。
