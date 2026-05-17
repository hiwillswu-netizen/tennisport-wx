export interface Venue {
  id: number;
  name: string;
  address: string;
  district: string;
  type: '室内' | '室外';
  courtType: string;
  courtsCount: number;
  priceWeekday: string;
  priceWeekend: string;
  priceEvening: string;
  phone: string;
  hours: string;
  bookingUrl: string;
  bookingMiniProgram: string;
  bookingAppId: string;
  bookingPagePath: string;
  bookingUrlLink: string;
  tags: string[];
  source: string;
  lat: number;
  lng: number;
}

export interface FilterOptions {
  district: string;
  type: string;
  priceRange: string;
}
