# Guía de Instalación y Ejecución del Proyecto Agropecuario POS

Este documento contiene todas las instrucciones necesarias para configurar el entorno, conectar la base de datos, levantar el backend y ejecutar el frontend de la aplicación.

## Requisitos Previos

Asegúrate de tener instalado en tu sistema el siguiente software:

1. **Java Development Kit (JDK) 17 o superior** (Se recomienda Java 17 ya que es el especificado en el proyecto).
2. **Maven 3.8 o superior** para compilar el backend.
3. **Node.js y npm** (Se recomienda la versión LTS más reciente) para ejecutar el frontend.
4. **MySQL Server 8.x** para la base de datos.

_(Nota: En la carpeta `backend` se incluyen copias portables de `jdk-21.0.2+13` y `apache-maven-3.9.6`. Más abajo se explica cómo usarlas mediante variables de entorno si no deseas realizar una instalación global)._

---

## 1. Configuración de la Base de Datos

El backend utiliza MySQL. Sigue estos pasos para configurarla:

1. Asegúrate de que el servicio de **MySQL esté en ejecución** en tu máquina (por defecto en el puerto `3306`).
2. Abre tu terminal de MySQL, MySQL Workbench, DBeaver o la herramienta que prefieras.
3. Aunque Hibernate intentará crearla (`createDatabaseIfNotExist=true`), se recomienda crear la base de datos manualmente. Ejecuta el siguiente comando SQL:
   ```sql
   CREATE DATABASE agropecuario_pos;
   ```
4. Las credenciales configuradas por defecto en el archivo `application.properties` del proyecto son:
   - **Usuario:** `root`
   - **Contraseña:** `1234`
   - **Puerto:** `3306`

_Si tus credenciales locales son diferentes, deberás editarlas en el archivo `backend/src/main/resources/application.properties` en las siguientes líneas:_

```properties
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
```

---

## 2. Ejecutar el Backend (Spring Boot)

El backend está construido con Java y Spring Boot.

### 2.1 Opcional: Configurar Variables de Entorno (Si usas las versiones incluidas en el proyecto)

Si no tienes Java y Maven instalados en tu sistema, puedes usar las versiones incluidas temporalmente en tu sesión de terminal actual. **Debes ejecutar estos comandos cada vez que abras una nueva terminal para trabajar en el backend.**

Si utilizas **PowerShell**, ejecuta lo siguiente:

```powershell
$env:JAVA_HOME = "c:\agropecuario-pos\backend\jdk-21.0.2+13"
$env:M2_HOME = "c:\agropecuario-pos\backend\apache-maven-3.9.6"
$env:MAVEN_HOME = "c:\agropecuario-pos\backend\apache-maven-3.9.6"
$env:Path = "$env:JAVA_HOME\bin;$env:M2_HOME\bin;" + $env:Path
```

Si utilizas **Símbolo del sistema (cmd)**, ejecuta lo siguiente:

```cmd
set JAVA_HOME=c:\agropecuario-pos\backend\jdk-21.0.2+13
set M2_HOME=c:\agropecuario-pos\backend\apache-maven-3.9.6
set MAVEN_HOME=c:\agropecuario-pos\backend\apache-maven-3.9.6
set PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%
```

Puedes comprobar que se configuró correctamente ejecutando: `java -version` y `mvn -version`.

### 2.2 Iniciar el Backend

1. Abre una terminal (Símbolo del sistema o PowerShell) y **asegúrate de haber configurado las variables explicadas arriba** (o de tener Java/Maven correctamente instalados).
2. Navega al directorio del backend:
   ```bash
   cd c:\agropecuario-pos\backend
   ```
3. Compila el proyecto y descarga las dependencias ejecutando:
   ```bash
   mvn clean install -DskipTests
   ```
4. Levanta el servidor usando el plugin de Spring Boot:
   ```bash
   mvn spring-boot:run
   ```

_El backend se iniciará y estará escuchando peticiones en el puerto **`8080`**._
Verás líneas en la consola que indican que Tomcat inició en el puerto 8080 y la aplicación `backend` está en ejecución.

---

## 3. Ejecutar el Frontend (React + Vite)

El frontend está construido usando React, Vite y TypeScript, y se apoya en npm para la gestión de paquetes.

1. Abre una **nueva** terminal (no cierres la terminal del backend, ya que ambos deben estar en ejecución simultáneamente).
2. Navega al directorio del frontend:
   ```bash
   cd c:\agropecuario-pos\frontend
   ```
3. Instala todas las dependencias necesarias. Esto leerá el archivo `package.json` y descargará las bibliotecas:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo del frontend:
   ```bash
   npm run dev
   ```

_El frontend se iniciará y la terminal te mostrará la URL local donde está alojado, típicamente `http://localhost:5173/`._
Mantén presionado `Ctrl` y haz clic en el enlace de la terminal para abrir la aplicación en tu navegador web.

---

## Resumen del Flujo de Trabajo

Para trabajar diariamente en el proyecto sólo necesitas:

1. Validar que MySQL está activo.
2. Abrir terminal 1 en `/backend` -> `mvn spring-boot:run`
3. Abrir terminal 2 en `/frontend` -> `npm run dev`

### Consideraciones extra

- **Datos Iniciales:** Como el proyecto tiene `spring.jpa.hibernate.ddl-auto=update`, las tablas se generarán automáticamente en cuanto se inicie el backend por primera vez.
- **Configuraciones adicionales:** En `application.properties` verás apartados comentados como _Mail Configuration_ o _Hacienda API_. Actualmente tienen datos "dummy", si necesitas probar esos flujos más adelante, recuerda modificar las contraseñas e ID reales.
