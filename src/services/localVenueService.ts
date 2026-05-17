import type { Venue } from "@/types/venue";

const STORAGE_KEY = "admin_venues";
const STORAGE_VERSION = "admin_venues_version";

function getStoredVenues(): Venue[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Venue[];
  } catch { /* ignore */ }
  return null;
}

function getStoredVersion(): string | null {
  return localStorage.getItem(STORAGE_VERSION);
}

function saveVenues(venues: Venue[], version: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(venues));
  localStorage.setItem(STORAGE_VERSION, version);
  // 触发自定义事件，通知同一标签页内的所有监听器
  window.dispatchEvent(new CustomEvent("venues-changed"));
}

export async function loadVenues(): Promise<Venue[]> {
  const stored = getStoredVenues();
  if (stored && stored.length > 0) {
    return stored;
  }
  return loadFromServer();
}

async function loadFromServer(): Promise<Venue[]> {
  try {
    const response = await fetch("/venues.json?t=" + Date.now());
    const wrapper = await response.json();
    const serverVersion = wrapper._version || "legacy_v86";
    const serverVenues: Venue[] = wrapper.venues || wrapper;
    const venues = serverVenues.map((v: Record<string, unknown>, index: number) => ({
      id: index + 1,
      ...v,
    })) as Venue[];
    saveVenues(venues, serverVersion);
    return venues;
  } catch (error) {
    console.error("Failed to load venues:", error);
    return [];
  }
}

export async function getVenueById(id: number): Promise<Venue | null> {
  const venues = await loadVenues();
  return venues.find((v) => v.id === id) ?? null;
}

export async function createVenue(data: Omit<Venue, "id">): Promise<Venue> {
  const venues = await loadVenues();
  const newId = venues.length > 0 ? Math.max(...venues.map((v) => v.id)) + 1 : 1;
  const newVenue = { ...data, id: newId } as Venue;
  venues.push(newVenue);
  const version = getStoredVersion() || "v1";
  saveVenues(venues, version);
  return newVenue;
}

export async function updateVenue(id: number, data: Partial<Venue>): Promise<void> {
  const venues = await loadVenues();
  const idx = venues.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("Venue not found");
  venues[idx] = { ...venues[idx], ...data };
  const version = getStoredVersion() || "v1";
  saveVenues(venues, version);
}

export async function deleteVenue(id: number): Promise<void> {
  const venues = await loadVenues();
  const idx = venues.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("Venue not found");
  venues.splice(idx, 1);
  const version = getStoredVersion() || "v1";
  saveVenues(venues, version);
}

export function getStats(venues: Venue[]) {
  return {
    total: venues.length,
    active: venues.length,
    indoor: venues.filter((v) => v.type === "室内").length,
    outdoor: venues.filter((v) => v.type === "室外").length,
  };
}

// 智能刷新：保留用户编辑，追加新场馆
export async function refreshVenues(): Promise<Venue[]> {
  try {
    const response = await fetch("/venues.json?t=" + Date.now());
    const wrapper = await response.json();
    const serverVenues: Venue[] = wrapper.venues || wrapper;
    const serverNames = new Set(serverVenues.map((v: Venue) => v.name));
    const stored = getStoredVenues() || [];
    // 保留用户编辑/新增的场馆（不在服务器中的）
    const userEdited = stored.filter((v) => !serverNames.has(v.name));
    // 合并：服务器数据 + 用户编辑数据
    const merged = [...serverVenues, ...userEdited];
    const version = wrapper._version || "refreshed";
    saveVenues(merged, version);
    return merged;
  } catch (error) {
    console.error("Refresh failed:", error);
    return loadVenues();
  }
}

// 完全重置（从 venues.json 重新加载，会丢失所有编辑！）
export async function resetVenues(): Promise<Venue[]> {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_VERSION);
  return await loadFromServer();
}

// 订阅数据变化（跨标签页 + 同标签页）
export function subscribeToVenueChanges(callback: () => void): () => void {
  // 监听 localStorage 变化（跨标签页）
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", storageHandler);

  // 监听自定义事件（同标签页）
  const customHandler = () => callback();
  window.addEventListener("venues-changed", customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("venues-changed", customHandler);
  };
}
