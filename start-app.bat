@echo off
chcp 65001 >nul
title Khmer Learning
echo.
echo  Khmer Learning - កំពុងបើកកម្មវិធី...
echo.

cd /d "%~dp0backend"
start "Khmer Learning API" cmd /k "..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

cd /d "%~dp0frontend"
start "Khmer Learning App" cmd /k "npm run dev"

echo  កំពុងរង់ចាំ API និងកម្មវិធី (២០ វិនាទី)...
timeout /t 20 >nul
start http://localhost:5173

echo.
echo  បើករួចរាល់! សូមចូល http://localhost:5173
echo  បិទ៖ បិទបង្អួច Khmer Learning API និង Khmer Learning App។
echo.
pause
