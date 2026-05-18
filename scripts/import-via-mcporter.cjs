/**
 * 使用 mcporter 直接导入球馆数据 (逐条插入)
 * 运行方式: node scripts/import-via-mcporter.cjs
 */

const { execSync } = require('child_process');

// 杭州各区大致中心坐标
const DISTRICT_COORDS = {
  '西湖区': { lat: 30.2594, lng: 120.1219 },
  '上城区': { lat: 30.2508, lng: 120.1694 },
  '拱墅区': { lat: 30.3194, lng: 120.1419 },
  '滨江区': { lat: 30.2086, lng: 120.2119 },
  '余杭区': { lat: 30.4194, lng: 120.2994 },
  '萧山区': { lat: 30.1586, lng: 120.2644 },
  '临平区': { lat: 30.4194, lng: 120.3019 },
  '钱塘区': { lat: 30.3194, lng: 120.4994 },
  '富阳区': { lat: 30.0486, lng: 119.9594 },
  '临安区': { lat: 30.2386, lng: 119.7244 },
  '桐庐县': { lat: 29.7986, lng: 119.6894 },
};

// 原始数据
const venuesData = [
  {
    "name": "黄龙体育中心网球场",
    "address": "西湖区黄龙路3号",
    "district": "西湖区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 10,
    "price_weekday": "30-60元/小时",
    "price_weekend": "50元/小时",
    "price_evening": "90元/小时(含灯光)",
    "phone": "0571-87963320",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "动感黄龙",
    "tags": ["有照明", "有休息处", "可预约"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "浙大三维网球俱乐部",
    "address": "西湖区西溪路161号",
    "district": "西湖区",
    "type": "室外",
    "court_type": "塑胶复合",
    "courts_count": 5,
    "price_weekday": "白天50元/小时",
    "price_weekend": "晚上70元/小时",
    "price_evening": "70元/小时",
    "phone": "0571-87951983",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有照明", "有休息处", "有球具零售", "有练习墙"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "黄龙饭店网球场",
    "address": "西湖区曙光路120号",
    "district": "西湖区",
    "type": "室外",
    "court_type": "塑胶",
    "courts_count": 2,
    "price_weekday": "白天60元/小时",
    "price_weekend": "晚上60元/小时(灯光免费)",
    "price_evening": "60元/小时",
    "phone": "0571-87998833-6446",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有照明", "有室内休息", "高端"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "陈经纶体校网球场",
    "address": "西湖区黄龙路6号",
    "district": "西湖区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 2,
    "price_weekday": "30-50元/小时",
    "price_weekend": "50元/小时",
    "price_evening": "50元/小时",
    "phone": "0571-87972701",
    "hours": "08:00-21:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有顶棚", "有淋浴", "有更衣室"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "桂花城网球场",
    "address": "西湖区文二路与紫荆花路交叉口",
    "district": "西湖区",
    "type": "室外",
    "court_type": "塑胶",
    "courts_count": 2,
    "price_weekday": "白天20元/小时",
    "price_weekend": "晚上35元/小时",
    "price_evening": "35元/小时",
    "phone": "0571-88474667",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有照明", "平价"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "省一队训练网球场",
    "address": "西湖区",
    "district": "西湖区",
    "type": "室外",
    "court_type": "塑胶",
    "courts_count": 3,
    "price_weekday": "白天30元/小时",
    "price_weekend": "晚上40元/小时",
    "price_evening": "40元/小时",
    "phone": "0571-85094453",
    "hours": "08:00-18:00(双休日无预约)",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有照明", "专业训练场地"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "全民健身中心网球馆",
    "address": "上城区钱潮路12号",
    "district": "上城区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "40-60元/小时",
    "price_weekend": "60-80元/小时",
    "price_evening": "80元/小时",
    "phone": "",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "浙里办",
    "tags": ["有照明", "有淋浴", "政府场馆"],
    "source": "大众点评/政府公开"
  },
  {
    "name": "乐动力阿里体育中心网球馆",
    "address": "上城区九堡阿里体育中心五楼",
    "district": "上城区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "50-80元/小时",
    "price_weekend": "80-120元/小时",
    "price_evening": "100元/小时",
    "phone": "",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "乐动力",
    "tags": ["有空调", "有淋浴", "现代化"],
    "source": "大众点评/联途"
  },
  {
    "name": "浙大城市学院网球场",
    "address": "拱墅区湖州街51号",
    "district": "拱墅区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "免费",
    "price_weekend": "免费",
    "price_evening": "免费",
    "phone": "",
    "hours": "06:00-21:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["免费", "学校场地", "有照明"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "凤凰创意国际网球场",
    "address": "西湖区创意路与灵凤街交叉口南420米",
    "district": "西湖区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 2,
    "price_weekday": "80-120元/小时",
    "price_weekend": "100-150元/小时",
    "price_evening": "120元/小时",
    "phone": "",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有空调", "新建场地", "有更衣区"],
    "source": "活动网"
  },
  {
    "name": "DJ网球场",
    "address": "西湖区浙大森林小镇D2幢109对过",
    "district": "西湖区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 2,
    "price_weekday": "60-90元/小时",
    "price_weekend": "80-120元/小时",
    "price_evening": "100元/小时",
    "phone": "",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["社区球场", "地铁便利", "有照明"],
    "source": "活动网"
  },
  {
    "name": "江南体育中心六和公园网球场",
    "address": "滨江区六和路368号",
    "district": "滨江区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "白天40-60元/小时",
    "price_weekend": "晚间70-90元/小时",
    "price_evening": "90元/小时",
    "phone": "",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["公园环境", "地铁便利", "公益性"],
    "source": "活动网"
  },
  {
    "name": "杭州悦动网球",
    "address": "余杭区",
    "district": "余杭区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "80-120元/小时",
    "price_weekend": "100-150元/小时",
    "price_evening": "120元/小时",
    "phone": "",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有私教", "青少年培训", "有照明"],
    "source": "活动网"
  },
  {
    "name": "西城网球",
    "address": "余杭区五常街道红旗路西溪八方城7幢负一楼",
    "district": "余杭区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "60-100元/小时",
    "price_weekend": "80-120元/小时",
    "price_evening": "100元/小时",
    "phone": "15968125586",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["室内", "有空调", "有淋浴"],
    "source": "联途"
  },
  {
    "name": "靖安小区网球场",
    "address": "萧山区靖安小区",
    "district": "萧山区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 2,
    "price_weekday": "30-50元/小时",
    "price_weekend": "50-70元/小时",
    "price_evening": "50元/小时",
    "phone": "",
    "hours": "06:00-21:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["社区球场", "平价", "需预约"],
    "source": "活动网"
  },
  {
    "name": "宇翔网球馆",
    "address": "萧山区通惠南路455号",
    "district": "萧山区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "50-80元/小时",
    "price_weekend": "80-100元/小时",
    "price_evening": "90元/小时",
    "phone": "15088788722",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["室内", "有空调", "有私教"],
    "source": "联途"
  },
  {
    "name": "2080网球学练馆",
    "address": "余杭区联创街丽水数字大厦东侧约140米",
    "district": "余杭区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 6,
    "price_weekday": "80-120元/小时",
    "price_weekend": "100-150元/小时",
    "price_evening": "120元/小时",
    "phone": "18072711799",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["学练馆", "发球机", "有私教"],
    "source": "联途"
  },
  {
    "name": "FIFTEEN LOVE网球学练馆",
    "address": "萧山区市心北路867号",
    "district": "萧山区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "80-120元/小时",
    "price_weekend": "100-150元/小时",
    "price_evening": "120元/小时",
    "phone": "19857122396",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["学练馆", "发球机", "有私教"],
    "source": "联途"
  },
  {
    "name": "青学草地网球场",
    "address": "拱墅区",
    "district": "拱墅区",
    "type": "室外",
    "court_type": "草地",
    "courts_count": 2,
    "price_weekday": "100-150元/小时",
    "price_weekend": "150-200元/小时",
    "price_evening": "不可用",
    "phone": "",
    "hours": "06:00-18:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["草地", "特色场地", "需预约"],
    "source": "活动网"
  },
  {
    "name": "中奥网球健身俱乐部",
    "address": "西湖区曙光路126号",
    "district": "西湖区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "40-80元/小时",
    "price_weekend": "60-100元/小时",
    "price_evening": "100元/小时",
    "phone": "0571-87972885",
    "hours": "07:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["有健身配套", "有私教", "老牌场馆"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "香格里拉饭店网球场",
    "address": "西湖区北山路78号",
    "district": "西湖区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 1,
    "price_weekday": "白天60元/小时",
    "price_weekend": "晚上80元/小时",
    "price_evening": "80元/小时",
    "phone": "0571-87977951-54",
    "hours": "07:00-21:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["酒店配套", "高端", "风景好"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "航模俱乐部网球场",
    "address": "上城区艮山西路401号城东公园",
    "district": "上城区",
    "type": "室外",
    "court_type": "塑胶",
    "courts_count": 2,
    "price_weekday": "白天30元/小时",
    "price_weekend": "晚上50元/小时",
    "price_evening": "40-50元/小时",
    "phone": "0571-85095965-815",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["公园环境", "有照明", "有遮阳"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "西湖文体中心网球场",
    "address": "西湖区晴川街217号",
    "district": "西湖区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "50-80元/小时",
    "price_weekend": "80-120元/小时",
    "price_evening": "100元/小时",
    "phone": "0571-85109988",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "西湖文体",
    "tags": ["政府场馆", "有空调", "有停车"],
    "source": "政府公开信息"
  },
  {
    "name": "三墩文体中心网球场",
    "address": "西湖区三墩镇紫金港北路",
    "district": "西湖区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 2,
    "price_weekday": "40-60元/小时",
    "price_weekend": "60-80元/小时",
    "price_evening": "80元/小时",
    "phone": "",
    "hours": "09:00-21:00",
    "booking_url": "",
    "booking_mini_program": "西湖文体",
    "tags": ["社区文体中心", "价格亲民"],
    "source": "政府公开信息"
  },
  {
    "name": "拱墅运河亚运公园网球场",
    "address": "拱墅区丰潭路",
    "district": "拱墅区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "30-50元/小时",
    "price_weekend": "50-70元/小时",
    "price_evening": "60元/小时",
    "phone": "",
    "hours": "06:00-22:00",
    "booking_url": "",
    "booking_mini_program": "浙里办",
    "tags": ["亚运场馆", "公园环境", "地铁直达"],
    "source": "政府公开信息"
  },
  {
    "name": "城北体育公园网球场",
    "address": "拱墅区白石路",
    "district": "拱墅区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "30-50元/小时",
    "price_weekend": "50-70元/小时",
    "price_evening": "60元/小时",
    "phone": "",
    "hours": "06:00-21:00",
    "booking_url": "",
    "booking_mini_program": "浙里办",
    "tags": ["公园环境", "有照明", "免费停车"],
    "source": "政府公开信息"
  },
  {
    "name": "九堡阿里体育中心网球场",
    "address": "上城区九堡街道",
    "district": "上城区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 6,
    "price_weekday": "60-90元/小时",
    "price_weekend": "90-120元/小时",
    "price_evening": "120元/小时",
    "phone": "",
    "hours": "09:00-22:00",
    "booking_url": "",
    "booking_mini_program": "乐动力",
    "tags": ["大型场馆", "有空调", "有淋浴", "地铁直达"],
    "source": "大众点评/联途"
  },
  {
    "name": "杭州奥体中心网球中心",
    "address": "滨江区飞虹路",
    "district": "滨江区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 12,
    "price_weekday": "50-80元/小时",
    "price_weekend": "80-120元/小时",
    "price_evening": "100元/小时",
    "phone": "",
    "hours": "07:00-22:00",
    "booking_url": "",
    "booking_mini_program": "浙里办",
    "tags": ["亚运场馆", "国际赛事场地", "有照明"],
    "source": "政府公开信息"
  },
  {
    "name": "滨江区体育馆网球场",
    "address": "滨江区江虹路",
    "district": "滨江区",
    "type": "室内",
    "court_type": "硬地",
    "courts_count": 4,
    "price_weekday": "50-80元/小时",
    "price_weekend": "80-100元/小时",
    "price_evening": "100元/小时",
    "phone": "",
    "hours": "09:00-21:00",
    "booking_url": "",
    "booking_mini_program": "浙里办",
    "tags": ["政府场馆", "有空调", "有停车"],
    "source": "政府公开信息"
  },
  {
    "name": "金溪山庄网球场",
    "address": "西湖区杨公堤39号",
    "district": "西湖区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 1,
    "price_weekday": "白天60元/小时",
    "price_weekend": "晚上60元/小时",
    "price_evening": "60元/小时",
    "phone": "0571-87992288-6701",
    "hours": "07:00-21:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["酒店配套", "西湖景区", "风景优美"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "杭州西湖国宾馆网球中心",
    "address": "西湖区杨公堤18号",
    "district": "西湖区",
    "type": "室外",
    "court_type": "硬地",
    "courts_count": 2,
    "price_weekday": "80-120元/小时",
    "price_weekend": "120-150元/小时",
    "price_evening": "150元/小时",
    "phone": "0571-87979889",
    "hours": "08:00-20:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["国宾馆配套", "高端", "西湖景区"],
    "source": "大众点评/百度贴吧"
  },
  {
    "name": "亲亲家园网球场",
    "address": "余杭区三墩镇北古墩路",
    "district": "余杭区",
    "type": "室外",
    "court_type": "塑胶",
    "courts_count": 2,
    "price_weekday": "白天30元/小时",
    "price_weekend": "晚上50元/小时",
    "price_evening": "50元/小时",
    "phone": "0571-89003232",
    "hours": "06:00-21:00",
    "booking_url": "",
    "booking_mini_program": "",
    "tags": ["社区球场", "平价", "有照明"],
    "source": "大众点评/百度贴吧"
  }
];

// 转换为数据库格式
function transformVenue(venue, index) {
  const coords = DISTRICT_COORDS[venue.district] || DISTRICT_COORDS['西湖区'];
  // 固定偏移基于索引，保证可重复性
  const latOffset = (((index * 7) % 100) - 50) / 5000;
  const lngOffset = (((index * 11) % 100) - 50) / 5000;
  
  const now = new Date().toISOString();
  
  return {
    name: venue.name,
    address: venue.address,
    district: venue.district,
    type: venue.type,
    courtType: venue.court_type,
    courtsCount: venue.courts_count,
    priceWeekday: venue.price_weekday,
    priceWeekend: venue.price_weekend,
    priceEvening: venue.price_evening,
    phone: venue.phone,
    hours: venue.hours,
    bookingUrl: venue.booking_url,
    bookingMiniProgram: venue.booking_mini_program,
    bookingAppId: "",
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

function insertVenue(venue, index) {
  const dbVenue = transformVenue(venue, index);
  
  // 将 documents 构建为 JSON 字符串 (不是数组，而是对象)
  const documentsJson = JSON.stringify([dbVenue]);
  
  // 构建命令 - 使用单独的参数
  const cmd = `npx mcporter call cloudbase writeNoSqlDatabaseContent --action insert --collectionName venues --documents ${JSON.stringify(documentsJson)}`;
  
  try {
    const result = execSync(cmd, { 
      encoding: 'utf-8', 
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`[${index + 1}/${venuesData.length}] 成功: ${venue.name}`);
    return true;
  } catch (error) {
    console.error(`[${index + 1}/${venuesData.length}] 失败: ${venue.name}`);
    return false;
  }
}

function main() {
  console.log(`开始导入 ${venuesData.length} 条球馆数据...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < venuesData.length; i++) {
    const success = insertVenue(venuesData[i], i);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n=============================');
  console.log(`导入完成!`);
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${failCount} 条`);
  console.log('=============================');
}

main();
