@echo off
title Sentinel AI - On-Device Threat Detection Platform (PS-05)
echo ==============================================================
echo   Sentinel AI / AegisEdge - On-Device Threat Defense
echo   Code Carnival 3.0 • Problem Statement PS-05
echo   Team Creative Criminals (ID: X8Y9)
echo ==============================================================
echo.
echo [*] Launching Local App on http://localhost:3000 ...
echo [*] 100%% On-Device Execution (Zero Cloud Data Transmission)
echo.

start "" "http://localhost:3000"
cmd /c npm.cmd --prefix client run dev
