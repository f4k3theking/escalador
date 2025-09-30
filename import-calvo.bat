@echo off
echo.
echo ========================================
echo     ESCALADOR - IMPORTAR CALVICIE
echo ========================================
echo.

cd backend

echo 🔄 Importando dados de "Calvície" para o banco...
node scripts/import-scraper-data.js "../fb-scraper-main/calvo.json"

echo.
echo ✅ Importacao de Calvície concluida!
echo.
echo Para ver os dados:
echo 1. Inicie o backend: npm start
echo 2. Inicie o frontend: npm start (no diretorio raiz)
echo 3. Acesse: http://localhost:3000
echo.
pause
