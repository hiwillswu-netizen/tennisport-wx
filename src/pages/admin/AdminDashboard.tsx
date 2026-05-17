import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useVenueSync, saveVenues } from "@/hooks/useVenueSync";
import {
  Plus, Search, MapPin, Building2, Sun, Pencil, Trash2,
  Loader2, ExternalLink, RefreshCw,
} from "lucide-react";
import type { Venue } from "@/types/venue";

export default function AdminDashboard() {
  const { venues, loading, reload } = useVenueSync();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const stats = useMemo(() => ({
    total: venues.length,
    indoor: venues.filter(v => v.type === "室内").length,
    outdoor: venues.filter(v => v.type === "室外").length,
  }), [venues]);

  const filteredVenues = useMemo(() => {
    if (!searchKeyword) return venues;
    const kw = searchKeyword.toLowerCase();
    return venues.filter(v =>
      v.name.toLowerCase().includes(kw) ||
      v.address.toLowerCase().includes(kw) ||
      v.district.toLowerCase().includes(kw)
    );
  }, [venues, searchKeyword]);

  const handleDelete = (id: number) => {
    const newVenues = venues.filter(v => v.id !== id);
    saveVenues(newVenues);
    setDeleteId(null);
  };

  const handleRefresh = async () => {
    // 从 venues.json 重新加载
    try {
      const response = await fetch("/venues.json?t=" + Date.now());
      const data = await response.json();
      const venueList = data.venues || data;
      saveVenues(venueList);
      reload();
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-500" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">场馆总数</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-emerald-500" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">已启用</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-500" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.indoor}</p><p className="text-xs text-gray-500">室内场馆</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><Sun className="w-5 h-5 text-orange-500" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.outdoor}</p><p className="text-xs text-gray-500">室外场馆</p></div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="搜索场馆名称、地址..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />重置数据
          </button>
          <Link to="/admin/create" className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shrink-0">
            <Plus className="w-4 h-4" />新建场馆
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-16 text-gray-500"><MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" /><p>暂无场馆数据</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">场馆名称</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">区域</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">类型</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">工作日价格</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">预订配置</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVenues.map((venue: Venue) => (
                  <tr key={venue.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><div><p className="font-medium text-gray-900">{venue.name}</p><p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{venue.address}</p></div></td>
                    <td className="px-4 py-3 text-gray-600">{venue.district}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${venue.type === "室内" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>{venue.type}</span></td>
                    <td className="px-4 py-3 text-gray-600">{venue.priceWeekday}</td>
                    <td className="px-4 py-3">
                      {venue.bookingUrlLink ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs"><ExternalLink className="w-3 h-3" />URL Link</span>
                      ) : venue.bookingAppId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs"><ExternalLink className="w-3 h-3" />{venue.bookingAppId.slice(0, 10)}...</span>
                      ) : venue.bookingMiniProgram ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs"><ExternalLink className="w-3 h-3" />{venue.bookingMiniProgram}</span>
                      ) : venue.bookingUrl ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs"><ExternalLink className="w-3 h-3" />短链</span>
                      ) : (<span className="text-gray-400 text-xs">未配置</span>)}
                    </td>
                    <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/edit/${venue.id}`} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="编辑"><Pencil className="w-4 h-4" /></Link>
                      <button onClick={() => setDeleteId(venue.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-6">删除后该场馆将不再显示，确定要继续吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
