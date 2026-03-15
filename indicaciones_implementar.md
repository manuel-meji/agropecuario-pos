# ESPECIFICACIONES TÉCNICAS PARA IMPLEMENTACIÓN DE SISTEMA POS  
**Comprobantes Electrónicos Costa Rica – Versión 4.4 (Obligatoria desde 01/09/2025)**

**Cliente objetivo:** Negocio de agroquímicos, concentrados, comida para cerdo y productos agrícolas (emisor-receptor electrónico).  
**Versión obligatoria:** 4.4 (uso voluntario desde 01/04/2025).  
**Documentos base:**  
- Presentación DGT “Comprobantes Electrónicos y Versión 4.4 – Marzo 2025”  
- Resolución MH-DGT-RES-0027-2024 (19/11/2024)  
- Anexos y Estructuras v4.4 (XSD oficiales: FacturaElectronica_V4.4.xsd, MensajeReceptor_V4.4.xsd, etc.)

**Nota importante:** El emisor ya funciona en Sandbox (XML + PDF + envío a Hacienda). Ahora hay que completar los módulos que faltan para cumplir **Artículo 7** (proveedor de sistemas) y **Artículo 10** (confirmación) de la resolución.

## 1. REQUISITOS OBLIGATORIOS COMO PROVEEDOR DE SISTEMAS (Artículo 7 Resolución)
El sistema debe cumplir **todos** estos puntos (no son opcionales):

1. Permitir al cliente **descargar y respaldar** TODOS los documentos que **generó, emitió Y RECIBIÓ** (XML + PDF + respuesta de Hacienda).  
2. Mantener un **registro de control de clientes** actualizado (RUT, correo, fecha de alta, versión usada).  
3. Administrar información transaccional por **al menos 2 meses** (después el cliente es responsable de los 5 años).  
4. Entregar la información al cliente cuando la solicite (exportación masiva).  
5. Soporte de **contingencia** (planes de continuidad + comprobantes preimpresos).  
6. Firma electrónica XAdES-EPES (RSA 2048/4096 + SHA-256).  
7. Generación correcta de **Clave Numérica** de 50 dígitos y **Código QR** en PDF.

## 2. MÓDULOS OBLIGATORIOS QUE DEBES IMPLEMENTAR

### 2.1 Módulo de RECEPCIÓN DE DOCUMENTOS (obligatorio – Artículo 7)
- El cliente recibe facturas de sus proveedores (fertilizantes, insumos, etc.).  
- El sistema debe:  
  - Consultar / recibir automáticamente los CE vía API de Hacienda (recurso `/comprobantes` y `/recepcion`).  
  - Almacenar XML + PDF + respuesta.  
  - Permitir descarga individual y masiva.  
  - Mostrar estado (aceptado / rechazado / pendiente).  

**Flujo técnico:**  
1. Cliente ingresa a “Documentos Recibidos”.  
2. Sistema consulta API Hacienda con clave o cédula.  
3. Descarga y guarda en carpeta del cliente (clave.xml + clave.pdf + clave_respuesta.xml).  

### 2.2 Módulo de CONFIRMACIÓN / RECHAZO (Artículo 10 – OBLIGATORIO)
- Todo emisor-receptor electrónico **debe** confirmar o rechazar en máximo **8 días hábiles** del mes siguiente.  
- Si no confirma → Hacienda presume aceptación total.  
- Si rechaza o acepta parcial → emisor debe emitir Nota de Crédito/Débito.

**Implementar:**
- Pantalla “Confirmar Facturas Recibidas” con lista de documentos pendientes.  
- Opciones:  
  - Aceptar Total (Mensaje = 1)  
  - Aceptar Parcial (Mensaje = 2 + monto aceptado)  
  - Rechazar (Mensaje = 3 + detalle obligatorio mínimo 5 caracteres)  
- Generar XML **MensajeReceptor_V4.4.xsd** (campos obligatorios: Clave, NumeroCedulaEmisor, FechaEmisionDoc, Mensaje, DetalleMensaje).  
- Firmar con XAdES y enviar a Hacienda vía POST `/recepcion`.  
- Guardar respuesta y notificar al cliente.

### 2.3 Actualización de EMISIÓN a v4.4 (ya tienes base, solo agregar campos)

