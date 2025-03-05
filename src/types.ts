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
