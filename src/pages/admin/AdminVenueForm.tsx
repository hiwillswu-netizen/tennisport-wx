import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { saveVenues } from "@/hooks/useVenueSync";
import { DEFAULT_VENUES } from "@/data/venues";
import type { Venue } from "@/types/venue";
import {
  ArrowLeft, Loader2, Save, MapPin, Phone, Clock,
  DollarSign, Tag, Link2, Smartphone, Navigation,
} from "lucide-react";

const DISTRICTS = ["西湖区", "上城区", "拱墅区", "余杭区", "滨江区", "萧山区", "临平区", "钱塘区", "富阳区", "临安区", "桐庐县"];
const COURT_TYPES = ["硬地", "塑胶", "草地", "塑胶复合", "红土"];

type FormData = {
  name: string; address: string; district: string;
  type: "室内" | "室外"; courtType: string; courtsCount: number;
  priceWeekday: string; priceWeekend: string; priceEvening: string;
  phone: string; hours: string; bookingUrl: string;
  bookingMiniProgram: string; bookingUrlLink: string;
  bookingAppId: string; bookingPagePath: string; tags: string;
  lat: string; lng: string; source: string;
};

const emptyForm: FormData = {
  name: "", address: "", district: "西湖区", type: "室外",
  courtType: "硬地", courtsCount: 2, priceWeekday: "",
  priceWeekend: "", priceEvening: "", phone: "", hours: "",
  bookingUrl: "", bookingMiniProgram: "", bookingUrlLink: "",
  bookingAppId: "", bookingPagePath: "", tags: "",
  lat: "", lng: "", source: "",
};

function loadVenueFromStorage(id: number): Venue | undefined {
  try {
    const raw = localStorage.getItem("admin_venues");
    if (raw) {
      const venues = JSON.parse(raw) as Venue[];
      return venues.find(v => v.id === id);
    }
  } catch { /* ignore */ }
  // fallback to default data
  return DEFAULT_VENUES.find(v => v.id === id);
}

function getAllVenues(): Venue[] {
  try {
    const raw = localStorage.getItem("admin_venues");
    if (raw) {
      const venues = JSON.parse(raw) as Venue[];
      if (venues.length > 0) return venues;
    }
  } catch { /* ignore */ }
  return [...DEFAULT_VENUES];
}

