import axios from 'axios';
import dotenv from 'dotenv';
import {
  Product,
  ProductDepotInfo,
  SearchByIdentityRequest,
  SearchRequest,
  SearchResponse
} from './types.js';

// .env dosyasından yapılandırmayı yükle
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.marketfiyati.org.tr/api/v2';
// const API_KEY = process.env.API_KEY; // Eğer gerekirse

// Axios örneğini yapılandır
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: API_KEY ? `Bearer ${API_KEY}` : undefined, // Eğer gerekirse
  }
});

export async function searchProducts(query: string): Promise<SearchResponse> {
  try {
    const requestData: SearchRequest = {
      keywords: query
    };

    const response = await apiClient.post<SearchResponse>('/search', requestData);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error(`Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const requestData: SearchByIdentityRequest = {
      identity: productId,
      identityType: 'id'
    };

    const response = await apiClient.post<SearchResponse>('/searchByIdentity', requestData);

    if (response.data.content && response.data.content.length > 0) {
      return response.data.content[0];
    }

    return null;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw new Error(`Failed to get product by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function compareProductPrices(productId: string, market?: string): Promise<ProductComparisonResult> {
  try {
    const product = await getProductById(productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    let priceList = product.productDepotInfoList;

    // Belirli bir market için filtreleme yap
    if (market) {
      priceList = priceList.filter(
        item => item.marketAdi.toLowerCase() === market.toLowerCase()
      );
    }

    // Fiyata göre sırala
    priceList.sort((a, b) => a.price - b.price);

    // En ucuz, en pahalı ve ortalama fiyatları hesapla
    const cheapest = priceList.length > 0 ? priceList[0] : null;
    const mostExpensive = priceList.length > 0 ? priceList[priceList.length - 1] : null;
    const averagePrice = priceList.length > 0
      ? priceList.reduce((sum, item) => sum + item.price, 0) / priceList.length
      : 0;

    return {
      product,
      priceComparison: {
        cheapest,
        mostExpensive,
        averagePrice,
        priceRange: mostExpensive && cheapest
          ? mostExpensive.price - cheapest.price
          : 0,
        priceDifferencePercentage: cheapest && mostExpensive
          ? ((mostExpensive.price - cheapest.price) / cheapest.price) * 100
          : 0
      }
    };
  } catch (error) {
    console.error('Error comparing product prices:', error);
    throw new Error(`Failed to compare product prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface ProductComparisonResult {
  product: Product;
  priceComparison: {
    cheapest: ProductDepotInfo | null;
    mostExpensive: ProductDepotInfo | null;
    averagePrice: number;
    priceRange: number;
    priceDifferencePercentage: number;
  };
}
