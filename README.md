# Market Fiyatı MCP Server

Bu proje, Market Fiyatı API'si ile entegre olan bir MCP (Model Context Protocol) server sunmaktadır. Claude ve diğer MCP destekli AI sistemlerinin Türkiye'deki market fiyatlarını sorgulamasına olanak tanır.

## Özellikler

- **Ürün Arama**: İsim veya anahtar kelime ile ürün arama
- **Fiyat Karşılaştırma**: Farklı marketlerdeki fiyatları karşılaştırma
- **Yakındaki Marketler**: Belirli bir konuma yakın marketleri listeleme
- **Kaynak Erişimi**: URI tabanlı kaynak erişimi (search/ ve product/ endpoint'leri)
- **MCP Araçları**: AI'ın doğrudan kullanabileceği veri analiz araçları

## Kurulum

### Standart Kurulum

```bash
# Bağımlılıkları yükle
npm install

# TypeScript dosyalarını derle
npm run build

# Sunucuyu başlat
npm start
```

### Docker ile Kurulum

Docker imajını oluştur:

```bash
docker build -t mcp/marketfiyati .
```

## Claude Desktop ile Kullanım

Claude Desktop'un `claude_desktop_config.json` dosyasına aşağıdaki yapılandırmalardan uygun olanı ekleyin:

### Standart Kurulum İçin

```json
{
  "mcpServers": {
    "marketfiyati": {
      "command": "node",
      "args": [
        "${workspaceFolder}/build/index.js"
      ]
    }
  }
}
```

### Docker Kurulumu İçin

```json
{
  "mcpServers": {
    "marketfiyati": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "mcp/marketfiyati"
      ]
    }
  }
}
```

### NPX ile Kurulum

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
- `/searchByIdentity`: ID ile ürün getirir
- `/nearest`: Yakındaki marketleri listeler

## MCP Araçları

Sunucu aşağıdaki MCP araçlarını sağlar:

- `search_products`: Ürün araması yapar
- `get_product_by_id`: ID ile ürün getirir
- `compare_prices`: Fiyat karşılaştırması yapar
- `search_nearby_markets`: Yakındaki marketleri listeler

## MCP Kaynakları

Sunucu, üzerinden sorgulanabilecek şu MCP kaynaklarını sağlar:

- `market-fiyati://search/{query}`: Ürün araması
- `market-fiyati://product/{id}`: Ürün detayları

## Lisans

MIT
