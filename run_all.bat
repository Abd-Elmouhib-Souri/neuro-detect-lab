@echo off
TITLE MindCare AI - Launcher
COLOR 0B

echo ==========================================
echo       LANCEMENT DE MINDCARE AI
echo ==========================================
echo.

:: 1. Lancement du Service ML (Python)
echo [1/3] Demarrage du Service ML (Port 5001)...
start "MindCare AI - ML Service" cmd /k "cd ml_service && .venv\Scripts\activate && python app.py"

:: Attente de 2 secondes pour laisser le temps au ML de charger
timeout /t 2 /nobreak > nul

:: 2. Lancement du Backend (Node.js)
echo [2/3] Demarrage du Backend (Port 5000)...
start "MindCare AI - Backend" cmd /k "cd backend && npm run dev"

:: Attente de 2 secondes
timeout /t 2 /nobreak > nul

:: 3. Lancement du Frontend (Vite/React)
echo [3/3] Demarrage du Frontend (Port 8080)...
start "MindCare AI - Frontend" cmd /k "cd neuro-detect-lab-main && npm run dev"

echo.
echo ==========================================
echo    TOUS LES SERVICES SONT EN COURS...
echo ==========================================
echo.
echo Gardez ces fenetres ouvertes pour le bon fonctionnement.
echo.
pause
