@echo off
echo.
echo ========================================
echo     ESCALADOR - INICIAR SISTEMA
echo ========================================
echo.

echo 🚀 Iniciando backend...
start "Escalador Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo 🚀 Iniciando frontend...
start "Escalador Frontend" cmd /k "npm start"

echo.
echo ✅ Sistema iniciado!
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo.
echo Pressione qualquer tecla para sair...
pause >nul
