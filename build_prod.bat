@echo off
echo Building Frontend...
cd frontend
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build failed.
    exit /b %ERRORLEVEL%
)

echo.
echo Cleaning Backend Static Resources...
if exist ..\backend\src\main\resources\static (
    rmdir /s /q ..\backend\src\main\resources\static
)
mkdir ..\backend\src\main\resources\static

echo Copying Frontend build to Backend...
xcopy /e /i /y dist\* ..\backend\src\main\resources\static\

cd ..\backend
echo.
echo Building Backend (JAR)...
call mvnw clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo Backend build failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo READY FOR PRODUCTION!
echo Your executable is in: backend\target\backend-0.0.1-SNAPSHOT.jar
echo.
echo To run in production:
echo java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
echo ========================================================
cd ..
