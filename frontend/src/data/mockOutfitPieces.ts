export type PieceCategory = "Jacket" | "Top" | "Bottoms" | "Bag" | "Shoes";

export interface OutfitPiece {
  id: string;
  name: string;
  category: PieceCategory;
  price: number;
  image: string;
}

export const DEFAULT_OUTFIT_PIECES: OutfitPiece[] = [
  {
    id: "piece-jacket",
    name: "Tailored Blazer",
    category: "Jacket",
    price: 349,
    image: "https://picsum.photos/seed/builder-jacket/240/240",
  },
  {
    id: "piece-top",
    name: "Ribbed Tank",
    category: "Top",
    price: 129,
    image: "https://picsum.photos/seed/builder-top/240/240",
  },
  {
    id: "piece-bottoms",
    name: "Wide Leg Trousers",
    category: "Bottoms",
    price: 219,
    image: "https://picsum.photos/seed/builder-bottoms/240/240",
  },
  {
    id: "piece-bag",
    name: "Structured Tote",
    category: "Bag",
    price: 279,
    image: "https://picsum.photos/seed/builder-bag/240/240",
  },
  {
    id: "piece-shoes",
    name: "Pointed Heels",
    category: "Shoes",
    price: 259,
    image: "https://picsum.photos/seed/builder-shoes/240/240",
  },
];

export const PIECE_POSITION_CLASSES: Record<PieceCategory, string> = {
  Jacket: "left-[4%] top-[8%] rotate-[-6deg] z-10",
  Top: "left-[30%] top-[2%] rotate-[3deg] z-20",
  Bottoms: "left-[22%] bottom-[6%] rotate-[-2deg] z-10",
  Bag: "right-[6%] top-[14%] rotate-[6deg] z-20",
  Shoes: "right-[10%] bottom-[8%] rotate-[-4deg] z-10",
};
