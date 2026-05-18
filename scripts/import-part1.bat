@echo off
setlocal enabledelayedexpansion

:: 球馆数据批量导入脚本
:: 每次插入一条记录

echo 开始批量导入球馆数据...

:: 1. 浙大三维网球俱乐部
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"浙大三维网球俱乐部\",\"address\":\"西湖区西溪路161号\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"塑胶复合\",\"courtsCount\":5,\"priceWeekday\":\"白天50元/小时\",\"priceWeekend\":\"晚上70元/小时\",\"priceEvening\":\"70元/小时\",\"phone\":\"0571-87951983\",\"hours\":\"06:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有照明\",\"有休息处\",\"有球具零售\",\"有练习墙\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2614,\"lng\":120.1119}]"

:: 2. 黄龙饭店网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"黄龙饭店网球场\",\"address\":\"西湖区曙光路120号\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"塑胶\",\"courtsCount\":2,\"priceWeekday\":\"白天60元/小时\",\"priceWeekend\":\"晚上60元/小时(灯光免费)\",\"priceEvening\":\"60元/小时\",\"phone\":\"0571-87998833-6446\",\"hours\":\"06:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有照明\",\"有室内休息\",\"高端\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2654,\"lng\":120.1259}]"

:: 3. 陈经纶体校网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"陈经纶体校网球场\",\"address\":\"西湖区黄龙路6号\",\"district\":\"西湖区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":2,\"priceWeekday\":\"30-50元/小时\",\"priceWeekend\":\"50元/小时\",\"priceEvening\":\"50元/小时\",\"phone\":\"0571-87972701\",\"hours\":\"08:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有顶棚\",\"有淋浴\",\"有更衣室\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2684,\"lng\":120.1339}]"

:: 4. 桂花城网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"桂花城网球场\",\"address\":\"西湖区文二路与紫荆花路交叉口\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"塑胶\",\"courtsCount\":2,\"priceWeekday\":\"白天20元/小时\",\"priceWeekend\":\"晚上35元/小时\",\"priceEvening\":\"35元/小时\",\"phone\":\"0571-88474667\",\"hours\":\"06:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有照明\",\"平价\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2574,\"lng\":120.1179}]"

:: 5. 省一队训练网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"省一队训练网球场\",\"address\":\"西湖区\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"塑胶\",\"courtsCount\":3,\"priceWeekday\":\"白天30元/小时\",\"priceWeekend\":\"晚上40元/小时\",\"priceEvening\":\"40元/小时\",\"phone\":\"0571-85094453\",\"hours\":\"08:00-18:00(双休日无预约)\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有照明\",\"专业训练场地\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2534,\"lng\":120.1289}]"

:: 6. 全民健身中心网球馆
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"全民健身中心网球馆\",\"address\":\"上城区钱潮路12号\",\"district\":\"上城区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"40-60元/小时\",\"priceWeekend\":\"60-80元/小时\",\"priceEvening\":\"80元/小时\",\"phone\":\"\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"浙里办\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有照明\",\"有淋浴\",\"政府场馆\"],\"source\":\"大众点评/政府公开\",\"lat\":30.2508,\"lng\":120.1694}]"

:: 7. 乐动力阿里体育中心网球馆
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"乐动力阿里体育中心网球馆\",\"address\":\"上城区九堡阿里体育中心五楼\",\"district\":\"上城区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"50-80元/小时\",\"priceWeekend\":\"80-120元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"乐动力\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有空调\",\"有淋浴\",\"现代化\"],\"source\":\"大众点评/联途\",\"lat\":30.2578,\"lng\":120.1794}]"

:: 8. 浙大城市学院网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"浙大城市学院网球场\",\"address\":\"拱墅区湖州街51号\",\"district\":\"拱墅区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"免费\",\"priceWeekend\":\"免费\",\"priceEvening\":\"免费\",\"phone\":\"\",\"hours\":\"06:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"免费\",\"学校场地\",\"有照明\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.3194,\"lng\":120.1419}]"

:: 9. 凤凰创意国际网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"凤凰创意国际网球场\",\"address\":\"西湖区创意路与灵凤街交叉口南420米\",\"district\":\"西湖区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":2,\"priceWeekday\":\"80-120元/小时\",\"priceWeekend\":\"100-150元/小时\",\"priceEvening\":\"120元/小时\",\"phone\":\"\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有空调\",\"新建场地\",\"有更衣区\"],\"source\":\"活动网\",\"lat\":30.2494,\"lng\":120.1119}]"

:: 10. DJ网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"DJ网球场\",\"address\":\"西湖区浙大森林小镇D2幢109对过\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":2,\"priceWeekday\":\"60-90元/小时\",\"priceWeekend\":\"80-120元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"社区球场\",\"地铁便利\",\"有照明\"],\"source\":\"活动网\",\"lat\":30.2554,\"lng\":120.1069}]"

