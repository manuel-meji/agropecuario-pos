# Guía de Instalación - Agropecuario POS

Este documento detalla los pasos para instalar el sistema POS en una computadora nueva desde cero.

## ¿Qué necesitas para empezar?

1. Una computadora con Windows 10 u 11.
2. Acceso a internet (para descargar dependencias como Java y MariaDB).
3. Este repositorio o carpeta con los archivos del sistema.

---

## Archivos Principales

Encontrarás los siguientes archivos en esta carpeta:
- **`INSTALAR.ps1`**: Script automatizado que instala Java, MariaDB y configura el sistema. (Recomendado)
- **`backend-0.0.1-SNAPSHOT.jar`**: El archivo ejecutable procesado que contiene todo el sistema (Backend y Frontend).
- **`build_prod.bat`**: Script para recompilar el sistema si haces cambios en el código.

---

## Paso 1: Instalación usando el Script Automático (Recomendado)

El script `INSTALAR.ps1` se encargará de todo: instala Java 17, instala MariaDB, configura la contraseña de root a `1234`, crea la base de datos `agropecuario_pos` y crea un acceso directo en tu escritorio.

### Instrucciones del script:
1. Haz clic derecho en el archivo **`INSTALAR.ps1`** y selecciona **"Ejecutar con PowerShell"**.
   - *Nota: Si te pide permisos de administrador, acéptalos.*
2. El script abrirá una ventana azul y comenzará a descargar e instalar los componentes necesarios.
3. Una vez terminado, verás un mensaje de "Instalación completada".
4. Verás un nuevo icono llamado **"Agropecuario POS"** en tu escritorio.

---

## Paso 2: Instalación Manual (Si el script falla)

Si prefieres hacerlo manualmente o el script no puede instalar algo, sigue estos pasos:

### 1. Instalar Java 17
Descarga e instala el JDK 17 de Oracle o Eclipse Temurin.
- [Oracle JDK 17 Download](https://www.oracle.com/java/technologies/downloads/#java17)

### 2. Instalar MariaDB o MySQL
Instala MariaDB (versión 10.11 o superior).
- Durante la instalación, configura el usuario **`root`** con la contraseña **`1234`**.
- El puerto predeterminado debe ser **`3306`**.

### 3. Crear la Base de Datos
Abre tu cliente de base de datos (como HeidiSQL o MySQL Workbench) y ejecuta:
```sql
CREATE DATABASE agropecuario_pos;
```

### 4. Ejecutar el Sistema
Puedes ejecutar el `.jar` directamente desde una consola de comandos:
```cmd
java -jar backend-0.0.1-SNAPSHOT.jar
```
Al cabo de unos segundos, el sistema abrirá automáticamente tu navegador predeterminado en la dirección: **`http://localhost:8080`**.

---

## Notas Importantes

- **Configuración de Hacienda (Costa Rica)**: Una vez que el sistema esté corriendo, ve a la sección de **Configuración** dentro del POS para subir tu certificado `.p12`, poner tu pin de 4 dígitos y tus credenciales de usuario/password de Hacienda.
- **Acceso Remoto**: Si quieres acceder desde otra computadora en la misma red local, usa la IP de la computadora servidor (Ej: `http://192.168.1.15:8080`).

---
**Desarrollado por: M&M Software (Antigravity AI)**
