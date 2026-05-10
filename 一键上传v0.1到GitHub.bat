@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0push-v0.1-to-github.ps1"
