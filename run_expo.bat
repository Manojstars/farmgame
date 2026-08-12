@echo off
setlocal enabledelayedexpansion

title Farm Life Expo Server
cd /d C:\Dev\FarmGame

echo.
echo ================================
echo   FARM LIFE EXPO SERVER
echo ================================
echo.
echo Starting development server...
echo Location: C:\Dev\FarmGame
echo.

call npx expo start --clear

pause