export default function AdminVenueForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const venueId = id ? Number(id) : 0;

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  // 编辑模式：只加载一次场馆数据（不参与轮询）
  useEffect(() => {
    if (isEdit && !loaded) {
      const found = loadVenueFromStorage(venueId);
      if (found) {
        setForm({
          name: found.name, address: found.address,
          district: found.district, type: found.type as "室内" | "室外",
          courtType: found.courtType, courtsCount: found.courtsCount,
          priceWeekday: found.priceWeekday, priceWeekend: found.priceWeekend,
          priceEvening: found.priceEvening, phone: found.phone,
          hours: found.hours,
          bookingUrl: found.bookingUrl || "",
          bookingMiniProgram: found.bookingMiniProgram || "",
          bookingUrlLink: found.bookingUrlLink || "",
          bookingAppId: found.bookingAppId || "",
          bookingPagePath: found.bookingPagePath || "",
          tags: Array.isArray(found.tags) ? found.tags.join(",") : (found.tags || ""),
          lat: found.lat?.toString() || "", lng: found.lng?.toString() || "",
          source: found.source,
        });
      }
      setLoaded(true);
    }
  }, [isEdit, venueId, loaded]);

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "必填";
    if (!form.address.trim()) e.address = "必填";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const venues = getAllVenues();
    const venueData: Venue = {
      id: isEdit ? venueId : (venues.length > 0 ? Math.max(...venues.map(v => v.id)) + 1 : 1),
      name: form.name, address: form.address, district: form.district,
      type: form.type, courtType: form.courtType,
      courtsCount: Number(form.courtsCount) || 1,
      priceWeekday: form.priceWeekday, priceWeekend: form.priceWeekend,
      priceEvening: form.priceEvening, phone: form.phone, hours: form.hours,
      bookingUrl: form.bookingUrl || "",
      bookingMiniProgram: form.bookingMiniProgram,
      bookingUrlLink: form.bookingUrlLink || "",
      bookingAppId: form.bookingAppId || "",
      bookingPagePath: form.bookingPagePath || "",
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      source: form.source,
    };

    let newVenues: Venue[];
    if (isEdit) {
      newVenues = venues.map(v => v.id === venueId ? venueData : v);
    } else {
      newVenues = [...venues, venueData];
    }

    saveVenues(newVenues);
    setTimeout(() => {
      setSaving(false);
      navigate("/admin");
    }, 200);
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  if (isEdit && !loaded) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">{isEdit ? "编辑场馆" : "新建场馆"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" />基本信息</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">场馆名称 <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => updateField("name", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.name ? "border-red-300" : "border-gray-200"}`} placeholder="如：黄龙体育中心网球场" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">详细地址 <span className="text-red-500">*</span></label>
              <input type="text" value={form.address} onChange={e => updateField("address", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.address ? "border-red-300" : "border-gray-200"}`} placeholder="如：西湖区黄龙路3号" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">所属区域</label>
              <select value={form.district} onChange={e => updateField("district", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">场地类型</label>
              <div className="flex gap-2">
                {(["室外", "室内"] as const).map(t => (
                  <button key={t} type="button" onClick={() => updateField("type", t)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.type === t ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-200"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">场地材质</label>
              <select value={form.courtType} onChange={e => updateField("courtType", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                {COURT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">场地数量</label>
              <input type="number" min={1} value={form.courtsCount} onChange={e => updateField("courtsCount", Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* 收费标准 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" />收费标准</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ key: "priceWeekday" as const, label: "工作日" }, { key: "priceWeekend" as const, label: "周末" }, { key: "priceEvening" as const, label: "晚间" }].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input type="text" value={form[key]} onChange={e => updateField(key, e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="如：30-60元/小时" />
              </div>
            ))}
          </div>
        </div>

        {/* 联系与营业时间 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-500" />联系与营业时间</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">联系电话</label>
              <input type="text" value={form.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="如：0571-87963320" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">开放时间</label>
              <input type="text" value={form.hours} onChange={e => updateField("hours", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="如：06:00-22:00" />
            </div>
          </div>
        </div>

        {/* 预订跳转配置 */}
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm">
          <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-600" />预订跳转配置</h2>
            <p className="text-xs text-gray-500 mt-1">配置后用户可在场馆详情页一键跳转预订</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">预订小程序名称</label>
              <input type="text" value={form.bookingMiniProgram} onChange={e => updateField("bookingMiniProgram", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="如：动感黄龙、浙里办" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />小程序短链（#小程序://）</label>
              <input type="text" value={form.bookingUrl} onChange={e => updateField("bookingUrl", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="如：#小程序://动感黄龙/ihE4ilApvrpXcMc" />
              <p className="mt-1 text-xs text-gray-400">仅微信聊天窗口可点击，H5中无法跳转</p>
            </div>
            <div className="pt-3 border-t border-dashed border-gray-200">
              <label className="block text-sm font-medium mb-1 text-blue-600">URL Link（推荐）</label>
              <input type="text" value={form.bookingUrlLink} onChange={e => updateField("bookingUrlLink", e.target.value)} className="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-blue-50/30" placeholder="https://wxaurl.cn/xxxx" />
              <p className="mt-1 text-xs text-blue-400">小程序后台生成的短链接，微信内外都能跳转</p>
            </div>
            <div className="pt-3 border-t border-dashed border-gray-200">
              <label className="block text-sm font-medium mb-1 text-purple-600">小程序 AppID（推荐）</label>
              <input type="text" value={form.bookingAppId} onChange={e => updateField("bookingAppId", e.target.value)} className="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-purple-50/30" placeholder="如：wxad8e3d7e8f8c5e1c" />
              <p className="mt-1 text-xs text-purple-400">只需AppID即可跳转，无需小程序开发权限</p>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium mb-1 text-purple-500">小程序页面路径</label>
              <input type="text" value={form.bookingPagePath} onChange={e => updateField("bookingPagePath", e.target.value)} className="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-purple-50/30" placeholder="如：pages/booking/index 或 pages/index/index" />
              <p className="mt-1 text-xs text-purple-400">不知道可留空，默认打开小程序首页</p>
            </div>
          </div>
        </div>

        {/* 地图坐标 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Navigation className="w-4 h-4 text-emerald-500" />地图坐标</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">纬度</label>
              <input type="text" value={form.lat} onChange={e => updateField("lat", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="30.270" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">经度</label>
              <input type="text" value={form.lng} onChange={e => updateField("lng", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="120.130" />
            </div>
          </div>
        </div>

        {/* 其他信息 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-500" />其他信息</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">场馆标签</label>
              <input type="text" value={form.tags} onChange={e => updateField("tags", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="有照明,有淋浴,可预约" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">数据来源</label>
              <input type="text" value={form.source} onChange={e => updateField("source", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="如：大众点评" />
            </div>
          </div>
        </div>

        {/* 提交 */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link to="/admin" className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">取消</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            {isEdit ? "保存修改" : "创建场馆"}
          </button>
        </div>
      </form>
    </div>
  );
}
