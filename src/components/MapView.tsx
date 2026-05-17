import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Venue } from '@/types/venue';

interface MapViewProps {
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

// 杭州中心坐标
const HANGZHOU_CENTER: [number, number] = [30.27, 120.15];

// 创建自定义图标
function createIcon(type: string) {
  const color = type === '室内' ? '#3b82f6' : '#10b981';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">🎾</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function MapView({ venues, onVenueClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: HANGZHOU_CENTER,
      zoom: 11,
      zoomControl: false,
    });

    // 添加缩放控件到右下角
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 使用高德地图瓦片（更适合国内）
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234',
      attribution: '&copy; 高德地图',
      maxZoom: 18,
      minZoom: 5,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 更新标记
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 清除旧标记
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (venues.length === 0) return;

    // 添加新标记
    const bounds = L.latLngBounds([]);
    
    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;
      
      const latlng: [number, number] = [venue.lat, venue.lng];
      const marker = L.marker(latlng, { icon: createIcon(venue.type) })
        .addTo(map);
      
      // 创建弹窗内容
      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '200px';
      popupContent.innerHTML = `
        <div style="padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">${venue.name}</h3>
            <span style="font-size: 12px; padding: 2px 8px; border-radius: 999px; background: ${venue.type === '室内' ? '#dbeafe' : '#d1fae5'}; color: ${venue.type === '室内' ? '#2563eb' : '#059669'};">${venue.type}</span>
          </div>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
            <span>📍</span> ${venue.address}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #f97316; font-weight: 500;">
            ${(venue.priceWeekday || '').split('、')[0]}
          </p>
          <button id="btn-${venue.id}" style="
            width: 100%;
            padding: 8px 12px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
          ">查看详情</button>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
        className: 'venue-popup',
      });

      // 点击按钮跳转
      marker.on('popupopen', () => {
        const btn = popupContent.querySelector(`#btn-${venue.id}`);
        if (btn) {
          btn.addEventListener('click', () => onVenueClick(venue));
        }
      });

      bounds.extend(latlng);
      markersRef.current.push(marker);
    });

    // 调整视野以包含所有标记
    if (markersRef.current.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [venues, onVenueClick]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}
