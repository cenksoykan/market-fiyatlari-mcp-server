#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import {
  compareProductPrices,
  getAddressFromLocation,
  getLocationFromAddress,
  getNearbyMarkets,
  getProductById,
  searchProducts
} from "./api.js";
import {
  isComparePricesArgs,
  isGetAddressFromLocationArgs,
  isGetLocationFromAddressArgs,
  isGetProductByIdArgs,
  isSearchNearbyMarketsArgs,
  isSearchProductArgs
} from "./types.js";

// .env dosyasından yapılandırmayı yükle
dotenv.config();

class MarketFiyatiServer {
  private server: Server;
  private searchCache: Map<string, any> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: "market-fiyati-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {}
        }
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    // Kaynakları listeleme
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: [
          {
            uri: "market-fiyati://search/patl%C4%B1can",
            name: "Patlıcan Fiyatları",
            mimeType: "application/json",
            description: "Patlıcan ürünleri için güncel market fiyatları"
          },
          {
            uri: "market-fiyati://product/00000000012A1",
            name: "Patlıcan (Normal)",
            mimeType: "application/json",
            description: "Normal patlıcan ürünü için fiyat bilgileri"
          }
        ],
        resourceTemplates: [
          {
            uriTemplate: "market-fiyati://search/{query}",
            name: "Ürün Arama",
            mimeType: "application/json",
            description: "İstenilen ürünün market fiyatları"
          },
          {
            uriTemplate: "market-fiyati://product/{id}",
            name: "Ürün Detayı",
            mimeType: "application/json",
            description: "Ürün ID'sine göre fiyat detayları"
          }
        ]
      })
    );

    // Kaynakları okuma
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = request.params.uri;

        // Arama sonuçları için
        if (uri.startsWith("market-fiyati://search/")) {
          const encodedQuery = uri.replace("market-fiyati://search/", "");
          const query = decodeURIComponent(encodedQuery);

          try {
            // Önbellekten kontrol et
            let searchResult;
            if (this.searchCache.has(query)) {
              searchResult = this.searchCache.get(query);
            } else {
              searchResult = await searchProducts(query);
              // Önbelleğe ekle (basit bir önbellek mekanizması)
              this.searchCache.set(query, searchResult);

              // Önbelleği 5 dakika sonra temizle
              setTimeout(() => {
                this.searchCache.delete(query);
              }, 5 * 60 * 1000);
            }

            return {
              contents: [{
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(searchResult, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `API error: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            );
          }
        }

        // Ürün detayları için
        if (uri.startsWith("market-fiyati://product/")) {
          const productId = uri.replace("market-fiyati://product/", "");

          try {
            const product = await getProductById(productId);

            if (!product) {
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Ürün bulunamadı: ${productId}`
              );
            }

            return {
              contents: [{
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(product, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `API error: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            );
          }
        }

        throw new McpError(
          ErrorCode.InvalidRequest,
          `Desteklenmeyen kaynak: ${uri}`
        );
      }
    );
  }

  private setupToolHandlers(): void {
    // Araçları listeleme
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
          {
            name: "search_products",
            description: "Belirtilen arama sorgusuyla ürünleri arar",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Arama sorgusu"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "get_product_by_id",
            description: "Ürün ID'sine göre ürün detaylarını getirir",
            inputSchema: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  description: "Ürün ID'si"
                }
              },
              required: ["productId"]
            }
          },
          {
            name: "compare_prices",
            description: "Bir ürünün farklı marketlerdeki fiyatlarını karşılaştırır",
            inputSchema: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  description: "Ürün ID'si"
                },
                market: {
                  type: "string",
                  description: "Belirli bir market için filtreleme (opsiyonel)"
                }
              },
              required: ["productId"]
            }
          },
          {
            name: "search_nearby_markets",
            description: "Belirtilen konuma yakın marketleri listeler",
            inputSchema: {
              type: "object",
              properties: {
                latitude: {
                  type: "number",
                  description: "Enlem değeri"
                },
                longitude: {
                  type: "number",
                  description: "Boylam değeri"
                },
                distance: {
                  type: "number",
                  description: "Arama yarıçapı (km cinsinden, varsayılan: 1)"
                }
              },
              required: ["latitude", "longitude"]
            }
          },
          {
            name: "get_location_from_address",
            description: "Adres metninden konum (enlem/boylam) bilgisi alır",
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Konum adresi"
                },
                limit: {
                  type: "number",
                  description: "Maksimum sonuç sayısı (varsayılan: 1)"
                },
                countryCode: {
                  type: "string",
                  description: "İki harfli ülke kodu (varsayılan: 'tr')"
                }
              },
              required: ["address"]
            }
          },
          {
            name: "get_address_from_location",
            description: "Konum bilgisinden (enlem/boylam) adres bilgisi alır",
            inputSchema: {
              type: "object",
              properties: {
                latitude: {
                  type: "number",
                  description: "Enlem değeri"
                },
                longitude: {
                  type: "number",
                  description: "Boylam değeri"
                },
                language: {
                  type: "string",
                  description: "Adres dilini belirler (varsayılan: 'tr')"
                }
              },
              required: ["latitude", "longitude"]
            }
          }
        ]
      })
    );

    // Araç çağrılarını işleme
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        try {
          // Ürün Arama
          if (name === "search_products") {
            if (!isSearchProductArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Geçersiz arama parametreleri"
              );
            }

            const searchResult = await searchProducts(args.query);
            return {
              content: [{
                type: "text",
                text: JSON.stringify(searchResult, null, 2)
              }]
            };
          }

          // Ürün ID'sine göre getirme
          if (name === "get_product_by_id") {
            if (!isGetProductByIdArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Geçersiz ürün ID parametresi"
              );
            }

            const product = await getProductById(args.productId);

            if (!product) {
              return {
                content: [{
                  type: "text",
                  text: `Ürün bulunamadı: ${args.productId}`
                }],
                isError: true
              };
            }

            return {
              content: [{
                type: "text",
                text: JSON.stringify(product, null, 2)
              }]
            };
          }

          // Fiyat karşılaştırma
          if (name === "compare_prices") {
            if (!isComparePricesArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Geçersiz fiyat karşılaştırma parametreleri"
              );
            }

            const comparisonResult = await compareProductPrices(args.productId, args.market);

            return {
              content: [{
                type: "text",
                text: JSON.stringify(comparisonResult, null, 2)
              }]
            };
          }

          // Yakındaki marketleri listele
          if (name === "search_nearby_markets") {
            if (!isSearchNearbyMarketsArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Geçersiz yakınlık araması parametreleri"
              );
            }

            const nearbyMarkets = await getNearbyMarkets(
              args.latitude,
              args.longitude,
              args.distance
            );

            return {
              content: [{
                type: "text",
                text: JSON.stringify(nearbyMarkets, null, 2)
              }]
            };
          }

          // Adres metninden konum bilgisi al (geocoding)
          if (name === "get_location_from_address") {
            if (!isGetLocationFromAddressArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Geçersiz adres parametreleri"
              );
            }

            const locationResults = await getLocationFromAddress(
              args.address,
              args.limit,
              args.countryCode
            );

            return {
              content: [{
                type: "text",
                text: JSON.stringify(locationResults, null, 2)
              }]
            };
          }

          // Konum bilgisinden adres al (reverse geocoding)
          if (name === "get_address_from_location") {
            if (!isGetAddressFromLocationArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Geçersiz konum parametreleri"
              );
            }

            const addressResult = await getAddressFromLocation(
              args.latitude,
              args.longitude,
              args.language
            );

            return {
              content: [{
                type: "text",
                text: JSON.stringify(addressResult, null, 2)
              }]
            };
          }

          throw new McpError(
            ErrorCode.MethodNotFound,
            `Bilinmeyen araç: ${name}`
          );
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }

          return {
            content: [{
              type: "text",
              text: `İşlem sırasında hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            }],
            isError: true
          };
        }
      }
    );
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Bilgi mesajını stderr'e yazdır (stdout MCP protokolü için kullanılıyor)
    console.error("Market Fiyatı MCP sunucusu başlatıldı (stdio üzerinden çalışıyor)");
  }
}

const server = new MarketFiyatiServer();
server.run().catch(error => {
  console.error("Sunucu başlatma hatası:", error);
  process.exit(1);
});
