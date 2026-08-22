export interface ProfileStat {
  label: string;
  value: number;
}

export const PROFILE = {
  name: "Andreea Popescu",
  location: "Bucharest, Romania",
  avatar: "https://i.pravatar.cc/300?img=47",
  preferredStyles: ["Minimalist", "Elegant", "Classic", "Neutral Tones"],
  stats: [
    { label: "Saved Outfits", value: 28 },
    { label: "Try-Ons", value: 14 },
    { label: "Reviews", value: 12 },
  ] satisfies ProfileStat[],
};
