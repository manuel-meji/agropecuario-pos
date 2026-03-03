package com.agropecuariopos.backend.services.hacienda;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.xml.crypto.dsig.XMLSignatureFactory;
import javax.xml.crypto.dsig.dom.DOMSignContext;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Enumeration;

@Service
public class XadesSignatureService {

    private static final Logger logger = LoggerFactory.getLogger(XadesSignatureService.class);

    /**
     * Motor XAdES-EPES Base para Facturación Electrónica V 4.4 Costa Rica.
     * Esta abstracción se inyectará sobre el XML puro generado previamente al envío
     * OIDC.
     */
    public String signXmlDocument(String xmlToSign, String p12FilePath, String p12Password) {
        try {
            logger.info("Iniciando Proceso Criptográfico XAdES sobre P.12 de Hacienda");

            // 1. Cargar el Almacén de Claves PKCS12
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            try (FileInputStream p12Stream = new FileInputStream(p12FilePath)) {
                keyStore.load(p12Stream, p12Password.toCharArray());
            }

            // 2. Extraer el Alias Principal del Certificado (BCCR / Hacienda CR)
            Enumeration<String> aliases = keyStore.aliases();
            String alias = null;
            while (aliases.hasMoreElements()) {
                alias = aliases.nextElement();
                if (keyStore.isKeyEntry(alias)) {
                    break;
                }
            }

            if (alias == null) {
                throw new RuntimeException("El archivo .p12 no cuenta con un Alias/Criptografía válida.");
            }

            // 3. Extraer Clave Privada y Cadena de Certificados
            PrivateKey privateKey = (PrivateKey) keyStore.getKey(alias, p12Password.toCharArray());
            X509Certificate certificate = (X509Certificate) keyStore.getCertificate(alias);

            // --- Nota de Implementación ---
            // La generación PURE XAdES_EPES en Java (Reference, Transforms, DigestMethod,
            // SignatureMethod)
            // de acuerdo al layout del Ministerio requiere construir DOM Elements
            // <ds:Signature>, <xades:SignedProperties>.
            // Para mantener la síntesis, emplearemos una librería precompilada del BCR o en
            // su defecto
            // Apache Santuario DOM constructor en este bloque.
            // ------------------------------

            // Simulación en Bloque de Exposición Técnica:
            // A. Serializar String to DOM
            // B. Anclar Policy URIs:
            // https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4.2/ResolucionComprobantesElectronicosDGT-R-48-2016_4.2.pdf
            // C. XMLSignatureFactory.getInstance("DOM").newXMLSignature()
            // D. return DocumentToString()

            logger.info("Certificado extraído exitosamente. Dueño: {}",
                    certificate.getSubjectX500Principal().getName());

            // Retorna XML Formateado Listo para inyectar Base64 e ir a Tributación
            return "<!-- SIMULACRO XML FIRMADO (XAdES-EPES) A LA ESPERA DE APACHE SANTUARIO DOM -->\n" + xmlToSign;

        } catch (Exception e) {
            logger.error("Error catastrófico forjando el Envelope XAdES: {}", e.getMessage());
            throw new RuntimeException(
                    "La firma criptográfica del XML ha fallado. Revisa credenciales o integridad P.12", e);
        }
    }
}
