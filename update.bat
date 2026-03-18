@echo off
echo ========================================================
echo   ACTUALIZADOR AUTOMATICO DEL SISTEMA POS AGROPECUARIO
echo ========================================================
echo.
echo Descargando ultimos cambios de la nube...
git pull origin main

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] No se pudieron descargar las actualizaciones. 
    echo Verifique su conexion a internet o contacte al administrador.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [EXITO] Las actualizaciones se descargaron correctamente.
echo.
echo Nota: Si hubo cambios importantes en el codigo, se recomienda 
echo       reiniciar los servicios backend y frontend.
echo.
pause
