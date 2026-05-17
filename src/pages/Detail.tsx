import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { useVenueSync } from '@/hooks/useVenueSync';
import NavigationSheet from '@/components/NavigationSheet';
import {
  ArrowLeft, MapPin, Phone, Clock, DollarSign, Tag,
  ExternalLink, MessageCircle, Navigation,
  Copy, Search, X,
} from 'lucide-react';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { venues, loading } = useVenueSync();
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const [bookingGuideOpen, setBookingGuideOpen] = useState(false);

  const venue = venues.find(v => v.id === Number(id));

  // 检测运行环境
  const getEnvironment = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isWeixin = /micromessenger/i.test(ua);
    const isMobile = /(iphone|android|mobile)/i.test(ua);
    return { isWeixin, isMobile };
  };

  // 外部浏览器用 URL Scheme 唤起微信
  const tryScheme = (appid: string, path: string) => {
    const scheme = `weixin://dl/business/?appid=${appid}${path ? '&path=' + encodeURIComponent(path) : ''}`;
    window.location.href = scheme;
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级方案
      const input = document.createElement('input');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(input);
      }
    }
  };

  // 微信内显示引导弹窗
  const showBookingGuide = async () => {
    setBookingGuideOpen(true);
    if (venue?.bookingMiniProgram) {
      await copyToClipboard(venue.bookingMiniProgram);
    }
  };

  const handleBooking = () => {
    if (!venue) return;
    const { isWeixin } = getEnvironment();

    // 优先级1: URL Link（微信内外都能跳转，最通用）
    if (venue.bookingUrlLink?.startsWith('http')) {
      window.location.href = venue.bookingUrlLink;
      return;
    }

    // 优先级2: 有AppID 或 小程序名称
    if (venue.bookingAppId || venue.bookingMiniProgram) {
      if (isWeixin) {
        // 微信内：显示引导弹窗（非公众号H5无法直接跳转小程序）
        showBookingGuide();
      } else {
        // 外部浏览器：用 URL Scheme 唤起微信
        if (venue.bookingAppId) {
          tryScheme(venue.bookingAppId, venue.bookingPagePath || '');
        } else {
          alert(`请打开微信搜索小程序「${venue.bookingMiniProgram}」进行预订`);
        }
      }
      return;
    }

    // 优先级3: 小程序短链 #小程序://（仅在微信环境尝试）
    if (venue.bookingUrl?.startsWith('#小程序://')) {
      if (isWeixin) {
        showBookingGuide();
      } else {
        alert('请在微信中打开此页面，或联系场馆电话预订');
      }
      return;
    }

    // 优先级4: 普通 http 链接
    if (venue.bookingUrl?.startsWith('http')) {
      window.open(venue.bookingUrl, '_blank');
      return;
    }

    // 最终兜底：拨打电话
    if (venue.phone) {
      window.location.href = `tel:${venue.phone}`;
      return;
    }
  };

  const handleNavigate = () => {
    if (!venue) return;
    if (venue.lat && venue.lng) {
      setNavSheetOpen(true);
    } else {
      window.open(`https://map.baidu.com/search/${encodeURIComponent(venue.address)}`, '_blank');
    }
  };

  const handleCall = () => {
    if (!venue?.phone) return;
    window.location.href = `tel:${venue.phone}`;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">场馆不存在</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm">返回</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 relative h-48 bg-emerald-600 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="tennis-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.5" />
                  <line x1="0" y1="20" x2="40" y2="20" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  <line x1="20" y1="0" x2="20" y2="40" stroke="white" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#tennis-pattern)" />
            </svg>
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-medium text-base">场馆详情</span>
          <div className="w-9" />
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${venue.type === '室内' ? 'bg-blue-500/90 text-white' : 'bg-green-500/90 text-white'}`}>{venue.type}</span>
          <span className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm text-white">{venue.courtType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h1>
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-600 flex-1">{venue.address}</span>
            <button onClick={handleNavigate} className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
              <Navigation className="w-3 h-3" />导航
            </button>
          </div>
          {venue.phone && (
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600 flex-1">{venue.phone}</span>
              <button onClick={handleCall} className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                <MessageCircle className="w-3 h-3" />拨打
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600">{venue.hours}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white mt-2 px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" />收费标准</h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">工作日</span>
              <span className="text-sm font-medium text-gray-900">{venue.priceWeekday}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">周末</span>
              <span className="text-sm font-medium text-gray-900">{venue.priceWeekend}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">晚间</span>
              <span className="text-sm font-medium text-orange-500">{venue.priceEvening}</span>
            </div>
          </div>
        </div>

        {/* Court Info */}
        <div className="bg-white mt-2 px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">场地信息</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-400 block mb-1">场地数量</span>
              <span className="text-lg font-semibold text-gray-900">{venue.courtsCount} 片</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-400 block mb-1">场地类型</span>
              <span className="text-lg font-semibold text-gray-900">{venue.courtType}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white mt-2 px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-500" />场馆特色</h2>
          <div className="flex flex-wrap gap-2">
            {venue.tags?.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-sm rounded-full">{tag}</span>
            ))}
          </div>
        </div>

        {/* Booking Info */}
        {(venue.bookingMiniProgram || venue.bookingUrl || venue.bookingUrlLink || venue.bookingAppId) && (
          <div className="bg-white mt-2 px-4 py-4 mb-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">预订方式</h2>
            <div className="text-sm text-gray-500 space-y-1">
              {venue.bookingUrlLink && (
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                  已配置 URL Link（微信内外均可跳转）
                </p>
              )}
              {venue.bookingAppId && (
                <>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                    已配置小程序 AppID
                  </p>
                  <p className="text-xs text-purple-400 ml-3">AppID: {venue.bookingAppId}{venue.bookingPagePath ? ` / 路径: ${venue.bookingPagePath}` : ''}</p>
                </>
              )}
              {venue.bookingUrl?.startsWith('#小程序://') && (
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                  小程序短链（需在聊天窗口点击）
                </p>
              )}
              {venue.bookingMiniProgram && !venue.bookingUrlLink && !venue.bookingAppId && (
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  搜索「{venue.bookingMiniProgram}」小程序预订
                </p>
              )}
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>

      {/* Navigation Sheet */}
      <NavigationSheet
        open={navSheetOpen}
        onClose={() => setNavSheetOpen(false)}
        name={venue.name}
        lat={venue.lat || 30.27}
        lng={venue.lng || 120.15}
        address={venue.address}
      />

      {/* Booking Guide Modal (微信内无法直接跳转，显示引导) */}
      {bookingGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setBookingGuideOpen(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">前往小程序预订</h3>
              <button onClick={() => setBookingGuideOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">小程序名称已自动复制</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    「{venue.bookingMiniProgram || venue.name}」
                    {venue.bookingMiniProgram && (
                      <span className="text-emerald-600 ml-1">✓ 已复制到剪贴板</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">打开微信搜索小程序</p>
                  <p className="text-xs text-gray-500 mt-0.5">点击微信首页顶部搜索框 → 粘贴 → 搜索</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">进入小程序完成预订</p>
                  <p className="text-xs text-gray-500 mt-0.5">找到对应场馆和时间，完成场地预订</p>
                </div>
              </div>
            </div>

            {/* Mini Program Info Card */}
            {venue.bookingAppId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Search className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{venue.bookingMiniProgram || venue.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">AppID: {venue.bookingAppId}</p>
                  </div>
                  <button
                    onClick={() => {
                      const text = venue.bookingMiniProgram || venue.name;
                      copyToClipboard(text).then(ok => {
                        if (ok) alert('已复制「' + text + '」');
                      });
                    }}
                    className="shrink-0 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {venue.bookingPagePath && (
                  <p className="text-xs text-gray-400 mt-2">页面路径: {venue.bookingPagePath}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setBookingGuideOpen(false);
                  if (venue.phone) window.location.href = `tel:${venue.phone}`;
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                电话预订
              </button>
              <button
                onClick={() => setBookingGuideOpen(false)}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100 flex gap-3">
        <button onClick={handleCall} disabled={!venue.phone}
          className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${venue.phone ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'}`}>
          <Phone className="w-4 h-4" />电话咨询
        </button>
        <button onClick={handleBooking}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-emerald-500 flex items-center justify-center gap-1.5">
          <ExternalLink className="w-4 h-4" />
          {venue.bookingAppId || venue.bookingMiniProgram ? '小程序预订' : venue.bookingUrl ? '去预订' : venue.phone ? '拨打电话' : '查看地图'}
        </button>
      </div>
    </div>
  );
}
