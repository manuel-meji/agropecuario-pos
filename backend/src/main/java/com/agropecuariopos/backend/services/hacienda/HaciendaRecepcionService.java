package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.ReceivedDocument;
import com.agropecuariopos.backend.repositories.ReceivedDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio para consultar y descargar documentos electrónicos recibidos de proveedores.
 * Implementa el Art. 7 §1 de la Resolución MH-DGT-RES-0027-2024:
 * "El sistema debe consultar/recibir automáticamente los CE vía API de Hacienda."
 *
 * Endpoints relevantes de Hacienda:
 *   GET /comprobantes?receptor={cedula}&tipo=recepcion → lista comprobantes recibidos
 *   GET /comprobantes/{clave}                          → descarga comprobante específico
 */
@Service
public class HaciendaRecepcionService {

    private static final Logger logger = LoggerFactory.getLogger(HaciendaRecepcionService.class);

    @Autowired
    private com.agropecuariopos.backend.repositories.CompanySettingsRepository settingsRepository;

    @Autowired
    private HaciendaAuthClientService authService;

    @Autowired
    private ReceivedDocumentRepository receivedDocumentRepository;

    /**
     * Consulta los documentos recibidos del emisor en la API de Hacienda.
     * Se llama automáticamente cada 30 minutos.
     */
    @Scheduled(fixedDelay = 30 * 60 * 1000) // cada 30 minutos
    public void sincronizarDocumentosRecibidos() {
        logger.info("Sincronizando documentos recibidos de Hacienda...");
        try {
            com.agropecuariopos.backend.models.CompanySettings settings = settingsRepository.findFirst()
                    .orElseThrow(() -> new RuntimeException("Configuración no encontrada para sincronización."));
            
            String baseUrl = settings.getHaciendaRecepcionUrl() != null ? settings.getHaciendaRecepcionUrl() : "https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1";
            String token = authService.getValidAccessToken();
            String url = baseUrl + "/comprobantes?receptor=" + settings.getLegalId();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings({"unchecked", "null"})
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET, request,
                    (Class<List<Map<String, Object>>>) (Class<?>) List.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                int nuevos = 0;
                for (Map<String, Object> item : response.getBody()) {
                    String clave = (String) item.get("clave");
                    if (clave != null && !receivedDocumentRepository.existsByClave(clave)) {
                        descargarYGuardar(clave, item, token, "SYNC");
                        nuevos++;
                    }
                }
                logger.info("Sincronización completada. Nuevos documentos recibidos: {}", nuevos);
            }
        } catch (Exception e) {
            logger.warn("Error sincronizando documentos recibidos de Hacienda: {}", e.getMessage());
        }
    }

    /**
     * Descarga el XML de un comprobante específico y lo guarda en la base de datos.
     */
    public ReceivedDocument descargarComprobante(String clave) {
        // Si ya existe, retornar el existente
        return receivedDocumentRepository.findByClave(clave).orElseGet(() -> {
            try {
                String token = authService.getValidAccessToken();
                descargarYGuardar(clave, null, token, "API");
                return receivedDocumentRepository.findByClave(clave).orElseThrow(
                        () -> new RuntimeException("No se pudo guardar el documento: " + clave));
            } catch (Exception e) {
                throw new RuntimeException("Error descargando comprobante " + clave + ": " + e.getMessage(), e);
            }
        });
    }

    /**
     * Obtiene el XML crudo de un comprobante desde Hacienda (o desde la BD si ya fue descargado).
     */
    public String obtenerXmlRecibido(String clave) {
        return receivedDocumentRepository.findByClave(clave)
                .map(ReceivedDocument::getXmlRecibido)
                .orElseGet(() -> {
                    ReceivedDocument doc = descargarComprobante(clave);
                    return doc.getXmlRecibido();
                });
    }

    /**
     * Importa una factura por su clave numérica de 50 dígitos.
     * Valida el formato, consulta Hacienda, guarda/actualiza el documento y
     * retorna un Map con todos los datos para previsualizar en pantalla.
     * Si la clave ya existe en BD, retorna los datos existentes sin duplicar.
     *
     * @param clave  Clave de 50 dígitos numéricos
     * @return  Map con: clave, estadoHacienda, cedulaEmisor, nombreEmisor,
     *          fechaEmision, montoTotal, codigoMoneda, estadoConfirmacion, tieneXml
     */
    public Map<String, Object> importarPorClave(String clave) {
        // 1. Validar formato
        if (clave == null || !clave.matches("\\d{50}")) {
            throw new IllegalArgumentException("La clave debe tener exactamente 50 dígitos numéricos");
        }

        // 2. Si ya existe en BD, devolver datos existentes
        ReceivedDocument existing = receivedDocumentRepository.findByClave(clave).orElse(null);
        if (existing != null) {
            Map<String, Object> res = toPreviewMap(existing);
            res.put("yaExistia", true);
            return res;
        }

        // 3. Consultar Hacienda
        try {
            com.agropecuariopos.backend.models.CompanySettings settings = settingsRepository.findFirst()
                    .orElseThrow(() -> new RuntimeException("Configuración no encontrada para importar."));
            
            String baseUrl = settings.getHaciendaRecepcionUrl() != null ? settings.getHaciendaRecepcionUrl() : "https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1";
            String token = authService.getValidAccessToken();
            String url = baseUrl + "/comprobantes/" + clave;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> req = new HttpEntity<>(headers);

            RestTemplate rt = new RestTemplate();
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = rt.exchange(
                    url, HttpMethod.GET, req,
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                ReceivedDocument doc = buildDocFromHaciendaResponse(clave, body, "API");
                receivedDocumentRepository.save(doc);
                Map<String, Object> res = toPreviewMap(doc);
                res.put("yaExistia", false);
                res.put("estadoHacienda", body.getOrDefault("respuesta-xml", ""));
                return res;
            } else {
                throw new RuntimeException("Hacienda no encontró el comprobante con esa clave");
            }
        } catch (HttpClientErrorException.NotFound e) {
            // 404 real: la clave no existe en Hacienda
            throw new RuntimeException("Comprobante no encontrado en Hacienda. Verifique que la clave sea correcta.");
        } catch (Exception e) {
            // Re-lanzar errores de validación de formato
            if (e instanceof IllegalArgumentException) throw (IllegalArgumentException) e;
            // Re-lanzar el 404
            if (e instanceof RuntimeException && e.getMessage() != null
                    && e.getMessage().contains("no encontrado en Hacienda")) throw (RuntimeException) e;

            // Para cualquier otro error (OIDC, red, timeout, 401 credenciales):
            // Modo contingencia — guardar la clave localmente para procesarla después
            logger.warn("Hacienda no disponible para clave {}, guardando en contingencia: {}", clave, e.getMessage());
            ReceivedDocument doc = new ReceivedDocument();
            doc.setClave(clave);
            doc.setFuenteImportacion("API");
            doc.setFechaDescarga(LocalDateTime.now());
            doc.setEstadoConfirmacion(ReceivedDocument.EstadoConfirmacion.PENDIENTE);
            // Extraer número consecutivo de posición fija de la clave v4.4
            if (clave.length() == 50) {
                doc.setNumeroConsecutivo(clave.substring(21, 41));
            }
            receivedDocumentRepository.save(doc);
            Map<String, Object> res = toPreviewMap(doc);
            res.put("yaExistia", false);
            res.put("contingencia", true);
            res.put("mensajeContingencia",
                "Hacienda no está disponible en este momento. La clave fue registrada localmente. " +
                "Cuando Hacienda esté disponible, use 'Sincronizar' en Documentos Recibidos para obtener los detalles completos.");
            return res;
        }
    }

    /**
     * Importa una factura electrónica a partir del contenido XML del archivo subido.
     * Extrae la <Clave> del XML, luego descarga el comprobante completo de Hacienda,
     * o si Hacienda no lo tiene, guarda el XML directamente (contingencia offline).
     *
     * @param xmlContenido  contenido textual del XML de la factura electrónica v4.4
     * @return  Map de previsualización igual que importarPorClave()
     */
    public Map<String, Object> importarDesdeXml(String xmlContenido) {
        // 1. Extraer clave del XML
        String clave = extraerNodoXml(xmlContenido, "Clave");
        if (clave == null || clave.isBlank()) {
            throw new IllegalArgumentException("El XML no contiene el nodo <Clave>. Verifique que sea una Factura Electrónica v4.4.");
        }
        if (!clave.matches("\\d{50}")) {
            throw new IllegalArgumentException("La clave extraída del XML no tiene 50 dígitos numéricos: '" + clave + "'");
        }

        // 2. Si ya existe, actualizar XML si estaba vacío
        ReceivedDocument existing = receivedDocumentRepository.findByClave(clave).orElse(null);
        if (existing != null) {
            if (existing.getXmlRecibido() == null || existing.getXmlRecibido().isBlank()) {
                existing.setXmlRecibido(xmlContenido);
                enrichFromXml(existing, xmlContenido);
                receivedDocumentRepository.save(existing);
            }
            Map<String, Object> res = toPreviewMap(existing);
            res.put("yaExistia", true);
            return res;
        }

        // 3. Intentar descargar de Hacienda primero para tener datos completos
        try {
            Map<String, Object> result = importarPorClave(clave);
            // Actualizar con el XML subido (más confiable)
            ReceivedDocument doc = receivedDocumentRepository.findByClave(clave).orElse(null);
            if (doc != null) {
                doc.setXmlRecibido(xmlContenido);
                doc.setFuenteImportacion("XML");
                enrichFromXml(doc, xmlContenido);
                receivedDocumentRepository.save(doc);
            }
            result.put("fuenteImportacion", "XML");
            return result;
        } catch (Exception e) {
            // Contingencia: Hacienda no disponible, guardar localmente
            logger.warn("Hacienda no disponible, guardando XML localmente: {}", e.getMessage());
            ReceivedDocument doc = new ReceivedDocument();
            doc.setClave(clave);
            doc.setXmlRecibido(xmlContenido);
            doc.setFuenteImportacion("XML");
            doc.setFechaDescarga(LocalDateTime.now());
            doc.setEstadoConfirmacion(ReceivedDocument.EstadoConfirmacion.PENDIENTE);
            enrichFromXml(doc, xmlContenido);
            receivedDocumentRepository.save(doc);
            Map<String, Object> res = toPreviewMap(doc);
            res.put("yaExistia", false);
            res.put("contingencia", true);
            res.put("fuenteImportacion", "XML");
            return res;
        }
    }

    // ── Privado ──────────────────────────────────────────────────────────────

    /** Construye un ReceivedDocument a partir de la respuesta JSON de la API de Hacienda. */
    @SuppressWarnings("unchecked")
    private ReceivedDocument buildDocFromHaciendaResponse(String clave, Map<String, Object> body, String fuente) {
        ReceivedDocument doc = new ReceivedDocument();
        doc.setClave(clave);
        doc.setFuenteImportacion(fuente);

        // XML viene en base64 en el campo "comprobanteXml"
        String xmlBase64 = (String) body.get("comprobanteXml");
        if (xmlBase64 != null && !xmlBase64.isBlank()) {
            try {
                String xml = new String(Base64.getDecoder().decode(xmlBase64), StandardCharsets.UTF_8);
                doc.setXmlRecibido(xml);
                enrichFromXml(doc, xml);
            } catch (Exception e) {
                doc.setXmlRecibido(xmlBase64);
            }
        }

        // Cedula del emisor desde campo "emisor"
        Object emisorObj = body.get("emisor");
        if (emisorObj instanceof Map) {
            Map<String, Object> emisor = (Map<String, Object>) emisorObj;
            String cedula = safeStr(emisor.get("numeroIdentificacion"));
            if (!cedula.isBlank()) doc.setCedulaEmisor(cedula);
        }

        // Fecha de emisión
        String fechaStr = (String) body.get("fecha");
        if (fechaStr != null) {
            try { doc.setFechaEmisionDoc(LocalDateTime.parse(fechaStr.substring(0, 19))); }
            catch (Exception ignored) {}
        }

        doc.setFechaDescarga(LocalDateTime.now());
        doc.setEstadoConfirmacion(ReceivedDocument.EstadoConfirmacion.PENDIENTE);
        return doc;
    }

    /** Extrae metadatos del XML de la factura: emisor, monto, moneda, fecha. */
    private void enrichFromXml(ReceivedDocument doc, String xml) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(false);
            // Desactivar validación externa para evitar timeout con DTD/XSD
            dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
            dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            Document xmlDoc = dbf.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            // ── Cédula del EMISOR ────────────────────────────────────────────
            // La cédula aparece tanto en <Emisor> como en <Receptor>.
            // Buscamos la del Emisor específicamente por contexto del nodo padre.
            if (doc.getCedulaEmisor() == null || doc.getCedulaEmisor().isBlank()) {
                String cedula = firstTextInParent(xmlDoc, "Emisor", "NumeroIdentificacion");
                // Fallback: regex directo en el XML string (más rápido para v4.4 bien formados)
                if (cedula == null || cedula.isBlank()) {
                    cedula = extractByRegex(xml, "Emisor", "NumeroIdentificacion");
                }
                if (cedula != null && !cedula.isBlank()) doc.setCedulaEmisor(cedula.trim());
            }

            // ── Nombre del emisor ────────────────────────────────────────────
            if (doc.getNombreEmisor() == null || doc.getNombreEmisor().isBlank()) {
                // Buscar NombreComercial dentro de Emisor primero
                String nombre = firstTextInParent(xmlDoc, "Emisor", "NombreComercial");
                if (nombre == null || nombre.isBlank())
                    nombre = firstTextInParent(xmlDoc, "Emisor", "Nombre");
                // Fallback: primer <Nombre> del documento
                if (nombre == null || nombre.isBlank())
                    nombre = firstText(xmlDoc, "NombreComercial");
                if (nombre == null || nombre.isBlank())
                    nombre = firstText(xmlDoc, "Nombre");
                if (nombre != null && !nombre.isBlank())
                    doc.setNombreEmisor(nombre.trim());
            }

            // ── Número consecutivo ───────────────────────────────────────────
            String cons = firstText(xmlDoc, "NumeroConsecutivo");
            if (cons != null && !cons.isBlank()) doc.setNumeroConsecutivo(cons.trim());

            // ── Monto total ──────────────────────────────────────────────────
            if (doc.getMontoTotal() == null) {
                String monto = firstText(xmlDoc, "TotalComprobante");
                if (monto != null) {
                    try { doc.setMontoTotal(new BigDecimal(monto.trim())); }
                    catch (Exception ignored) {}
                }
            }

            // ── Moneda ───────────────────────────────────────────────────────
            String moneda = firstText(xmlDoc, "CodigoMoneda");
            if (moneda != null && !moneda.isBlank()) doc.setCodigoMoneda(moneda.trim());

            // ── Fecha emisión ────────────────────────────────────────────────
            if (doc.getFechaEmisionDoc() == null) {
                String fecha = firstText(xmlDoc, "FechaEmision");
                if (fecha != null && !fecha.isBlank()) {
                    try {
                        String clean = fecha.length() > 19 ? fecha.substring(0, 19) : fecha;
                        doc.setFechaEmisionDoc(LocalDateTime.parse(clean));
                    } catch (Exception ignored) {}
                }
            }

            // ── Email del emisor ─────────────────────────────────────────────
            if (doc.getEmailEmisor() == null || doc.getEmailEmisor().isBlank()) {
                String email = firstTextInParent(xmlDoc, "Emisor", "CorreoElectronico");
                if (email == null || email.isBlank())
                    email = firstText(xmlDoc, "CorreoElectronico");
                if (email != null && !email.isBlank()) doc.setEmailEmisor(email.trim());
            }

        } catch (Exception e) {
            logger.warn("No se pudo parsear XML para enriquecer metadatos: {}", e.getMessage());
            // Fallback: intentar con regex directamente sobre el string XML
            tryEnrichFromXmlFallback(doc, xml);
        }
    }

    /**
     * Busca el texto del primer nodo child con tagName dentro del primer nodo parent con parentTag.
     * Útil para distinguir Emisor.NumeroIdentificacion vs Receptor.NumeroIdentificacion.
     */
    private String firstTextInParent(Document doc, String parentTag, String childTag) {
        NodeList parents = doc.getElementsByTagName(parentTag);
        if (parents == null || parents.getLength() == 0) return null;
        org.w3c.dom.Node parentNode = parents.item(0);
        org.w3c.dom.NodeList children = parentNode.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            org.w3c.dom.Node child = children.item(i);
            // Compara el nombre local (sin namespace prefix)
            String localName = child.getLocalName() != null ? child.getLocalName() : child.getNodeName();
            if (localName != null && (localName.equals(childTag) || localName.endsWith(":" + childTag))) {
                String text = child.getTextContent();
                if (text != null && !text.isBlank()) return text.trim();
            }
            // Si tiene hijos (elemento con subestructura), buscar recursivamente un nivel más
            if (child.hasChildNodes()) {
                NodeList grandChildren = child.getChildNodes();
                for (int j = 0; j < grandChildren.getLength(); j++) {
                    org.w3c.dom.Node gc = grandChildren.item(j);
                    String gcName = gc.getLocalName() != null ? gc.getLocalName() : gc.getNodeName();
                    if (gcName != null && (gcName.equals(childTag) || gcName.endsWith(":" + childTag))) {
                        String text = gc.getTextContent();
                        if (text != null && !text.isBlank()) return text.trim();
                    }
                }
            }
        }
        return null;
    }

    /**
     * Extrae un valor usando regex cuando el parser XML falla.
     * Busca el patrón entre <ParentTag>...<ChildTag>VALUE</ChildTag>...</ParentTag>.
     */
    private String extractByRegex(String xml, String parentTag, String childTag) {
        try {
            // Patrón: dentro del bloque del parentTag, buscar childTag
            java.util.regex.Pattern parentPattern = java.util.regex.Pattern.compile(
                    "<[\\w:]*" + parentTag + "[^>]*>(.*?)</[\\w:]*" + parentTag + ">",
                    java.util.regex.Pattern.DOTALL);
            java.util.regex.Matcher parentMatcher = parentPattern.matcher(xml);
            if (parentMatcher.find()) {
                String parentContent = parentMatcher.group(1);
                java.util.regex.Pattern childPattern = java.util.regex.Pattern.compile(
                        "<[\\w:]*" + childTag + "[^>]*>\\s*([^<\\s][^<]*?)\\s*</[\\w:]*" + childTag + ">");
                java.util.regex.Matcher childMatcher = childPattern.matcher(parentContent);
                if (childMatcher.find()) return childMatcher.group(1).trim();
            }
        } catch (Exception ignored) {}
        return null;
    }

    /**
     * Último recurso cuando el DOM parser falla completamente — usa sólo regex.
     */
    private void tryEnrichFromXmlFallback(ReceivedDocument doc, String xml) {
        try {
            if (doc.getCedulaEmisor() == null || doc.getCedulaEmisor().isBlank()) {
                String cedula = extractByRegex(xml, "Emisor", "NumeroIdentificacion");
                if (cedula != null) doc.setCedulaEmisor(cedula);
            }
            if (doc.getNombreEmisor() == null || doc.getNombreEmisor().isBlank()) {
                String nombre = extractByRegex(xml, "Emisor", "Nombre");
                if (nombre != null) doc.setNombreEmisor(nombre);
            }
            if (doc.getMontoTotal() == null) {
                String monto = extractByRegex(xml, "ResumenFactura", "TotalComprobante");
                if (monto != null) {
                    try { doc.setMontoTotal(new BigDecimal(monto.trim())); } catch (Exception ignored) {}
                }
            }
        } catch (Exception ignored) {}
    }

    /** Retorna el texto del primer nodo con ese tag local (ignora namespace). */
    private String firstText(Document doc, String tagName) {
        NodeList nl = doc.getElementsByTagName(tagName);
        if (nl == null || nl.getLength() == 0) return null;
        return nl.item(0).getTextContent();
    }

    /** Extrae el texto de un nodo XML por nombre de tag desde un String XML. */
    private String extraerNodoXml(String xml, String tag) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(false);
            Document doc = dbf.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            NodeList nl = doc.getElementsByTagName(tag);
            if (nl != null && nl.getLength() > 0) return nl.item(0).getTextContent();
        } catch (Exception ignored) {}
        return null;
    }

    /** Construye el Map de previsualización para el frontend. */
    private Map<String, Object> toPreviewMap(ReceivedDocument doc) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", doc.getId());
        m.put("clave", doc.getClave());
        m.put("cedulaEmisor", doc.getCedulaEmisor() != null ? doc.getCedulaEmisor() : "");
        m.put("nombreEmisor", doc.getNombreEmisor() != null ? doc.getNombreEmisor() : "");
        m.put("emailEmisor", doc.getEmailEmisor() != null ? doc.getEmailEmisor() : "");
        m.put("numeroConsecutivo", doc.getNumeroConsecutivo() != null ? doc.getNumeroConsecutivo() : "");
        m.put("fechaEmisionDoc", doc.getFechaEmisionDoc() != null ? doc.getFechaEmisionDoc().toString() : "");
        m.put("montoTotal", doc.getMontoTotal() != null ? doc.getMontoTotal() : 0);
        m.put("codigoMoneda", doc.getCodigoMoneda() != null ? doc.getCodigoMoneda() : "CRC");
        m.put("estadoConfirmacion", doc.getEstadoConfirmacion().name());
        m.put("tieneXml", doc.getXmlRecibido() != null && !doc.getXmlRecibido().isBlank());
        m.put("fuenteImportacion", doc.getFuenteImportacion() != null ? doc.getFuenteImportacion() : "SYNC");
        m.put("fechaDescarga", doc.getFechaDescarga() != null ? doc.getFechaDescarga().toString() : "");
        return m;
    }

    @SuppressWarnings("unchecked")
    private void descargarYGuardar(String clave, Map<String, Object> metadatos, String token, String fuente) {
        try {
            com.agropecuariopos.backend.models.CompanySettings settings = settingsRepository.findFirst()
                    .orElseThrow(() -> new RuntimeException("Configuración no encontrada para descarga."));
            
            String baseUrl = settings.getHaciendaRecepcionUrl() != null ? settings.getHaciendaRecepcionUrl() : "https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1";
            String url = baseUrl + "/comprobantes/" + clave;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings({"unchecked", "null"})
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ReceivedDocument doc = buildDocFromHaciendaResponse(clave, response.getBody(), fuente);
                receivedDocumentRepository.save(doc);
                logger.info("Documento recibido guardado: {} (fuente: {})", clave, fuente);
            }
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Comprobante {} no encontrado en Hacienda", clave);
        } catch (Exception e) {
            logger.error("Error descargando comprobante {}: {}", clave, e.getMessage());
        }
    }

    private String safeStr(Object o) {
        return o != null ? o.toString() : "";
    }
}
