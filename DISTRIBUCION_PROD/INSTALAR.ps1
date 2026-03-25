<#
.SYNOPSIS
    Script de instalación para Agropecuario POS.
    Instala Java 17, MariaDB y configura la base de datos.
#>

$ErrorActionPreference = "Stop"

function Write-Info($msg) {
    Write-Host "[INFO] $msg" -ForegroundColor Cyan
}

function Write-Error-Custom($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
}

function Check-Admin {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Error-Custom "Este script DEBE ejecutarse como Administrador."
        exit 1
    }
}

Check-Admin

Write-Info "Iniciando instalación de dependencias..."

# 1. Instalar Java 17 si no está presente
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Info "Instalando Java 17 via winget..."
    winget install --id Oracle.JDK.17 --silent --accept-package-agreements --accept-source-agreements
} else {
    Write-Info "Java ya está instalado."
}

# 2. Instalar MariaDB si no está presente
$portInUse = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not (Get-Service "MariaDB" -ErrorAction SilentlyContinue) -and -not (Get-Service "MySQL*" -ErrorAction SilentlyContinue) -and -not $portInUse) {
    Write-Info "Instalando MariaDB via winget..."
    # ID correcto para MariaDB Server
    winget install --id MariaDB.Server --silent --accept-package-agreements --accept-source-agreements
    Start-Sleep -Seconds 15
} else {
    Write-Info "Se detectó MariaDB o MySQL ya instalado ."
}

# 3. Configurar contraseña de root de MariaDB a '1234' (si es posible)
Write-Info "Configurando base de datos..."
try {
    # El path común es C:\Program Files\MariaDB 11.2\bin\mysql.exe (dependiendo de la versión)
    # Intentaremos encontrar mysql.exe
    $mysql = Get-Command "mysql.exe" -ErrorAction SilentlyContinue
    if ($mysql) {
        $mysqlPath = $mysql.Source
    } else {
        $mysqlPath = (Get-ChildItem -Path "C:\Program Files\MariaDB*" -Filter "mysql.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
        if (-not $mysqlPath) {
             # Buscar en MySQL también en caso de tener workbench
             $mysqlPath = (Get-ChildItem -Path "C:\Program Files\MySQL*" -Filter "mysql.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
        }
    }

    if ($mysqlPath) {
        Write-Info "Intentando inicializar la base de datos..."
        & "$mysqlPath" -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS agropecuario_pos;" 2>$null
        if ($LASTEXITCODE -ne 0) {
            # Si fallo intentamos cambiar la clave sin pass al principio (solo funcionara en fresh installs)
            & "$mysqlPath" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '1234'; CREATE DATABASE IF NOT EXISTS agropecuario_pos;" 2>$null
        }
    }
} catch {
    Write-Host "No se pudo configurar el password automáticamente o crear DB, asegúrese de que el password de root sea '1234' y de crear la bd 'agropecuario_pos'." -ForegroundColor Yellow
}

# 3.5 Cargar catálogo CABYS usando el script de Python
Write-Info "Preparando la carga del catálogo CABYS..."
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonInstalled) {
    Write-Info "Instalando Python via winget (requerido para cargar CABYS)..."
    winget install --id Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
    Start-Sleep -Seconds 10
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User") + ";$env:LOCALAPPDATA\Programs\Python\Python311"
    $pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
}

if ($pythonInstalled) {
    Write-Info "Instalando dependencias de Python (pandas, sqlalchemy, pymysql, openpyxl)..."
    try {
        & "python" -m pip install pandas sqlalchemy pymysql openpyxl --quiet
        
        $cabysDir = Join-Path $PSScriptRoot "cargar_cabys"
        $scriptPy = Join-Path $cabysDir "migracion_bd.py"
        
        if (Test-Path $scriptPy) {
            Write-Info "Ejecutando script migracion_bd.py (puede tardar unos momentos)..."
            Push-Location $cabysDir
            & "python" migracion_bd.py
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[ADVERTENCIA] El script de Python reportó un problema durante la carga de CABYS (ya estaba cargado o un error de datos)." -ForegroundColor Yellow
            }
            Pop-Location
            Write-Info "Proceso de carga de CABYS finalizado."
        } else {
            Write-Host "[ADVERTENCIA] No se encontró el script $scriptPy." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] Hubo un problema al preparar/ejecutar el script de Python para CABYS." -ForegroundColor Red
        Pop-Location -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "[ADVERTENCIA] No se detectó o instaló Python. La carga de CABYS deberá hacerse manualmente." -ForegroundColor Yellow
}

# 4. Crear carpeta de aplicación
$appDir = "C:\AgropecuarioPOS"
if (-not (Test-Path $appDir)) {
    New-Item -Path $appDir -ItemType Directory
}

# 5. Buscar y copiar JAR
# Buscamos primero en el mismo directorio (para la carpeta DISTRIBUCION_PROD)
$jarSource = Join-Path $PSScriptRoot "backend-0.0.1-SNAPSHOT.jar"
if (-not (Test-Path $jarSource)) {
    # Si no está ahí, lo buscamos en backend/target (para desarrollo)
    $jarSource = Join-Path $PSScriptRoot "backend\target\backend-0.0.1-SNAPSHOT.jar"
}

if (Test-Path $jarSource) {
    Copy-Item -Path $jarSource -Destination "$appDir\agropecuario-pos.jar" -Force
} else {
    Write-Error-Custom "No se encontró el archivo JAR. Asegúrate de que 'backend-0.0.1-SNAPSHOT.jar' esté junto a este script."
    exit 1
}

# 5.5 Crear ejecutable .bat que se mantenga abierto si hay error
Write-Info "Creando archivo ejecutable (ejecutar.bat)..."
$batContent = "@echo off`r`ntitle Agropecuario POS`r`necho Levantando el sistema, por favor espere...`r`njava -jar `"$appDir\agropecuario-pos.jar`"`r`nif %ERRORLEVEL% NEQ 0 (`r`n    echo.`r`n    echo [ERROR] El sistema se detuvo debido a un problema (Revise si la clave de MySQL es incorrecta).`r`n    pause`r`n)"
Set-Content -Path "$appDir\ejecutar.bat" -Value $batContent

# 6. Crear acceso directo en el Escritorio
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Agropecuario POS.lnk")
$Shortcut.TargetPath = "$appDir\ejecutar.bat"
$Shortcut.WorkingDirectory = $appDir
# Un icono de candado o un shell32 genérico
$Shortcut.IconLocation = "shell32.dll, 44"
$Shortcut.Save()

Write-Info "Instalación completada con éxito."
Write-Info "Puede iniciar el sistema desde el acceso directo 'Agropecuario POS' en su escritorio."
Write-Info "El sistema intentará abrir automáticamente el navegador en http://localhost:8080."
Write-Host "NOTA: Si el sistema falla abriendo la consola al dar clic en el escritorio, es probable que la base de datos MySQL ya instalada tenga una contraseña distinta a '1234'. Puede crear la BD 'agropecuario_pos' manualmente y cambiar la cuenta a 1234 en el Workbench." -ForegroundColor Yellow
pause
