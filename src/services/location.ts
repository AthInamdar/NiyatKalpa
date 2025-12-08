import * as Location from 'expo-location';
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

export interface LocationCoords {
  lat: number;
  lng: number;
  geohash?: string;
  address?: string;
}

/**
 * Request location permissions
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords: LocationCoords = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      geohash: geohashForLocation([location.coords.latitude, location.coords.longitude]),
    };

    // Optionally get address
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        coords.address = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
      }
    } catch (error) {
      console.log('Could not get address:', error);
    }

    return coords;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return distanceBetween([lat1, lng1], [lat2, lng2]);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km away`;
  } else {
    return `${Math.round(distanceKm)}km away`;
  }
}

/**
 * Get geohash query bounds for nearby search
 * @param center Center point [lat, lng]
 * @param radiusInKm Search radius in kilometers
 */
export function getGeohashBounds(center: [number, number], radiusInKm: number) {
  return geohashQueryBounds(center, radiusInKm * 1000); // Convert km to meters
}

/**
 * Check if location is within radius
 */
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusKm;
}

/**
 * Sort items by distance from a point
 */
export function sortByDistance<T extends { geo: { lat: number; lng: number } }>(
  items: T[],
  fromLat: number,
  fromLng: number
): T[] {
  return items.sort((a, b) => {
    const distA = calculateDistance(fromLat, fromLng, a.geo.lat, a.geo.lng);
    const distB = calculateDistance(fromLat, fromLng, b.geo.lat, b.geo.lng);
    return distA - distB;
  });
}

/**
 * Add distance property to items
 */
export function addDistanceToItems<T extends { geo: { lat: number; lng: number } }>(
  items: T[],
  fromLat: number,
  fromLng: number
): (T & { distance: number; distanceText: string })[] {
  return items.map((item) => {
    const distance = calculateDistance(fromLat, fromLng, item.geo.lat, item.geo.lng);
    return {
      ...item,
      distance,
      distanceText: formatDistance(distance),
    };
  });
}

/**
 * Get location from address (geocoding)
 */
export async function getLocationFromAddress(address: string): Promise<LocationCoords | null> {
  try {
    const locations = await (Location as any).geocodeAsync(address);

    if (locations.length > 0) {
      const loc = locations[0];
      return {
        lat: loc.latitude,
        lng: loc.longitude,
        geohash: geohashForLocation([loc.latitude, loc.longitude]),
        address,
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
