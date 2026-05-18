@echo off
setlocal enabledelayedexpansion

:: 球馆数据批量导入脚本 - Part 2
echo 继续批量导入球馆数据...

:: 21. 航模俱乐部网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"航模俱乐部网球场\",\"address\":\"上城区艮山西路401号城东公园\",\"district\":\"上城区\",\"type\":\"室外\",\"courtType\":\"塑胶\",\"courtsCount\":2,\"priceWeekday\":\"白天30元/小时\",\"priceWeekend\":\"晚上50元/小时\",\"priceEvening\":\"40-50元/小时\",\"phone\":\"0571-85095965-815\",\"hours\":\"06:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"公园环境\",\"有照明\",\"有遮阳\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2608,\"lng\":120.1894}]"

:: 22. 西湖文体中心网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"西湖文体中心网球场\",\"address\":\"西湖区晴川街217号\",\"district\":\"西湖区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"50-80元/小时\",\"priceWeekend\":\"80-120元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"0571-85109988\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"西湖文体\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"政府场馆\",\"有空调\",\"有停车\"],\"source\":\"政府公开信息\",\"lat\":30.2494,\"lng\":120.1119}]"

:: 23. 三墩文体中心网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"三墩文体中心网球场\",\"address\":\"西湖区三墩镇紫金港北路\",\"district\":\"西湖区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":2,\"priceWeekday\":\"40-60元/小时\",\"priceWeekend\":\"60-80元/小时\",\"priceEvening\":\"80元/小时\",\"phone\":\"\",\"hours\":\"09:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"西湖文体\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"社区文体中心\",\"价格亲民\"],\"source\":\"政府公开信息\",\"lat\":30.2794,\"lng\":120.0919}]"

:: 24. 拱墅运河亚运公园网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"拱墅运河亚运公园网球场\",\"address\":\"拱墅区丰潭路\",\"district\":\"拱墅区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"30-50元/小时\",\"priceWeekend\":\"50-70元/小时\",\"priceEvening\":\"60元/小时\",\"phone\":\"\",\"hours\":\"06:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"浙里办\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"亚运场馆\",\"公园环境\",\"地铁直达\"],\"source\":\"政府公开信息\",\"lat\":30.3094,\"lng\":120.1319}]"

:: 25. 城北体育公园网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"城北体育公园网球场\",\"address\":\"拱墅区白石路\",\"district\":\"拱墅区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"30-50元/小时\",\"priceWeekend\":\"50-70元/小时\",\"priceEvening\":\"60元/小时\",\"phone\":\"\",\"hours\":\"06:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"浙里办\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"公园环境\",\"有照明\",\"免费停车\"],\"source\":\"政府公开信息\",\"lat\":30.3394,\"lng\":120.1619}]"

:: 26. 九堡阿里体育中心网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"九堡阿里体育中心网球场\",\"address\":\"上城区九堡街道\",\"district\":\"上城区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":6,\"priceWeekday\":\"60-90元/小时\",\"priceWeekend\":\"90-120元/小时\",\"priceEvening\":\"120元/小时\",\"phone\":\"\",\"hours\":\"09:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"乐动力\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"大型场馆\",\"有空调\",\"有淋浴\",\"地铁直达\"],\"source\":\"大众点评/联途\",\"lat\":30.2708,\"lng\":120.1994}]"

:: 27. 杭州奥体中心网球中心
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"杭州奥体中心网球中心\",\"address\":\"滨江区飞虹路\",\"district\":\"滨江区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":12,\"priceWeekday\":\"50-80元/小时\",\"priceWeekend\":\"80-120元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"\",\"hours\":\"07:00-22:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"浙里办\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"亚运场馆\",\"国际赛事场地\",\"有照明\"],\"source\":\"政府公开信息\",\"lat\":30.1986,\"lng\":120.2019}]"

:: 28. 滨江区体育馆网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"滨江区体育馆网球场\",\"address\":\"滨江区江虹路\",\"district\":\"滨江区\",\"type\":\"室内\",\"courtType\":\"硬地\",\"courtsCount\":4,\"priceWeekday\":\"50-80元/小时\",\"priceWeekend\":\"80-100元/小时\",\"priceEvening\":\"100元/小时\",\"phone\":\"\",\"hours\":\"09:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"浙里办\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"政府场馆\",\"有空调\",\"有停车\"],\"source\":\"政府公开信息\",\"lat\":30.2186,\"lng\":120.2219}]"

:: 29. 金溪山庄网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"金溪山庄网球场\",\"address\":\"西湖区杨公堤39号\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":1,\"priceWeekday\":\"白天60元/小时\",\"priceWeekend\":\"晚上60元/小时\",\"priceEvening\":\"60元/小时\",\"phone\":\"0571-87992288-6701\",\"hours\":\"07:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"酒店配套\",\"西湖景区\",\"风景优美\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2394,\"lng\":120.1019}]"

:: 30. 杭州西湖国宾馆网球中心
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"杭州西湖国宾馆网球中心\",\"address\":\"西湖区杨公堤18号\",\"district\":\"西湖区\",\"type\":\"室外\",\"courtType\":\"硬地\",\"courtsCount\":2,\"priceWeekday\":\"80-120元/小时\",\"priceWeekend\":\"120-150元/小时\",\"priceEvening\":\"150元/小时\",\"phone\":\"0571-87979889\",\"hours\":\"08:00-20:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"国宾馆配套\",\"高端\",\"西湖景区\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.2434,\"lng\":120.1079}]"

:: 31. 亲亲家园网球场
call npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents "[{\"name\":\"亲亲家园网球场\",\"address\":\"余杭区三墩镇北古墩路\",\"district\":\"余杭区\",\"type\":\"室外\",\"courtType\":\"塑胶\",\"courtsCount\":2,\"priceWeekday\":\"白天30元/小时\",\"priceWeekend\":\"晚上50元/小时\",\"priceEvening\":\"50元/小时\",\"phone\":\"0571-89003232\",\"hours\":\"06:00-21:00\",\"bookingUrl\":\"\",\"bookingMiniProgram\":\"\",\"bookingAppId\":\"\",\"bookingPagePath\":\"\",\"bookingUrlLink\":\"\",\"tags\":[\"社区球场\",\"平价\",\"有照明\"],\"source\":\"大众点评/百度贴吧\",\"lat\":30.3994,\"lng\":120.2794}]"

echo 所有数据导入完成！

