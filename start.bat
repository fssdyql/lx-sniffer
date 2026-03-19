@echo off
chcp 65001 >nul
title LX 数据包嗅探器控制台
color 0A

:menu
cls
echo   1. 普通模式 (仅在控制台打印歌曲请求信息)
echo   2. 捕捉模式 (自动记录并在本地生成测试包 JSON)

set /p choice="请输入: "

if "%choice%"=="1" goto normal
if "%choice%"=="2" goto capture

echo 输入错误，请重新输入！
pause
goto menu

:normal
cls
echo 正在启动普通模式...
node server.js
pause
goto end

:capture
cls
echo 正在启动自动生成数据包模式...
node server.js --capture
pause
goto end

:end