// Shared constants for the installer network pages

export const PRODUCTS = [
  { value: "all", label: "All products" },
  { value: "legend4ch", label: "The Legend 4CH" },
  { value: "m42ch", label: "M4 2CH" },
  { value: "m43ch", label: "M4 3CH" },
  { value: "m4quad", label: "M4 QUAD" },
  { value: "xr10pro", label: "XR10 Pro" },
  { value: "dc4kplus", label: "DC4K Plus" },
] as const;

export const VEHICLES = [
  { value: "all", label: "All vehicles" },
  { value: "jeep", label: "Jeep / Off-road" },
  { value: "truck", label: "Truck / SUV" },
  { value: "sedan", label: "Sedan" },
  { value: "van", label: "Van / RV" },
] as const;

export const INSTALL_TYPES = [
  { value: "all", label: "All install types" },
  { value: "hardwire", label: "Hardwire install" },
  { value: "standard", label: "Standard install" },
  { value: "multi", label: "Multi-camera setup" },
  { value: "rear", label: "Rear camera install" },
] as const;

export const PRODUCT_LABEL_MAP: Record<string, string> = Object.fromEntries(
  PRODUCTS.filter((p) => p.value !== "all").map((p) => [p.value, p.label])
);

export type InstallerUploadItem = {
  id: string;
  fileUrl: string;
  fileType: string;
  caption: string | null;
};

export type InstallerCardData = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  zipCode: string | null;
  rating: number;
  reviewCount: number;
  startingPrice: number | null;
  supportedProducts: string[];
  vehicleTypes: string[];
  installTypes: string[];
  tags: string[];
  hasHardwire: boolean;
  hasMultiCamera: boolean;
  hasJeepExperience: boolean;
  offersMobile: boolean;
  offersShop: boolean;
  availableThisWeek: boolean;
  weekendAvailable: boolean;
  fastResponse: boolean;
  customerQuote: string | null;
  facts: string[];
  completedInstalls: number;
  region: string | null;
  uploads: InstallerUploadItem[];
};

export type SearchParams = {
  zip: string;
  product: string;
  vehicle: string;
  install: string;
  sort: string;
  // filter flags
  hardwire: boolean;
  multi: boolean;
  jeep: boolean;
  mobile: boolean;
  shop: boolean;
  topRated: boolean;
  manyReviews: boolean;
  fast: boolean;
  week: boolean;
  weekend: boolean;
};

export const DEFAULT_SEARCH: SearchParams = {
  zip: "",
  product: "all",
  vehicle: "all",
  install: "all",
  sort: "recommended",
  hardwire: false,
  multi: false,
  jeep: false,
  mobile: false,
  shop: false,
  topRated: false,
  manyReviews: false,
  fast: false,
  week: false,
  weekend: false,
};

export function buildSearchQuery(params: SearchParams): string {
  const q = new URLSearchParams();
  if (params.zip) q.set("zip", params.zip);
  if (params.product !== "all") q.set("product", params.product);
  if (params.vehicle !== "all") q.set("vehicle", params.vehicle);
  if (params.install !== "all") q.set("install", params.install);
  if (params.sort !== "recommended") q.set("sort", params.sort);
  if (params.hardwire) q.set("hardwire", "1");
  if (params.multi) q.set("multi", "1");
  if (params.jeep) q.set("jeep", "1");
  if (params.mobile) q.set("mobile", "1");
  if (params.shop) q.set("shop", "1");
  if (params.topRated) q.set("topRated", "1");
  if (params.manyReviews) q.set("manyReviews", "1");
  if (params.fast) q.set("fast", "1");
  if (params.week) q.set("week", "1");
  if (params.weekend) q.set("weekend", "1");
  return q.toString();
}
