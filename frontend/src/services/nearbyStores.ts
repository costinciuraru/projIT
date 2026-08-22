export type ClothingShopType = "clothes" | "shoes" | "boutique";

export interface NearbyClothingStore {
  id: string;
  name: string;
  lat: number;
  lon: number;
  shopType: ClothingShopType;
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SHOP_TYPES: ClothingShopType[] = ["clothes", "shoes", "boutique"];

const CACHE_PREFIX = "nearbyStores:";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  cachedAt: number;
  stores: NearbyClothingStore[];
}

function cacheKey(lat: number, lon: number, radiusMeters: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(2)},${lon.toFixed(2)},${radiusMeters}`;
}

function readCache(key: string): NearbyClothingStore[] | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }

    return entry.stores;
  } catch {
    return null;
  }
}

function writeCache(key: string, stores: NearbyClothingStore[]): void {
  try {
    const entry: CacheEntry = { cachedAt: Date.now(), stores };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage unavailable (private browsing, storage full, etc.) - caching is best-effort
  }
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(lat: number, lon: number, radiusMeters: number): string {
  const clauses = SHOP_TYPES.flatMap((shopType) => [
    `node["shop"="${shopType}"](around:${radiusMeters},${lat},${lon});`,
    `way["shop"="${shopType}"](around:${radiusMeters},${lat},${lon});`,
  ]).join("\n  ");

  return `[out:json][timeout:25];\n(\n  ${clauses}\n);\nout center;`;
}

export async function getNearbyClothingStores(
  lat: number,
  lon: number,
  radiusMeters = 3000,
): Promise<NearbyClothingStore[]> {
  const key = cacheKey(lat, lon, radiusMeters);
  const cached = readCache(key);
  if (cached) return cached;

  const query = buildQuery(lat, lon, radiusMeters);

  let response: Response;
  try {
    response = await fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  } catch {
    throw new Error("Could not reach the Overpass API. Check your internet connection and try again.");
  }

  if (!response.ok) {
    throw new Error(`Overpass API request failed with status ${response.status}.`);
  }

  const data: OverpassResponse = await response.json();

  const stores = data.elements
    .map((element): NearbyClothingStore | null => {
      const position = element.type === "node" ? element : element.center;
      const shopType = element.tags?.shop as ClothingShopType | undefined;

      if (!position?.lat || !position?.lon || !shopType || !SHOP_TYPES.includes(shopType)) {
        return null;
      }

      return {
        id: `${element.type}/${element.id}`,
        name: element.tags?.name ?? "Unnamed store",
        lat: position.lat,
        lon: position.lon,
        shopType,
      };
    })
    .filter((store): store is NearbyClothingStore => store !== null);

  writeCache(key, stores);

  return stores;
}