:: 11. 江南体育中心六和公园网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"江南体育中心六和公园网球场\",\"address\":\"滨江区六和路368号\",\"district\":\"滨江区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"白天40-60元/小时\",\"priceWeekend\":\"晚间70-90元/小时\",\"priceEvening\":\"90元/小时\",\"phone\":\"\",\"hours\":\"06:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"公园环境\",\"地铁便利\",\"公益性\"],\"source\":\"活动网\",\"lat\":30.2086,\"lng\":120.2119}]"

:: 12. 杭州悦动网球
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"杭州悦动网球\",\"address\":\"余杭区\",\"district\":\"余杭区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"80-120元/小时\",\"priceWeekend\":\"100-150元/小时\",\"priceEvening\":\"120元/小时\",\"phone\":\"\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有私教\",\"青少年培训\",\"有照明\"],\"source\":\"活动网\",\"lat\":30.4194,\"lng\":120.2994}]"

:: 13. 西城网球
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"西城网球\",\"address\":\"余杭区五常街道红旗路西溪八方城7幢负一楼\",\"district\":\"余杭区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"60-100元/小时\",\"priceWeekend\":\"80-120元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"15968125586\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"室内\",\"有空调\",\"有淋浴\"],\"source\":\"联途\",\"lat\":30.4094,\"lng\":120.2894}]"

:: 14. 靖安小区网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"靖安小区网球场\",\"address\":\"萧山区靖安小区\",\"district\":\"萧山区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":2,\"priceWeekday\":\"30-50元/小时\",\"priceWeekend\":\"50-70元/小时\",\"priceEvening\":\"50元/小时\",\"phone\":\"\",\"hours\":\"06:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"社区球场\",\"平价\",\"需预约\"],\"source\":\"活动网\",\"lat\":30.1586,\"lng\":120.2644}]"

:: 15. 宇翔网球馆
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"宇翔网球馆\",\"address\":\"萧山区通惠南路455号\",\"district\":\"萧山区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"50-80元/小时\",\"priceWeekend\":\"80-100元/小时\",\"priceEvening\":\"90元/小时\",\"phone\":\"15088788722\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"室内\",\"有空调\",\"有私教\"],\"source\":\"联途\",\"lat\":30.1686,\"lng\":120.2744}]"

:: 16. 2080网球学练馆
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"2080网球学练馆\",\"address\":\"余杭区联创街丽水数字大厦东侧约140米\",\"district\":\"余杭区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":6,\"priceWeekday\":\"80-120元/小时\",\"priceWeekend\":\"100-150元/小时\",\"priceEvening\":\"120元/小时\",\"phone\":\"18072711799\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"学练馆\",\"发球机\",\"有私教\"],\"source\":\"联途\",\"lat\":30.4294,\"lng\":120.3094}]"

:: 17. FIFTEEN LOVE网球学练馆
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"FIFTEEN LOVE网球学练馆\",\"address\":\"萧山区市心北路867号\",\"district\":\"萧山区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"80-120元/小时\",\"priceWeekend\":\"100-150元/小时\",\"priceEvening\":\"120元/小时\",\"phone\":\"19857122396\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"学练馆\",\"发球机\",\"有私教\"],\"source\":\"联途\",\"lat\":30.1786,\"lng\":120.2844}]"

:: 18. 青学草地网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"青学草地网球场\",\"address\":\"拱墅区\",\"district\":\"拱墅区\",\"type\":\"室外\",\"courtType\":\"草地\",\"courtsCount\":2,\"priceWeekday\":\"100-150元/小时\",\"priceWeekend\":\"150-200元/小时\",\"priceEvening\":\"不可用\",\"phone\":\"\",\"hours\":\"06:00-18:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"草地\",\"特色场地\",\"需预约\"],\"source\":\"活动网\",\"lat\":30.3294,\"lng\":120.1519}]"

:: 19. 中奥网球健身俱乐部
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"中奥网球健身俱乐部\",\"address\":\"西湖区曙光路126号\",\"district\":\"西湖区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"40-80元/小时\",\"priceWeekend\":\"60-100元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"0571-87972885\",\"hours\":\"07:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"有健身配套\",\"有私教\",\"老牌场馆\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2634,\"lng\":120.1279}]"

:: 20. 香格里拉饭店网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"香格里拉饭店网球场\",\"address\":\"西湖区北山路78号\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":1,\"priceWeekday\":\"白天60元/小时\",\"priceWeekend\":\"晚上80元/小时\",\"priceEvening\":\"80元/小时\",\"phone\":\"0571-87977951-54\",\"hours\":\"07:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"酒店配套\",\"高端\",\"风景好\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2614,\"lng\":120.1359}]"

echo 批量导入完成！

