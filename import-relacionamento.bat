@echo off
echo.
echo ========================================
echo     ESCALADOR - IMPORTAR RELACIONAMENTO
echo ========================================
echo.

cd backend

echo 🔄 Importando dados de "Relacionamento" para o banco...
node scripts/import-scraper-data.js "../fb-scraper-main/data import/relacionamento.json"

echo.
echo ✅ Importacao de Relacionamento concluida!
echo.
echo Para ver os dados:
echo 1. Inicie o backend: npm start
echo 2. Inicie o frontend: npm start (no diretorio raiz)
echo 3. Acesse: http://localhost:3000
echo.
pause
