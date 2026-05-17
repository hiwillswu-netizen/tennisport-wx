import type { Venue, FilterOptions } from '@/types/venue';

export function getDistricts(venues: Venue[]): string[] {
  const districts = new Set(venues.map(v => v.district));
  return Array.from(districts).sort();
}

export function filterVenues(venues: Venue[], filters: FilterOptions): Venue[] {
  return venues.filter(venue => {
    if (filters.district && filters.district !== 'all' && venue.district !== filters.district) {
      return false;
    }
    if (filters.type && filters.type !== 'all' && venue.type !== filters.type) {
      return false;
    }
    if (filters.priceRange && filters.priceRange !== 'all') {
      const price = extractMinPrice(venue.priceWeekday);
      switch (filters.priceRange) {
        case 'free':
          return price === 0;
        case '0-50':
          return price >= 0 && price <= 50;
        case '50-100':
          return price > 50 && price <= 100;
        case '100+':
          return price > 100;
        default:
          return true;
      }
    }
    return true;
  });
}

export function searchVenues(venues: Venue[], keyword: string): Venue[] {
  if (!keyword.trim()) return venues;
  const lowerKeyword = keyword.toLowerCase();
  return venues.filter(venue =>
    venue.name.toLowerCase().includes(lowerKeyword) ||
    venue.address.toLowerCase().includes(lowerKeyword) ||
    venue.district.toLowerCase().includes(lowerKeyword) ||
    venue.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

function extractMinPrice(priceStr: string): number {
  if (priceStr.includes('免费')) return 0;
  const matches = priceStr.match(/\d+/);
  return matches ? parseInt(matches[0]) : 999;
}
