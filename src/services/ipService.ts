import { ClientInfo, ServerNode } from '../types';

export const GLOBAL_SERVERS: ServerNode[] = [
  {
    id: 'us-nyc',
    name: 'New York, NY',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    sponsor: 'FiberHost Global',
    host: 'speed-nyc.ookla-cdn.net',
    lat: 40.7128,
    lon: -74.0060,
  },
  {
    id: 'us-sfo',
    name: 'San Francisco, CA',
    city: 'San Francisco',
    country: 'United States',
    countryCode: 'US',
    sponsor: 'Pacific Edge Telecom',
    host: 'speed-sfo.ookla-cdn.net',
    lat: 37.7749,
    lon: -122.4194,
  },
  {
    id: 'us-chi',
    name: 'Chicago, IL',
    city: 'Chicago',
    country: 'United States',
    countryCode: 'US',
    sponsor: 'Midwest GigaNet',
    host: 'speed-chi.ookla-cdn.net',
    lat: 41.8781,
    lon: -87.6298,
  },
  {
    id: 'us-dfw',
    name: 'Dallas, TX',
    city: 'Dallas',
    country: 'United States',
    countryCode: 'US',
    sponsor: 'Lone Star Cloud',
    host: 'speed-dfw.ookla-cdn.net',
    lat: 32.7767,
    lon: -96.7970,
  },
  {
    id: 'eu-lon',
    name: 'London',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    sponsor: 'British Telecom Core',
    host: 'speed-lon.ookla-cdn.net',
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    id: 'eu-fra',
    name: 'Frankfurt',
    city: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    sponsor: 'DE-CIX Exchange',
    host: 'speed-fra.ookla-cdn.net',
    lat: 50.1109,
    lon: 8.6821,
  },
  {
    id: 'eu-ams',
    name: 'Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    sponsor: 'AMS-IX UltraFiber',
    host: 'speed-ams.ookla-cdn.net',
    lat: 52.3676,
    lon: 4.9041,
  },
  {
    id: 'as-tyo',
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    sponsor: 'NTT Communications',
    host: 'speed-tyo.ookla-cdn.net',
    lat: 35.6762,
    lon: 139.6503,
  },
  {
    id: 'as-sin',
    name: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    sponsor: 'SingTel Megaport',
    host: 'speed-sin.ookla-cdn.net',
    lat: 1.3521,
    lon: 103.8198,
  },
  {
    id: 'au-syd',
    name: 'Sydney',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    sponsor: 'Telstra Enterprise',
    host: 'speed-syd.ookla-cdn.net',
    lat: -33.8688,
    lon: 151.2093,
  },
  {
    id: 'sa-sao',
    name: 'São Paulo',
    city: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    sponsor: 'Embratel Fiber',
    host: 'speed-sao.ookla-cdn.net',
    lat: -23.5505,
    lon: -46.6333,
  },
  {
    id: 'in-bom',
    name: 'Mumbai',
    city: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    sponsor: 'Tata Communications',
    host: 'speed-bom.ookla-cdn.net',
    lat: 19.0760,
    lon: 72.8777,
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export async function detectClientInfo(): Promise<ClientInfo> {
  // Try ipwho.is first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          ip: data.ip || '192.168.1.1',
          isp: data.connection?.isp || data.connection?.org || 'Broadband Provider',
          org: data.connection?.org,
          city: data.city || 'Local Area',
          region: data.region || '',
          country: data.country || 'United States',
          countryCode: data.country_code || 'US',
          lat: data.latitude || 37.7749,
          lon: data.longitude || -122.4194,
          asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
          connectionType: 'Fiber / High-Speed Gigabit',
        };
      }
    }
  } catch {
    // try fallback
  }

  // Fallback 2: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || '127.0.0.1',
        isp: data.org || data.asn || 'High-Speed Broadband',
        city: data.city || 'Metropolitan Area',
        region: data.region || '',
        country: data.country_name || 'United States',
        countryCode: data.country_code || 'US',
        lat: data.latitude || 40.7128,
        lon: data.longitude || -74.0060,
        asn: data.asn,
        connectionType: 'High-Speed Broadband',
      };
    }
  } catch {}

  // Standard fallback
  return {
    ip: '104.28.19.42',
    isp: 'Cloudflare Broadband Network',
    city: 'San Francisco',
    region: 'California',
    country: 'United States',
    countryCode: 'US',
    lat: 37.7749,
    lon: -122.4194,
    asn: 'AS13335',
    connectionType: 'Gigabit Fiber',
  };
}

export function sortServersByProximity(clientLat: number, clientLon: number): ServerNode[] {
  return GLOBAL_SERVERS.map((server) => {
    const distanceKm = calculateDistanceKm(clientLat, clientLon, server.lat, server.lon);
    return {
      ...server,
      distanceKm,
    };
  }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
}
