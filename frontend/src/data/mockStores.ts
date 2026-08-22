export interface Store {
  id: string;
  name: string;
  initials: string;
  badgeClass: string;
  address: string;
  distanceKm: number;
  isOpen: boolean;
  hoursLabel: string;
  pinPosition: { top: string; left: string };
}

export const MOCK_STORES: Store[] = [
  {
    id: "store-zara",
    name: "Zara",
    initials: "Z",
    badgeClass: "bg-ink text-white",
    address: "Unirii Shopping Center",
    distanceKm: 0.4,
    isOpen: true,
    hoursLabel: "Closes 21:00",
    pinPosition: { top: "28%", left: "34%" },
  },
  {
    id: "store-mango",
    name: "Mango",
    initials: "M",
    badgeClass: "bg-orange-500 text-white",
    address: "Promenada Mall",
    distanceKm: 0.7,
    isOpen: true,
    hoursLabel: "Closes 22:00",
    pinPosition: { top: "45%", left: "60%" },
  },
  {
    id: "store-massimo-dutti",
    name: "Massimo Dutti",
    initials: "MD",
    badgeClass: "bg-stone-800 text-white",
    address: "AFI Cotroceni",
    distanceKm: 1.2,
    isOpen: true,
    hoursLabel: "Closes 21:00",
    pinPosition: { top: "62%", left: "22%" },
  },
  {
    id: "store-hm",
    name: "H&M",
    initials: "H&M",
    badgeClass: "bg-red-600 text-white",
    address: "Băneasa Shopping City",
    distanceKm: 2.1,
    isOpen: true,
    hoursLabel: "Closes 22:00",
    pinPosition: { top: "20%", left: "72%" },
  },
  {
    id: "store-bershka",
    name: "Bershka",
    initials: "B",
    badgeClass: "bg-slate-700 text-white",
    address: "Mall Vitan",
    distanceKm: 1.8,
    isOpen: false,
    hoursLabel: "Opens 10:00",
    pinPosition: { top: "75%", left: "52%" },
  },
  {
    id: "store-stradivarius",
    name: "Stradivarius",
    initials: "S",
    badgeClass: "bg-rose-700 text-white",
    address: "AFI Palace Cotroceni",
    distanceKm: 2.6,
    isOpen: false,
    hoursLabel: "Opens 10:00",
    pinPosition: { top: "50%", left: "82%" },
  },
];
