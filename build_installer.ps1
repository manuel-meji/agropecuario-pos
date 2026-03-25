$ErrorActionPreference = "Stop"
$BuildDir = "c:\agropecuario-pos\installer_build"

Write-Host "Preparando directorio de construcción..."
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null

Write-Host "Copiando componentes de la aplicación..."
Copy-Item "c:\agropecuario-pos\backend\target\backend-0.0.1-SNAPSHOT.jar" "$BuildDir\backend.jar" -Force
Copy-Item "c:\agropecuario-pos\start_pos.vbs" "$BuildDir\" -Force
Copy-Item "c:\agropecuario-pos\stop_pos.vbs" "$BuildDir\" -Force

Write-Host "Descargando JRE 17 (Eclipse Temurin)..."
$JreUrl = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jre/hotspot/normal/eclipse?project=jdk"
$JreZip = "$BuildDir\jre.zip"
Invoke-WebRequest -Uri $JreUrl -OutFile $JreZip
Write-Host "Extrayendo JRE..."
Expand-Archive -Path $JreZip -DestinationPath "$BuildDir\jre_temp" -Force
$JreExtractedDir = Get-ChildItem -Directory "$BuildDir\jre_temp" | Select-Object -First 1
Move-Item -Path "$($JreExtractedDir.FullName)\*" -Destination "$BuildDir\jre" -Force
Remove-Item -Recurse -Force "$BuildDir\jre_temp"
Remove-Item -Force $JreZip

Write-Host "Descargando MariaDB Portable 10.11 LTS..."
$MariaDbUrl = "https://downloads.mariadb.com/MariaDB/mariadb-10.11.7/winx64-packages/mariadb-10.11.7-winx64.zip"
$MariaDbZip = "$BuildDir\mariadb.zip"
Invoke-WebRequest -Uri $MariaDbUrl -OutFile $MariaDbZip
Write-Host "Extrayendo MariaDB..."
Expand-Archive -Path $MariaDbZip -DestinationPath "$BuildDir\mariadb_temp" -Force
$MariaDbExtractedDir = Get-ChildItem -Directory "$BuildDir\mariadb_temp" | Select-Object -First 1
Move-Item -Path "$($MariaDbExtractedDir.FullName)" -Destination "$BuildDir\mariadb" -Force
Remove-Item -Recurse -Force "$BuildDir\mariadb_temp"
Remove-Item -Force $MariaDbZip

Write-Host "¡Directorio preparado exitosamente en $BuildDir!"
Write-Host "Ahora puedes hacer clic derecho en 'installer.iss' y compilar con Inno Setup."
