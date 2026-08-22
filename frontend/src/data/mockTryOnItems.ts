export const TRYON_CATEGORIES = [
  "Dresses",
  "Tops",
  "Outerwear",
  "Bottoms",
  "Shoes",
  "Bags",
] as const;

export type TryOnCategory = (typeof TRYON_CATEGORIES)[number];

export interface TryOnItem {
  id: string;
  name: string;
  category: TryOnCategory;
  price: number;
  image: string;
  previewImage: string;
}

const ITEM_NAMES: Record<TryOnCategory, string[]> = {
  Dresses: [
    "Floral Midi Dress",
    "Polka Dot Dress",
    "Wrap Dress",
    "Linen Shift Dress",
    "Satin Slip Dress",
    "Knit Sweater Dress",
  ],
  Tops: [
    "Silk Blouse",
    "Ribbed Tank",
    "Oversized Shirt",
    "Cropped Cardigan",
    "Puff Sleeve Top",
    "Turtleneck",
  ],
  Outerwear: [
    "Wool Blazer",
    "Trench Coat",
    "Denim Jacket",
    "Puffer Jacket",
    "Leather Jacket",
    "Longline Coat",
  ],
  Bottoms: [
    "Tailored Trousers",
    "Wide Leg Jeans",
    "Pleated Skirt",
    "Cargo Pants",
    "Linen Shorts",
    "Straight Denim",
  ],
  Shoes: [
    "Pointed Flats",
    "Ankle Boots",
    "White Sneakers",
    "Block Heels",
    "Loafers",
    "Strappy Sandals",
  ],
  Bags: [
    "Structured Tote",
    "Mini Crossbody",
    "Leather Clutch",
    "Canvas Tote",
    "Chain Shoulder Bag",
    "Woven Basket Bag",
  ],
};

const BASE_PRICES = [249, 299, 319, 279, 339, 289];

export const MOCK_TRYON_ITEMS: TryOnItem[] = TRYON_CATEGORIES.flatMap((category) =>
  ITEM_NAMES[category].map((name, index) => {
    const seed = `${category}-${index}`.toLowerCase();
    return {
      id: seed,
      name,
      category,
      price: BASE_PRICES[index] + index * 10,
      image: `https://picsum.photos/seed/${seed}-thumb/300/300`,
      previewImage: `https://picsum.photos/seed/${seed}-preview/500/650`,
    };
  }),
);
