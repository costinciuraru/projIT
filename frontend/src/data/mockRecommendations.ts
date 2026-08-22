export const MOOD_OPTIONS = ["Any Mood", "Confident", "Relaxed", "Romantic", "Playful", "Bold"] as const;
export type Mood = (typeof MOOD_OPTIONS)[number];

export const OCCASION_OPTIONS = [
  "Any Occasion",
  "Office",
  "Casual",
  "Date Night",
  "Party",
  "Travel",
] as const;
export type Occasion = (typeof OCCASION_OPTIONS)[number];

export const STYLE_OPTIONS = [
  "Any Style",
  "Minimalist",
  "Elegant",
  "Streetwear",
  "Boho",
  "Classic",
] as const;
export type Style = (typeof STYLE_OPTIONS)[number];

export const BUDGET_OPTIONS = [
  { value: "any", label: "Any Budget" },
  { value: "under-300", label: "Under 300 RON" },
  { value: "300-800", label: "300 - 800 RON" },
  { value: "800-plus", label: "800+ RON" },
] as const;
export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  image: string;
  matchPercent: number;
  price: number;
  mood: Exclude<Mood, "Any Mood">;
  occasion: Exclude<Occasion, "Any Occasion">;
  style: Exclude<Style, "Any Style">;
  budget: Exclude<BudgetValue, "any">;
}

export function budgetFromPrice(price: number): Recommendation["budget"] {
  if (price < 300) return "under-300";
  if (price <= 800) return "300-800";
  return "800-plus";
}

const RAW_RECOMMENDATIONS: Omit<Recommendation, "budget">[] = [
  {
    id: "rec-1",
    title: "Modern Minimalist",
    description: "Clean lines and neutral tones.",
    image: "https://picsum.photos/seed/foryou-1/500/650",
    matchPercent: 92,
    price: 732,
    mood: "Confident",
    occasion: "Office",
    style: "Minimalist",
  },
  {
    id: "rec-2",
    title: "Chic & Confident",
    description: "Balanced and sophisticated.",
    image: "https://picsum.photos/seed/foryou-2/500/650",
    matchPercent: 95,
    price: 684,
    mood: "Confident",
    occasion: "Date Night",
    style: "Elegant",
  },
  {
    id: "rec-3",
    title: "Smart Casual",
    description: "Relaxed yet put-together.",
    image: "https://picsum.photos/seed/foryou-3/500/650",
    matchPercent: 87,
    price: 512,
    mood: "Relaxed",
    occasion: "Casual",
    style: "Classic",
  },
  {
    id: "rec-4",
    title: "Effortless Office",
    description: "Polished with a modern edge.",
    image: "https://picsum.photos/seed/foryou-4/500/650",
    matchPercent: 85,
    price: 598,
    mood: "Confident",
    occasion: "Office",
    style: "Classic",
  },
  {
    id: "rec-5",
    title: "Golden Hour Date",
    description: "Soft tones for a romantic evening.",
    image: "https://picsum.photos/seed/foryou-5/500/650",
    matchPercent: 90,
    price: 445,
    mood: "Romantic",
    occasion: "Date Night",
    style: "Boho",
  },
  {
    id: "rec-6",
    title: "Weekend Wanderer",
    description: "Easy layers for travel days.",
    image: "https://picsum.photos/seed/foryou-6/500/650",
    matchPercent: 83,
    price: 289,
    mood: "Relaxed",
    occasion: "Travel",
    style: "Boho",
  },
  {
    id: "rec-7",
    title: "After Dark",
    description: "Bold statement for the party.",
    image: "https://picsum.photos/seed/foryou-7/500/650",
    matchPercent: 96,
    price: 860,
    mood: "Bold",
    occasion: "Party",
    style: "Elegant",
  },
  {
    id: "rec-8",
    title: "Playful Streets",
    description: "Fun colors, street-ready fit.",
    image: "https://picsum.photos/seed/foryou-8/500/650",
    matchPercent: 81,
    price: 356,
    mood: "Playful",
    occasion: "Casual",
    style: "Streetwear",
  },
  {
    id: "rec-9",
    title: "Quiet Luxury",
    description: "Understated elegance, elevated basics.",
    image: "https://picsum.photos/seed/foryou-9/500/650",
    matchPercent: 94,
    price: 910,
    mood: "Confident",
    occasion: "Office",
    style: "Elegant",
  },
  {
    id: "rec-10",
    title: "Sunday Soft",
    description: "Comfortable, warm and unhurried.",
    image: "https://picsum.photos/seed/foryou-10/500/650",
    matchPercent: 88,
    price: 265,
    mood: "Relaxed",
    occasion: "Casual",
    style: "Minimalist",
  },
  {
    id: "rec-11",
    title: "Bold Night Out",
    description: "Statement pieces that turn heads.",
    image: "https://picsum.photos/seed/foryou-11/500/650",
    matchPercent: 93,
    price: 720,
    mood: "Bold",
    occasion: "Party",
    style: "Streetwear",
  },
  {
    id: "rec-12",
    title: "Free Spirit",
    description: "Flowy pieces for a romantic getaway.",
    image: "https://picsum.photos/seed/foryou-12/500/650",
    matchPercent: 86,
    price: 410,
    mood: "Romantic",
    occasion: "Travel",
    style: "Boho",
  },
];

export const MASTER_RECOMMENDATIONS: Recommendation[] = RAW_RECOMMENDATIONS.map((item) => ({
  ...item,
  budget: budgetFromPrice(item.price),
}));
