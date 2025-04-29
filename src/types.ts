// Market Fiyatı API Yanıt Tipleri
export interface ProductDepotInfo {
  depotId: string;
  depotName: string;
  price: number;
  marketAdi: string;
  percentage: number;
  longitude: number;
  latitude: number;
  indexTime: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  imageUrl: string;
  categories: string[];
  productDepotInfoList: ProductDepotInfo[];
}

export interface SearchResponse {
  numberOfFound: number;
  content: Product[];
  facetMap: Record<string, Array<{ name: string; count: number }>> | null;
}

// Yakındaki marketler için tiplemeler
export interface NearbyMarketLocation {
  lon: number;
  lat: number;
}

export interface NearbyMarket {
  id: string;
  sellerName: string;
  location: NearbyMarketLocation;
  marketName: string;
  distance: number;
}

export interface SearchNearbyMarketsRequest {
  latitude: number;
  longitude: number;
  distance: number;
}

export interface SearchNearbyMarketsArgs {
  latitude: number;
  longitude: number;
  distance?: number;
}

export interface SearchByIdentityRequest {
  identity: string;
  identityType: "id" | "barcode";
}

export interface SearchRequest {
  keywords: string;
}

// MCP Araçları için Tiplemeler
export interface SearchProductArgs {
  query: string;
}

export interface GetProductByIdArgs {
  productId: string;
}

export interface ComparePricesArgs {
  productId: string;
  market?: string;
}

// Yardımcı tip korumaları
export function isSearchProductArgs(args: any): args is SearchProductArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    typeof args.query === "string"
  );
}

export function isGetProductByIdArgs(args: any): args is GetProductByIdArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    typeof args.productId === "string"
  );
}

export function isComparePricesArgs(args: any): args is ComparePricesArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    typeof args.productId === "string" &&
    (args.market === undefined || typeof args.market === "string")
  );
}

export function isSearchNearbyMarketsArgs(args: any): args is SearchNearbyMarketsArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    typeof args.latitude === "number" &&
    typeof args.longitude === "number" &&
    (args.distance === undefined || typeof args.distance === "number")
  );
}
