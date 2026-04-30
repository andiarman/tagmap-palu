@echo off
title TagMap Spatial Server
echo ==============================================
echo Menjalankan TagMap Spatial Application...
echo Jangan tutup jendela ini selama Anda menggunakan aplikasi.
echo Tutup jendela ini jika Anda sudah selesai.
echo ==============================================
cd /d "%~dp0"

:: Jalankan server dan buka browser secara otomatis
call npm run dev -- --open
