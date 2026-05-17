import { useEffect, useState, useCallback } from "react";
import type { Venue } from "@/types/venue";
import { DEFAULT_VENUES } from "@/data/venues";

const STORAGE_KEY = "admin_venues";
const DATA_VERSION_KEY = "admin_venues_version";
const CURRENT_VERSION = "2";

// 迁移旧格式数据（snake_case → camelCase）
function migrateVenue(v: Record<string, unknown>): Venue {
  return {
    id: v.id as number,
    name: (v.name ?? "") as string,
    address: (v.address ?? "") as string,
    district: (v.district ?? "") as string,
    type: (v.type ?? "室外") as "室内" | "室外",
    courtType: ((v.courtType ?? v.court_type) || "硬地") as string,
    courtsCount: (v.courtsCount ?? v.courts_count ?? 1) as number,
    priceWeekday: ((v.priceWeekday ?? v.price_weekday) || "") as string,
    priceWeekend: ((v.priceWeekend ?? v.price_weekend) || "") as string,
    priceEvening: ((v.priceEvening ?? v.price_evening) || "") as string,
    phone: (v.phone ?? "") as string,
    hours: (v.hours ?? "") as string,
    bookingUrl: ((v.bookingUrl ?? v.booking_url) || "") as string,
    bookingMiniProgram: ((v.bookingMiniProgram ?? v.booking_mini_program) || "") as string,
    bookingAppId: ((v.bookingAppId ?? v.booking_app_id) || "") as string,
    bookingPagePath: ((v.bookingPagePath ?? v.booking_page_path) || "") as string,
    bookingUrlLink: ((v.bookingUrlLink ?? v.booking_url_link) || "") as string,
    tags: (v.tags ?? v.tags ?? []) as string[],
    source: (v.source ?? "") as string,
    lat: (v.lat ?? null) as number,
    lng: (v.lng ?? null) as number,
  };
}

function loadFromStorage(): Venue[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "[]") return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) return null;

    // 检查数据版本
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
    const needsMigration = storedVersion !== CURRENT_VERSION;

    // 验证每个场馆是否有 id 和 name
    const valid = data.filter((v: Record<string, unknown>) => v && v.id && v.name);
    if (valid.length === 0) return null;

    // 执行数据迁移
    if (needsMigration) {
      const migrated = valid.map(migrateVenue);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
      return migrated;
    }

    return valid as Venue[];
  } catch {
    return null;
  }
}

function saveToStorage(venues: Venue[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(venues));
    window.dispatchEvent(new CustomEvent("venues-changed"));
  } catch (e) {
    console.error("localStorage save failed:", e);
  }
}

export function useVenueSync() {
  const [venues, setVenues] = useState<Venue[]>(() => {
    // 初始化时立即检查 localStorage
    const stored = loadFromStorage();
    return stored && stored.length > 0 ? stored : [...DEFAULT_VENUES];
  });
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      setVenues(stored);
    } else {
      setVenues([...DEFAULT_VENUES]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // 保存默认数据到 localStorage（首次）
    const stored = loadFromStorage();
    if (!stored || stored.length === 0) {
      saveToStorage([...DEFAULT_VENUES]);
    }

    // 监听变化
    const handler = () => reload();
    window.addEventListener("venues-changed", handler);
    window.addEventListener("focus", handler);
    const interval = setInterval(reload, 3000);

    return () => {
      window.removeEventListener("venues-changed", handler);
      window.removeEventListener("focus", handler);
      clearInterval(interval);
    };
  }, [reload]);

  return { venues, loading, reload };
}

export function saveVenues(venues: Venue[]) {
  saveToStorage(venues);
}
