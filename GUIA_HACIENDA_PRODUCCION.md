# Guía para pasar a Producción (Ministerio de Hacienda)

Actualmente, el Sistema POS Agropecuario se encuentra apuntando al entorno de **STAGING** (Pruebas) de Hacienda. Para empezar a emitir facturas con valor legal, se deben seguir los siguientes pasos técnicos y administrativos:

## 1. Obtener Credenciales de Producción en el ATV
El cliente (dueño del negocio) debe ingresar al portal ATV (Administración Tributaria Virtual) de Hacienda.
1. Ir a **Comprobantes Electrónicos** > **Generar contraseña en Producción**.
2. Guardar el **Usuario** y el **PIN/Contraseña** generados.
3. Descargar la **Llave Criptográfica** p12 (Certificado) y guardar el PIN de dicha llave. Esta llave tiene validez de 2 años.

## 2. Actualizar el archivo `application.properties`
En el servidor donde se aloja el sistema, busque el archivo `application.properties` en la carpeta `backend/src/main/resources/` (o en su variable de entorno de producción).

### Cambiar las URLs de Hacienda
Reemplace todas las referencias que dicen `stag` (Staging/Pruebas) a las URLs oficiales de producción:

```properties
# DE ESTO (STAGING):
hacienda.apiUrl=https://api-stag.hacienda.go.cr/comprobantes/v3
hacienda.idpUrl=https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token

# A ESTO (PRODUCCIÓN):
hacienda.apiUrl=https://api.hacienda.go.cr/comprobantes/v3
hacienda.idpUrl=https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/token
```

### Cambiar el Client ID
```properties
# DE ESTO (STAGING):
hacienda.clientId=api-stag

# A ESTO (PRODUCCIÓN):
hacienda.clientId=api-prod
```

### Ingresar las Credenciales Propias del Cliente
Reemplace los usuarios de prueba por los obtenidos en el paso 1:
```properties
hacienda.username=[USUARIO_GENERADO_EN_ATV_PRODUCCION]
hacienda.password=[CONTRASENA_GENERADA_EN_ATV_PRODUCCION]
hacienda.llaveCriptograficaPin=[PIN_DEL_CERTIFICADO_P12]
```

## 3. Sustituir la Llave Criptográfica (P12)
1. Coloque el nuevo archivo `.p12` descargado del ATV dentro de `backend/src/main/resources/llaves/`.
2. Renómbrelo a algo fácil como `llave-produccion.p12`.
3. Actualice la ruta en `application.properties`:
```properties
hacienda.llaveCriptograficaPath=classpath:llaves/llave-produccion.p12
```

## 4. Reiniciar y Probar
1. Guarde todos los cambios.
2. Reinicie el servidor de backend.
3. Realice una factura de prueba o tiquete por 1 colón para verificar la firma y aceptación (se recomienda tener configurado el correo para recibir la notificación de hacienda de que el tiquete fue aceptado).

---

> **⚠ Recomendación Legal:** Al momento de pasar a Producción, configure el "Consecutivo de inicio" correcto en Configuración (dentro del POS) para que los números de factura no se traslapen con facturas previas o manuales que haya emitido el negocio. (Por ejemplo: empezar desde el consecutivo número 1).
