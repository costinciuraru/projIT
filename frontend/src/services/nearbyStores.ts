import { supabase } from "../lib/supabaseClient";

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
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheRow {
  stores_json: NearbyClothingStore[];
}

async function readCache(latRounded: number, lonRounded: number): Promise<NearbyClothingStore[] | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("nearby_stores_cache")
    .select("stores_json")
    .eq("lat_rounded", latRounded)
    .eq("lng_rounded", lonRounded)
    .gte("fetched_at", cutoff)
    .maybeSingle<CacheRow>();

  if (error || !data) return null;

  return data.stores_json;
}

async function writeCache(
  latRounded: number,
  lonRounded: number,
  stores: NearbyClothingStore[],
): Promise<void> {
  const { error } = await supabase.from("nearby_stores_cache").upsert(
    {
      lat_rounded: latRounded,
      lng_rounded: lonRounded,
      stores_json: stores,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "lat_rounded,lng_rounded" },
  );

  if (error) console.error("Failed to write nearby_stores_cache:", error.message);
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
  const latRounded = Number(lat.toFixed(2));
  const lonRounded = Number(lon.toFixed(2));

  const cached = await readCache(latRounded, lonRounded);
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

      const name = element.tags?.name ?? element.tags?.brand ?? element.tags?.operator;

      if (!position?.lat || !position?.lon || !shopType || !SHOP_TYPES.includes(shopType) || !name) {
        return null;
      }

      return {
        id: `${element.type}/${element.id}`,
        name,
        lat: position.lat,
        lon: position.lon,
        shopType,
      };
    })
    .filter((store): store is NearbyClothingStore => store !== null);

  await writeCache(latRounded, lonRounded, stores);

  return stores;
}
