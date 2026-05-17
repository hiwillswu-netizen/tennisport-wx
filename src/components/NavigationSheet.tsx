import { X } from 'lucide-react';

interface NavigationSheetProps {
  open: boolean;
  onClose: () => void;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface MapApp {
  label: string;
  icon: string;
  scheme: string;
}

function getMapApps(lat: number, lng: number, name: string, address: string): MapApp[] {
  const encodedName = encodeURIComponent(name);
  const encodedAddr = encodeURIComponent(address);

  return [
    {
      label: '高德地图',
      icon: '🗺️',
      scheme: `https://uri.amap.com/navigation?to=${lng},${lat},${encodedName}&mode=car&coordinate=gaode`,
    },
    {
      label: '百度地图',
      icon: '🗺️',
      scheme: `http://api.map.baidu.com/direction?destination=latlng:${lat},${lng}|name:${encodedName}&coord_type=gcj02&mode=driving`,
    },
    {
      label: '腾讯地图',
      icon: '🗺️',
      scheme: `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${encodedName}&tocoord=${lat},${lng}&referer=tennis-app`,
    },
    {
      label: 'Apple 地图',
      icon: '🗺️',
      scheme: `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`,
    },
  ];
}

export default function NavigationSheet({ open, onClose, name, lat, lng, address }: NavigationSheetProps) {
  if (!open) return null;

  const apps = getMapApps(lat, lng, name, address);

  const handleOpen = (scheme: string) => {
    window.location.href = scheme;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="p-2 -ml-2">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h3 className="absolute left-0 right-0 text-center text-base font-medium text-gray-900 pointer-events-none">
            导航到<span className="mx-1">{name}</span>
          </h3>
          <div className="w-7" />
        </div>

        {/* Map Options */}
        <div className="py-2">
          {apps.map((app, index) => (
            <button
              key={app.label}
              onClick={() => handleOpen(app.scheme)}
              className={`w-full py-4 text-center text-base text-gray-900 font-normal active:bg-gray-50 transition-colors ${
                index < apps.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {app.label}
            </button>
          ))}
        </div>

        {/* Safe area */}
        <div className="h-6" />
      </div>
    </div>
  );
}
