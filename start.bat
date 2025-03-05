@echo off
echo Market Fiyati MCP Server Kuruluyor ve Baslatiliyor

echo Paketler yukleniyor...
call npm install

echo TypeScript dosyalari derleniyor...
call npm run build

echo Server baslatiliyor...
call npm start

pause
