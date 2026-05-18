// 生成球馆导入数据
// 运行: node scripts/gen-import-data.cjs > scripts/venues-to-import.json

const DISTRICT_COORDS = {
  '西湖区': { lat: 30.2594, lng: 120.1219 },
  '上城区': { lat: 30.2508, lng: 120.1694 },
  '拱墅区': { lat: 30.3194, lng: 120.1419 },
  '滨江区': { lat: 30.2086, lng: 120.2119 },
  '余杭区': { lat: 30.4194, lng: 120.2994 },
  '萧山区': { lat: 30.1586, lng: 120.2644 },
  '临平区': { lat: 30.4186, lng: 120.3019 },
  '钱塘区': { lat: 30.3086, lng: 120.4919 },
};

const venuesData = [
  // 1. 黄龙体育中心网球场 (已导入，作为参照)
  {"name":"黄龙体育中心网球场","featured":true,"address":"西湖区黄龙路3号","district":"西湖区","type":"室外","court_type":"硬地","courts_count":10,"price_weekday":"30-60元/小时","price_weekend":"50元/小时","price_evening":"90元/小时(含灯光)","phone":"0571-87963320","hours":"06:00-22:00","booking_mini_program":"动感黄龙","booking_app_id":"wx6ecc186775895db1","tags":["有照明","有休息处","可预约"],"source":"大众点评/百度贴吧"},
  // 2
  {"name":"浙大三维网球俱乐部","featured":false,"address":"西湖区西溪路161号","district":"西湖区","type":"室外","court_type":"塑胶复合","courts_count":5,"price_weekday":"白天50元/小时","price_weekend":"晚上70元/小时","price_evening":"70元/小时","phone":"0571-87951983","hours":"06:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有照明","有休息处","有球具零售","有练习墙"],"source":"大众点评/百度贴吧"},
  // 3
  {"name":"黄龙饭店网球场","featured":true,"address":"西湖区曙光路120号","district":"西湖区","type":"室外","court_type":"塑胶","courts_count":2,"price_weekday":"白天60元/小时","price_weekend":"晚上60元/小时(灯光免费)","price_evening":"60元/小时","phone":"0571-87998833-6446","hours":"06:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有照明","有室内休息","高端"],"source":"大众点评/百度贴吧"},
  // 4
  {"name":"陈经纶体校网球场","featured":false,"address":"西湖区黄龙路6号","district":"西湖区","type":"室内","court_type":"硬地","courts_count":2,"price_weekday":"30-50元/小时","price_weekend":"50元/小时","price_evening":"50元/小时","phone":"0571-87972701","hours":"08:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["有顶棚","有淋浴","有更衣室"],"source":"大众点评/百度贴吧"},
  // 5
  {"name":"桂花城网球场","featured":false,"address":"西湖区文二路与紫荆花路交叉口","district":"西湖区","type":"室外","court_type":"塑胶","courts_count":2,"price_weekday":"白天20元/小时","price_weekend":"晚上35元/小时","price_evening":"35元/小时","phone":"0571-88474667","hours":"06:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有照明","平价"],"source":"大众点评/百度贴吧"},
  // 6
  {"name":"省一队训练网球场","featured":false,"address":"西湖区","district":"西湖区","type":"室外","court_type":"塑胶","courts_count":3,"price_weekday":"白天30元/小时","price_weekend":"晚上40元/小时","price_evening":"40元/小时","phone":"0571-85094453","hours":"08:00-18:00(双休日无预约)","booking_mini_program":"","booking_app_id":"","tags":["有照明","专业训练场地"],"source":"大众点评/百度贴吧"},
  // 7
  {"name":"全民健身中心网球馆","featured":false,"address":"上城区钱潮路12号","district":"上城区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"40-60元/小时","price_weekend":"60-80元/小时","price_evening":"80元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"浙里办","booking_app_id":"wx6ecc186775895db1","tags":["有照明","有淋浴","政府场馆"],"source":"大众点评/政府公开"},
  // 8
  {"name":"乐动力阿里体育中心网球馆","featured":false,"address":"上城区九堡阿里体育中心五楼","district":"上城区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"50-80元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"乐动力","booking_app_id":"wx6ecc186775895db1","tags":["有空调","有淋浴","现代化"],"source":"大众点评/联途"},
  // 9
  {"name":"浙大城市学院网球场","featured":true,"address":"拱墅区湖州街51号","district":"拱墅区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"免费","price_weekend":"免费","price_evening":"免费","phone":"","hours":"06:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["免费","学校场地","有照明"],"source":"大众点评/百度贴吧"},
  // 10
  {"name":"凤凰创意国际网球场","featured":false,"address":"西湖区创意路与灵凤街交叉口南420米","district":"西湖区","type":"室内","court_type":"硬地","courts_count":2,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有空调","新建场地","有更衣区"],"source":"活动网"},
  // 11
  {"name":"DJ网球场","featured":false,"address":"西湖区浙大森林小镇D2幢109对过","district":"西湖区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"60-90元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["社区球场","地铁便利","有照明"],"source":"活动网"},
  // 12
  {"name":"江南体育中心六和公园网球场","featured":false,"address":"滨江区六和路368号","district":"滨江区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"白天40-60元/小时","price_weekend":"晚间70-90元/小时","price_evening":"90元/小时","phone":"","hours":"06:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["公园环境","地铁便利","公益性"],"source":"活动网"},
  // 13
  {"name":"杭州悦动网球","featured":false,"address":"余杭区","district":"余杭区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有私教","青少年培训","有照明"],"source":"活动网"},
  // 14
  {"name":"西城网球","featured":false,"address":"余杭区五常街道红旗路西溪八方城7幢负一楼","district":"余杭区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"60-100元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"15968125586","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["室内","有空调","有淋浴"],"source":"联途"},
  // 15
  {"name":"靖安小区网球场","featured":false,"address":"萧山区靖安小区","district":"萧山区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"30-50元/小时","price_weekend":"50-70元/小时","price_evening":"50元/小时","phone":"","hours":"06:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["社区球场","平价","需预约"],"source":"活动网"},
  // 16
  {"name":"宇翔网球馆","featured":false,"address":"萧山区通惠南路455号","district":"萧山区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"50-80元/小时","price_weekend":"80-100元/小时","price_evening":"90元/小时","phone":"15088788722","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["室内","有空调","有私教"],"source":"联途"},
  // 17
  {"name":"2080网球学练馆","featured":true,"address":"余杭区联创街丽水数字大厦东侧约140米","district":"余杭区","type":"室内","court_type":"硬地","courts_count":6,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"18072711799","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["学练馆","发球机","有私教"],"source":"联途"},
  // 18
  {"name":"FIFTEEN LOVE网球学练馆","featured":true,"address":"萧山区市心北路867号","district":"萧山区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"19857122396","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["学练馆","发球机","有私教"],"source":"联途"},
  // 19
  {"name":"青学草地网球场","featured":true,"address":"拱墅区","district":"拱墅区","type":"室外","court_type":"草地","courts_count":2,"price_weekday":"100-150元/小时","price_weekend":"150-200元/小时","price_evening":"不可用","phone":"","hours":"06:00-18:00","booking_mini_program":"","booking_app_id":"","tags":["草地","特色场地","需预约"],"source":"活动网"},
  // 20
  {"name":"中奥网球健身俱乐部","featured":false,"address":"西湖区曙光路126号","district":"西湖区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"40-80元/小时","price_weekend":"60-100元/小时","price_evening":"100元/小时","phone":"0571-87972885","hours":"07:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有健身配套","有私教","老牌场馆"],"source":"大众点评/百度贴吧"},
  // 21
  {"name":"香格里拉饭店网球场","featured":true,"address":"西湖区北山路78号","district":"西湖区","type":"室外","court_type":"硬地","courts_count":1,"price_weekday":"白天60元/小时","price_weekend":"晚上80元/小时","price_evening":"80元/小时","phone":"0571-87977951-54","hours":"07:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["酒店配套","高端","风景好"],"source":"大众点评/百度贴吧"},
  // 22
  {"name":"航模俱乐部网球场","featured":false,"address":"上城区艮山西路401号城东公园","district":"上城区","type":"室外","court_type":"塑胶","courts_count":2,"price_weekday":"白天30元/小时","price_weekend":"晚上50元/小时","price_evening":"40-50元/小时","phone":"0571-85095965-815","hours":"06:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["公园环境","有照明","有遮阳"],"source":"大众点评/百度贴吧"},
  // 23
  {"name":"西湖文体中心网球场","featured":false,"address":"西湖区晴川街217号","district":"西湖区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"50-80元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"0571-85109988","hours":"09:00-22:00","booking_mini_program":"西湖文体","booking_app_id":"wx6ecc186775895db1","tags":["政府场馆","有空调","有停车"],"source":"政府公开信息"},
  // 24
  {"name":"三墩文体中心网球场","featured":false,"address":"西湖区三墩镇紫金港北路","district":"西湖区","type":"室内","court_type":"硬地","courts_count":2,"price_weekday":"40-60元/小时","price_weekend":"60-80元/小时","price_evening":"80元/小时","phone":"","hours":"09:00-21:00","booking_mini_program":"西湖文体","booking_app_id":"wx6ecc186775895db1","tags":["社区文体中心","价格亲民"],"source":"政府公开信息"},
  // 25
  {"name":"拱墅运河亚运公园网球场","featured":true,"address":"拱墅区丰潭路","district":"拱墅区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"30-50元/小时","price_weekend":"50-70元/小时","price_evening":"60元/小时","phone":"","hours":"06:00-22:00","booking_mini_program":"浙里办","booking_app_id":"wx6ecc186775895db1","tags":["亚运场馆","公园环境","地铁直达"],"source":"政府公开信息"},
  // 26
  {"name":"城北体育公园网球场","featured":true,"address":"拱墅区白石路","district":"拱墅区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"30-50元/小时","price_weekend":"50-70元/小时","price_evening":"60元/小时","phone":"","hours":"06:00-21:00","booking_mini_program":"浙里办","booking_app_id":"wx6ecc186775895db1","tags":["公园环境","有照明","免费停车"],"source":"政府公开信息"},
  // 27
  {"name":"九堡阿里体育中心网球场","featured":false,"address":"上城区九堡街道","district":"上城区","type":"室内","court_type":"硬地","courts_count":6,"price_weekday":"60-90元/小时","price_weekend":"90-120元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"乐动力","booking_app_id":"wx6ecc186775895db1","tags":["大型场馆","有空调","有淋浴","地铁直达"],"source":"大众点评/联途"},
  // 28
  {"name":"杭州奥体中心网球中心","featured":true,"address":"滨江区飞虹路","district":"滨江区","type":"室外","court_type":"硬地","courts_count":12,"price_weekday":"50-80元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"18858125255","hours":"07:00-22:00","booking_mini_program":"浙里办","booking_app_id":"wx6ecc186775895db1","tags":["亚运场馆","国际赛事场地","有照明"],"source":"政府公开信息"},
  // 29
  {"name":"滨江区体育馆网球场","featured":false,"address":"滨江区江虹路","district":"滨江区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"50-80元/小时","price_weekend":"80-100元/小时","price_evening":"100元/小时","phone":"0571-86681091","hours":"09:00-21:00","booking_mini_program":"浙里办","booking_app_id":"","tags":["政府场馆","有空调","有停车"],"source":"政府公开信息"},
  // 30
  {"name":"金溪山庄网球场","featured":true,"address":"西湖区杨公堤39号","district":"西湖区","type":"室外","court_type":"硬地","courts_count":1,"price_weekday":"白天60元/小时","price_weekend":"晚上60元/小时","price_evening":"60元/小时","phone":"0571-87992288-6701","hours":"07:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["酒店配套","西湖景区","风景优美"],"source":"大众点评/百度贴吧"},
  // 31
  {"name":"杭州西湖国宾馆网球中心","featured":true,"address":"西湖区杨公堤18号","district":"西湖区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"80-120元/小时","price_weekend":"120-150元/小时","price_evening":"150元/小时","phone":"0571-87979889","hours":"08:00-20:00","booking_mini_program":"","booking_app_id":"","tags":["国宾馆配套","高端","西湖景区"],"source":"大众点评/百度贴吧"},
  // 32
  {"name":"亲亲家园网球场","featured":false,"address":"余杭区三墩镇北古墩路","district":"余杭区","type":"室外","court_type":"塑胶","courts_count":2,"price_weekday":"白天30元/小时","price_weekend":"晚上50元/小时","price_evening":"50元/小时","phone":"0571-89003232","hours":"06:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["社区球场","平价","有照明"],"source":"大众点评/百度贴吧"},
  // 33
  {"name":"乐网网球俱乐部(滨江店)","featured":true,"address":"滨江区聚园路9号民生峰达生命科技园B幢三楼","district":"滨江区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"19557184275","hours":"09:00-22:00","booking_mini_program":"乐网球","booking_app_id":"","tags":["有发球机","有私教","停车方便"],"source":"大众点评"},
  // 34
  {"name":"元谷网球中心","featured":false,"address":"拱墅区长乐路29号","district":"拱墅区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有空调","地铁便利","专业场地"],"source":"活动网"},
  // 35
  {"name":"弥诺网球俱乐部(世贸中心店)","featured":true,"address":"西湖区曙光路122号世贸君澜大酒店D座4楼","district":"西湖区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"120-180元/小时","price_weekend":"160-220元/小时","price_evening":"180元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"弥诺网球","booking_app_id":"","tags":["高端酒店","西湖景观","有私教"],"source":"大众点评"},
  // 36
  {"name":"弥诺网球俱乐部(未来科技城店)","featured":false,"address":"余杭区华一路3-1号幢203室","district":"余杭区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"弥诺网球","booking_app_id":"","tags":["室内","有空调","有私教"],"source":"大众点评"},
  // 37
  {"name":"世纪城星体网球中心","featured":false,"address":"萧山区盈丰通文路与盈新路交叉口","district":"萧山区","type":"室外","court_type":"硬地","courts_count":6,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"08:00-22:00","booking_mini_program":"星体运动","booking_app_id":"","tags":["有室内外场地","有私教","地铁便利"],"source":"大众点评"},
  // 38
  {"name":"西溪国际网球中心","featured":false,"address":"西湖区瑞和巷33号","district":"西湖区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"80-100元/小时","price_weekend":"120-150元/小时","price_evening":"130元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["靠近西溪湿地","环境优美","有私教"],"source":"活动网"},
  // 39
  {"name":"丁兰体育公园网球馆","featured":false,"address":"上城区长睦路与白马庄街交叉口","district":"上城区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"40-60元/小时","price_weekend":"70-90元/小时","price_evening":"80元/小时","phone":"","hours":"09:00-21:30","booking_mini_program":"浙里办","booking_app_id":"","tags":["公园环境","公益性","需预约"],"source":"政府公开信息"},
  // 40
  {"name":"T点(T-line)网球俱乐部(城西银泰店)","featured":true,"address":"拱墅区余杭塘路478号海蓝创智天地内量子方二楼户外平台","district":"拱墅区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"60-100元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["屋顶球场","地铁便利","有私教"],"source":"大众点评"},
  // 41
  {"name":"星辰网球培训中心(蓝谷店)","featured":false,"address":"余杭区蓝谷科创园1幢3楼","district":"余杭区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["室内","有空调","有私教"],"source":"大众点评"},
  // 42
  {"name":"快网网球俱乐部(金绣国际店)","featured":false,"address":"滨江区金绣国际科技中心","district":"滨江区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"80-120元/小时","price_weekend":"100-150元/小时","price_evening":"120元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["有私教","青少年培训","有空调"],"source":"大众点评"},
  // 43
  {"name":"杭州阿蓝网球俱乐部(临平店)","featured":false,"address":"临平区映荷路371号","district":"临平区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"50-80元/小时","price_weekend":"70-100元/小时","price_evening":"90元/小时","phone":"","hours":"08:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["有私教","青少年培训","有照明"],"source":"大众点评"},
  // 44
  {"name":"致胜网球(滨江聚光中心店)","featured":true,"address":"滨江区阡陌路459号聚光中心C1座9楼","district":"滨江区","type":"室内","court_type":"硬地","courts_count":2,"price_weekday":"120-150元/小时","price_weekend":"180-220元/小时","price_evening":"200元/小时","phone":"13588355486","hours":"09:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["高层场馆","有私教","视野开阔"],"source":"大众点评"},
  // 45
  {"name":"鼎尖网球俱乐部(万福中心店)","featured":true,"address":"滨江区万福中心C座3楼楼顶","district":"滨江区","type":"室外","court_type":"硬地","courts_count":2,"price_weekday":"80-120元/小时","price_weekend":"120-160元/小时","price_evening":"140元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"鼎尖网球","booking_app_id":"","tags":["屋顶球场","地铁江晖路站","有淋浴"],"source":"大众点评"},
  // 46
  {"name":"活跃网球(滨江IX-WORK店)","featured":true,"address":"滨江区滨安路650号IX-WORK大厦B座9层","district":"滨江区","type":"室内","court_type":"硬地","courts_count":2,"price_weekday":"80-120元/小时","price_weekend":"130-160元/小时","price_evening":"150元/小时","phone":"","hours":"09:00-22:00","booking_mini_program":"活跃网球","booking_app_id":"","tags":["高层场馆","有淋浴","有私教"],"source":"大众点评"},
  // 47
  {"name":"鹏迈网球","featured":true,"address":"拱墅区费家塘路588号","district":"拱墅区","type":"室内","court_type":"硬地","courts_count":8,"price_weekday":"100-150元/小时","price_weekend":"120-180元/小时","price_evening":"150元/小时","phone":"19101776151","hours":"08:00-22:00","booking_mini_program":"","booking_app_id":"","tags":["8片标准场地","有私教","有更衣室"],"source":"大众点评"},
  // 48
  {"name":"健乐网球俱乐部","featured":false,"address":"滨江区白马湖会展中心B馆负一楼","district":"滨江区","type":"室内","court_type":"硬地","courts_count":4,"price_weekday":"60-90元/小时","price_weekend":"80-120元/小时","price_evening":"100元/小时","phone":"","hours":"09:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["会展配套","有私教","场地宽敞"],"source":"大众点评"},
  // 49
  {"name":"南都德加网球场","featured":false,"address":"西湖区文二西路369号","district":"西湖区","type":"室外","court_type":"塑胶","courts_count":2,"price_weekday":"30-50元/小时","price_weekend":"50-70元/小时","price_evening":"60元/小时","phone":"0571-88973900","hours":"06:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["社区球场","有照明","平价"],"source":"大众点评"},
  // 50
  {"name":"浙大紫金港校区网球场","featured":true,"address":"余杭区浙大紫金港校区","district":"余杭区","type":"室外","court_type":"硬地","courts_count":6,"price_weekday":"免费-20元/小时","price_weekend":"20-40元/小时","price_evening":"40元/小时","phone":"","hours":"06:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["学校场地","有练习墙","有照明"],"source":"大众点评"},
  // 51
  {"name":"浙大西溪校区网球场","featured":true,"address":"西湖区天目山路148号","district":"西湖区","type":"室外","court_type":"水泥","courts_count":3,"price_weekday":"5-10元/小时","price_weekend":"10-20元/小时","price_evening":"不可用","phone":"","hours":"06:00-18:00","booking_mini_program":"","booking_app_id":"","tags":["学校场地","有练习墙","平价"],"source":"大众点评"},
  // 52
  {"name":"杭州师范大学钱江学院网球场","featured":true,"address":"钱塘区文一路222号","district":"钱塘区","type":"室外","court_type":"硬地","courts_count":4,"price_weekday":"免费","price_weekend":"免费","price_evening":"免费","phone":"","hours":"06:00-21:00","booking_mini_program":"","booking_app_id":"","tags":["学校场地","免费","有照明"],"source":"大众点评"},
  // 53
  {"name":"浙江工业大学网球场","featured":true,"address":"拱墅区潮王路18号","district":"拱墅区","type":"室外","court_type":"水泥","courts_count":2,"price_weekday":"5元/小时","price_weekend":"5元/小时","price_evening":"不可用","phone":"","hours":"06:00-18:00","booking_mini_program":"","booking_app_id":"","tags":["学校场地","极平价","有照明"],"source":"大众点评"}
];

function transformVenue(venue, index) {
  const coords = DISTRICT_COORDS[venue.district] || DISTRICT_COORDS['西湖区'];
  // 使用更分散的偏移，避免重叠
  const latOffset = (((index * 7 + index * index) % 200) - 100) / 8000;
  const lngOffset = (((index * 11 + index * index) % 200) - 100) / 8000;
  const now = new Date().toISOString();
  
  return {
    name: venue.name,
    featured: venue.featured || false,
    address: venue.address,
    district: venue.district,
    type: venue.type,
    courtType: venue.court_type,
    courtsCount: venue.courts_count,
    priceWeekday: venue.price_weekday,
    priceWeekend: venue.price_weekend,
    priceEvening: venue.price_evening,
    phone: venue.phone || "",
    hours: venue.hours,
    bookingUrl: "",
    bookingMiniProgram: venue.booking_mini_program || "",
    bookingAppId: venue.booking_app_id || "",
    bookingPagePath: "",
    bookingUrlLink: "",
    tags: venue.tags,
    source: venue.source,
    lat: coords.lat + latOffset,
    lng: coords.lng + lngOffset,
    createdAt: now,
    updatedAt: now
  };
}

// 生成所有文档
const allDocs = venuesData.map((v, i) => transformVenue(v, i));

// 输出用于手动导入的 JSON
console.log(JSON.stringify(allDocs, null, 2));