#### Encabezado (nuevos campos obligatorios o condicionales)
- `ProveedorSistema` → ID del OT (tú como proveedor) – obligatorio.  
- `CodigoActividadEconomicaReceptor` → opcional pero recomendado (6 dígitos).  
- `TipoIdentificacionReceptor` → nuevo 05 (Extranjero No Domiciliado) y 06 (No Contribuyente). Número de cédula hasta 20 caracteres.  
- `RegistroFiscalBebidasAlcoholicas` → condicional (no aplica a agro).  
- `CondicionVenta` → nuevos códigos 12-15 (incluye “Venta Mercancía No Nacionalizada”).  
- `PlazoCredito` → ahora Integer (días, máximo 5 dígitos).  
- `OtrasSenasExtranjero` → para extranjeros.

#### Detalle de Mercancía/Servicio
- `TipoTransaccion` (opcional).  
- `NumeroVIN` (vehículos).  
- `DetalleSurtidos` (hasta 20 repeticiones – obligatorio para combos).  
- `DescuentosRegaliasBonificaciones` → nuevo nodo con código y naturaleza.  
- `ImpuestosEspecificosNivelFabrica` → obligatorio apartado.  
- Nuevos códigos IVA: No Sujetos y Exentos actualizados.  
- `ImpuestoAsumidoPorEmisor` (regalías, bonos, IVA fábrica).

#### Totales y Resúmenes
- `TipoMoneda` + `TipoCambio` obligatorio (CRC = 1, USD = tipo BCCR).  
- Totales clasificados por **CAByS** y respecto al IVA.  
- Desglose detallado de cada impuesto cobrado.  
- **Nuevos medios de pago:** 06 = SINPE Móvil, 07 = Plataformas Digitales (desglose por monto).

#### Información de Referencia
- **Obligatoria** en: Factura de Compra, Notas Crédito/Débito y Recibo de Pago.  
- Nuevos códigos: 11 (Proveedor No Domiciliado), 12 (Crédito por exoneración), etc.

### 2.4 Factura Electrónica de Compra y Notas (campos extras)
- Información de Referencia **estrictamente obligatoria**.  
- Tipo documento referencia “Comprobante de Proveedor No Domiciliado” habilita ID extranjero.

### 2.5 Recibo Electrónico de Pago (opcional pero recomendado)
- Solo si vendes a crédito >90 días o servicios al Estado.  
- Información de Referencia obligatoria + Clave de Factura Original.

## 3. CONTINGENCIA (página 20 de la presentación)
- Soporte de “Comprobantes preimpresos por contingencia”.  
- Cuando validador de Hacienda esté caído: generar XML con situación = 2 en clave y luego sustituir.

## 4. FIRMA, QR Y PDF
- Firma XAdES-EPES obligatoria en todos los XML.  
- PDF debe incluir QR en esquina inferior derecha (2.5 cm × 2.5 cm).  
- Representación gráfica en PDF (tamaño mínimo 2.5 cm alto × 2.5 cm ancho).

## 5. API Y AMBIENTES
- Usar endpoints oficiales (producción y pruebas).  
- Soporte de callback URL para respuestas asíncronas.  
- Validación de respuesta de Hacienda en menos de 3 horas.

## 6. CHECKLIST DE IMPLEMENTACIÓN (para el programador)

**Fase 1 (1 semana)**
- [ ] Actualizar generación de XML a v4.4 (usar XSD oficiales).  
- [ ] Agregar todos los campos nuevos listados arriba.  
- [ ] Implementar firma XAdES y QR.

**Fase 2 (2 semanas)**
- [ ] Módulo Documentos Recibidos + descarga.  
- [ ] Módulo Confirmación/Rechazo (MensajeReceptor).  
- [ ] Almacenamiento y respaldo automático.

**Fase 3 (1 semana)**
- [ ] Contingencia y preimpresos.  
- [ ] Pruebas completas en Sandbox (emisión + recepción + confirmación).  
- [ ] Exportación masiva de documentos recibidos.

**Fase 4**
- [ ] Pruebas de integración con cliente agroquímico real.  
- [ ] Documentación de usuario final.

## 7. ARCHIVOS OFICIALES QUE DEBES DESCARGAR
- https://www.hacienda.go.cr/docs/ANEXOS_Y_ESTRUCTURAS_V4.4.pdf  
- Todos los XSD (.xsd) y guías (.doc) de la carpeta “Anexosyestructuras.pdf”  
- Codificacion_V4.4.zip (tablas CAByS, impuestos, medios de pago)

**¡Listo!** Con esto implementado, el sistema estará **100 % en regla** con la Resolución 0027-2024 y la versión 4.4. El cliente podrá vender sin problemas y tú como proveedor también estarás compliant.

Cualquier duda técnica, consulta directamente los XSD y la bitácora de cambios del Anexo 1.

**Fecha de entrega objetivo:** antes del 01/04/2025 (para usar voluntario).