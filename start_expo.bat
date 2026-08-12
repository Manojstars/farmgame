@echo off
cls
echo ========================================
echo FARM LIFE EXPO DEVELOPMENT SERVER
echo ========================================
echo.
echo Starting Expo at C:\Dev\FarmGame
echo.
cd /d C:\Dev\FarmGame
echo Clearing cache...
call npx expo start --clear
pause
