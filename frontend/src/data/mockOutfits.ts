export type OutfitTag =
  | "Casual"
  | "Office"
  | "Elegant"
  | "Streetwear"
  | "Summer"
  | "Winter";

export interface Outfit {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: OutfitTag;
  author: {
    name: string;
    avatar: string;
  };
  rating: number;
  likes: number;
  saves: number;
  isFollowing: boolean;
}

export const FILTER_CHIPS = [
  "All",
  "Following",
  "Casual",
  "Office",
  "Elegant",
  "Streetwear",
  "Summer",
  "Winter",
] as const;

export type FilterChip = (typeof FILTER_CHIPS)[number];

export const SORT_OPTIONS = ["Popular", "Newest", "Top Rated"] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const MOCK_OUTFITS: Outfit[] = [
  {
    id: "outfit-1",
    title: "Weekend mood",
    description: "Perfect for a coffee date or a slow Sunday walk.",
    image: "https://picsum.photos/seed/dresscode-1/600/750",
    tag: "Casual",
    author: { name: "Ioana R.", avatar: "https://i.pravatar.cc/100?img=5" },
    rating: 4.8,
    likes: 128,
    saves: 34,
    isFollowing: true,
  },
  {
    id: "outfit-2",
    title: "Power dressing",
    description: "Neutral tones, maximum impact for the boardroom.",
    image: "https://picsum.photos/seed/dresscode-2/600/750",
    tag: "Office",
    author: { name: "Maria D.", avatar: "https://i.pravatar.cc/100?img=12" },
    rating: 5.0,
    likes: 214,
    saves: 61,
    isFollowing: false,
  },
  {
    id: "outfit-3",
    title: "Evening elegance",
    description: "Simplicity is the ultimate sophistication.",
    image: "https://picsum.photos/seed/dresscode-3/600/750",
    tag: "Elegant",
    author: { name: "Alina S.", avatar: "https://i.pravatar.cc/100?img=32" },
    rating: 4.9,
    likes: 186,
    saves: 52,
    isFollowing: true,
  },
  {
    id: "outfit-4",
    title: "Effortless & chic",
    description: "All about those everyday pieces that just work.",
    image: "https://picsum.photos/seed/dresscode-4/600/750",
    tag: "Casual",
    author: { name: "Denisa P.", avatar: "https://i.pravatar.cc/100?img=47" },
    rating: 4.7,
    likes: 97,
    saves: 21,
    isFollowing: false,
  },
  {
    id: "outfit-5",
    title: "Concrete jungle",
    description: "Bold layers and statement sneakers for the city.",
    image: "https://picsum.photos/seed/dresscode-5/600/750",
    tag: "Streetwear",
    author: { name: "Bianca T.", avatar: "https://i.pravatar.cc/100?img=9" },
    rating: 4.6,
    likes: 152,
    saves: 40,
    isFollowing: false,
  },
  {
    id: "outfit-6",
    title: "Golden hour",
    description: "Light linen and warm tones for long summer evenings.",
    image: "https://picsum.photos/seed/dresscode-6/600/750",
    tag: "Summer",
    author: { name: "Elena V.", avatar: "https://i.pravatar.cc/100?img=25" },
    rating: 4.9,
    likes: 241,
    saves: 78,
    isFollowing: true,
  },
  {
    id: "outfit-7",
    title: "Frost & wool",
    description: "Layered knits and a long coat for freezing mornings.",
    image: "https://picsum.photos/seed/dresscode-7/600/750",
    tag: "Winter",
    author: { name: "Cristina M.", avatar: "https://i.pravatar.cc/100?img=41" },
    rating: 4.5,
    likes: 88,
    saves: 19,
    isFollowing: false,
  },
  {
    id: "outfit-8",
    title: "Boardroom ready",
    description: "A tailored blazer that means business.",
    image: "https://picsum.photos/seed/dresscode-8/600/750",
    tag: "Office",
    author: { name: "Andreea P.", avatar: "https://i.pravatar.cc/100?img=48" },
    rating: 4.8,
    likes: 173,
    saves: 46,
    isFollowing: true,
  },
  {
    id: "outfit-9",
    title: "Gala night",
    description: "A silhouette made for the spotlight.",
    image: "https://picsum.photos/seed/dresscode-9/600/750",
    tag: "Elegant",
    author: { name: "Roxana I.", avatar: "https://i.pravatar.cc/100?img=20" },
    rating: 5.0,
    likes: 302,
    saves: 95,
    isFollowing: false,
  },
  {
    id: "outfit-10",
    title: "Off-duty model",
    description: "Cargo pants and a cropped jacket, thrown together with ease.",
    image: "https://picsum.photos/seed/dresscode-10/600/750",
    tag: "Streetwear",
    author: { name: "Diana C.", avatar: "https://i.pravatar.cc/100?img=33" },
    rating: 4.4,
    likes: 65,
    saves: 12,
    isFollowing: false,
  },
  {
    id: "outfit-11",
    title: "Sunday market run",
    description: "Breezy dress, straw bag, zero effort.",
    image: "https://picsum.photos/seed/dresscode-11/600/750",
    tag: "Summer",
    author: { name: "Larisa N.", avatar: "https://i.pravatar.cc/100?img=16" },
    rating: 4.7,
    likes: 119,
    saves: 29,
    isFollowing: true,
  },
  {
    id: "outfit-12",
    title: "Snow day layers",
    description: "Puffer, turtleneck and boots for below-zero style.",
    image: "https://picsum.photos/seed/dresscode-12/600/750",
    tag: "Winter",
    author: { name: "Georgiana F.", avatar: "https://i.pravatar.cc/100?img=44" },
    rating: 4.6,
    likes: 74,
    saves: 17,
    isFollowing: false,
  },
];
