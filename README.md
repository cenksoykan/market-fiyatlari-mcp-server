# Market Fiyatı MCP Server

Bu proje, Market Fiyatı API'si ile entegre olan bir MCP (Model Context Protocol) server sunmaktadır. Claude ve diğer MCP destekli AI sistemlerinin Türkiye'deki market fiyatlarını sorgulamasına olanak tanır.

## Özellikler

- **Ürün Arama**: İsim veya anahtar kelime ile ürün arama
- **Ürün Detayları**: ID veya barkod ile ürün bilgilerini görüntüleme
- **Fiyat Karşılaştırma**: Farklı marketlerdeki fiyatları karşılaştırma
- **Kaynak Erişimi**: URI tabanlı kaynak erişimi (search/ ve product/ endpoint'leri)
- **MCP Araçları**: AI'ın doğrudan kullanabileceği veri analiz araçları

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# TypeScript dosyalarını derle
npm run build

# Sunucuyu başlat
npm start
```

## Claude Desktop ile Kullanım

Claude Desktop'un `claude_desktop_config.json` dosyasına aşağıdaki yapılandırmayı ekleyin:

```json
{
  "mcpServers": {
    "marketfiyati": {
      "command": "npx",
      "args": ["-y @enescinar/market-fiyati-mcp"]
    }
  }
}
```

## API Kaynakları

Bu MCP server, Market Fiyatı API'sinin aşağıdaki endpointlerini kullanır:

- `/search`: Ürün araması yapar
- `/searchByIdentity`: ID veya barkod ile ürün getirir

## MCP Araçları

Sunucu aşağıdaki MCP araçlarını sağlar:

- `search_products`: Ürün araması yapar
- `get_product_by_id`: ID ile ürün getirir
- `get_product_by_barcode`: Barkod ile ürün getirir
- `compare_prices`: Fiyat karşılaştırması yapar

## MCP Kaynakları

Sunucu, üzerinden sorgulanabilecek şu MCP kaynaklarını sağlar:

- `market-fiyati://search/{query}`: Ürün araması
- `market-fiyati://product/{id}`: Ürün detayları

## Lisans

MIT
