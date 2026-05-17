import type { Venue } from '@/types/venue';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';

interface VenueCardProps {
  venue: Venue;
  onClick: (venue: Venue) => void;
}

export default function VenueCard({ venue, onClick }: VenueCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
      onClick={() => onClick(venue)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 mr-2">
          {venue.name}
        </h3>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
          venue.type === '室内'
            ? 'bg-blue-50 text-blue-600'
            : 'bg-green-50 text-green-600'
        }`}>
          {venue.type}
        </span>
      </div>

      <div className="flex items-center text-gray-500 text-sm mb-1.5">
        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
        <span className="truncate">{venue.address}</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
          <span className="text-gray-400 text-xs">{venue.hours}</span>
        </div>
        {venue.phone && (
          <div className="flex items-center text-gray-500 text-sm">
            <Phone className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="text-gray-400 text-xs">{venue.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {venue.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-orange-500 font-semibold text-sm shrink-0 ml-2">
          {(venue.priceWeekday || '').split('、')[0]}
        </span>
      </div>

      {venue.bookingMiniProgram && (
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center text-blue-500 text-xs">
          <span>可预订: {venue.bookingMiniProgram}</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      )}
    </div>
  );
}
