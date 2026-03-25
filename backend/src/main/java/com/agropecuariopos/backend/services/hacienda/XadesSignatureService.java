package com.agropecuariopos.backend.services.hacienda;

import org.apache.xml.security.Init;
import org.apache.xml.security.algorithms.MessageDigestAlgorithm;
import org.apache.xml.security.c14n.Canonicalizer;
import org.apache.xml.security.signature.XMLSignature;
import org.apache.xml.security.transforms.Transforms;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.StringWriter;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Enumeration;
import java.util.UUID;

/**
 * Firma XAdES-EPES real sobre el XML de factura electrónica.
 *
 * Estructura requerida por Hacienda CR:
 *   ds:Signature
 *     ds:SignedInfo
 *       ds:Reference URI=""          → hash del documento completo
 *       ds:Reference URI="#SignedProps-..." Type="...#SignedProperties"
 *     ds:SignatureValue
 *     ds:KeyInfo (certificado X509)
 *     ds:Object
 *       xades:QualifyingProperties
 *         xades:SignedProperties Id="SignedProps-..."
 *           xades:SignedSignatureProperties
 *             xades:SigningTime
 *             xades:SigningCertificate (digest del cert + issuer/serial)
 *             xades:SignaturePolicyIdentifier (policy de Hacienda CR)
 *
 * La diferencia clave con XMLDSig plano es la presencia de QualifyingProperties.
 */
@Service
public class XadesSignatureService {

    private static final Logger logger = LoggerFactory.getLogger(XadesSignatureService.class);

    private static final String XADES_NS  = "http://uri.etsi.org/01903/v1.3.2#";
    private static final String DS_NS     = "http://www.w3.org/2000/09/xmldsig#";

    // Policy oficial de Hacienda CR v4.2 (requerida en XAdES-EPES)
    private static final String POLICY_URI  =
            "https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4.2/" +
            "ResolucionComprobantesElectronicosDGT-R-48-2016_4.2.pdf";
    // SHA-256 del PDF anterior (Base64). Si Hacienda lo valida estrictamente,
    // debe coincidir con el hash del archivo PDF descargable.
    private static final String POLICY_HASH = "V8lVVNGDCPen6VELRD1Ja8HARbyJShsLoRW4NNJSMsc=";

    static {
        Init.init();
    }

    public String signXmlDocument(String xmlToSign, String p12FilePath, String p12Password) {
        try {
            byte[] p12Data;
            try (FileInputStream fis = new FileInputStream(p12FilePath)) {
                p12Data = fis.readAllBytes();
            }
            return signXmlDocument(xmlToSign, p12Data, p12Password);
        } catch (Exception e) {
            logger.error("Error al cargar el archivo P12 desde la ruta: {}", p12FilePath, e);
            throw new RuntimeException("No se pudo cargar el archivo P12: " + e.getMessage(), e);
        }
    }

    public String signXmlDocument(String xmlToSign, byte[] p12Data, String p12Password) {
        try {
            logger.info("Iniciando firma XAdES-EPES del comprobante electrónico...");

            // ── 1. Cargar KeyStore PKCS12 ──────────────────────────────────────────
            KeyStore ks = KeyStore.getInstance("PKCS12");
            try (ByteArrayInputStream bais = new ByteArrayInputStream(p12Data)) {
                ks.load(bais, p12Password.toCharArray());
            }

            String alias = null;
            Enumeration<String> aliases = ks.aliases();
            while (aliases.hasMoreElements()) {
                String a = aliases.nextElement();
                if (ks.isKeyEntry(a)) { alias = a; break; }
            }
            if (alias == null) throw new RuntimeException("No se encontró clave privada en el .p12");

            PrivateKey     privateKey  = (PrivateKey)     ks.getKey(alias, p12Password.toCharArray());
            X509Certificate certificate = (X509Certificate) ks.getCertificate(alias);
            logger.info("Certificado cargado. Sujeto: {}", certificate.getSubjectX500Principal().getName());

            // ── 2. Parsear XML ─────────────────────────────────────────────────────
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            Document doc = dbf.newDocumentBuilder().parse(
                    new ByteArrayInputStream(xmlToSign.getBytes("UTF-8")));

            // ── 3. IDs únicos ──────────────────────────────────────────────────────
            String uid           = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            String signatureId   = "Signature-"       + uid;
            String signedPropsId = "SignedProperties-" + uid;

            // ── 4. Crear la firma XMLDSig base ─────────────────────────────────────
            XMLSignature sig = new XMLSignature(
                    doc, "",
                    XMLSignature.ALGO_ID_SIGNATURE_RSA_SHA256,
                    Canonicalizer.ALGO_ID_C14N_EXCL_OMIT_COMMENTS);
            sig.setId(signatureId);

            // Annexar ds:Signature al elemento raíz del XML del comprobante
            doc.getDocumentElement().appendChild(sig.getElement());

            // ── 5. Referencia 1: documento completo (enveloped) ────────────────────
            Transforms docTransforms = new Transforms(doc);
            docTransforms.addTransform(Transforms.TRANSFORM_ENVELOPED_SIGNATURE);
            docTransforms.addTransform(Canonicalizer.ALGO_ID_C14N_EXCL_OMIT_COMMENTS);
            sig.addDocument("", docTransforms, MessageDigestAlgorithm.ALGO_ID_DIGEST_SHA256);

            // ── 6. Construir QualifyingProperties (XAdES) ─────────────────────────
            String signingTime = OffsetDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX"));

            // Digest del certificado (SHA-256)
            byte[] certDigestBytes = MessageDigest.getInstance("SHA-256").digest(certificate.getEncoded());
            String certDigestB64   = Base64.getEncoder().encodeToString(certDigestBytes);

            // xades:QualifyingProperties
            Element qualifyingProps = doc.createElementNS(XADES_NS, "xades:QualifyingProperties");
            qualifyingProps.setAttribute("xmlns:xades", XADES_NS);
            qualifyingProps.setAttribute("Target", "#" + signatureId);

            // xades:SignedProperties
            Element signedProps = doc.createElementNS(XADES_NS, "xades:SignedProperties");
            signedProps.setAttribute("Id", signedPropsId);
            signedProps.setIdAttribute("Id", true);   // <<< registro XML ID para resolución URI
            qualifyingProps.appendChild(signedProps);

            // xades:SignedSignatureProperties
            Element ssp = doc.createElementNS(XADES_NS, "xades:SignedSignatureProperties");
            signedProps.appendChild(ssp);

            // xades:SigningTime
            el(doc, ssp, XADES_NS, "xades:SigningTime", signingTime);

            // xades:SigningCertificate
            Element sigCert  = child(doc, ssp,     XADES_NS, "xades:SigningCertificate");
            Element cert      = child(doc, sigCert, XADES_NS, "xades:Cert");
            Element certDig   = child(doc, cert,    XADES_NS, "xades:CertDigest");
            elAttr(doc, certDig, DS_NS, "ds:DigestMethod", "Algorithm",
                    "http://www.w3.org/2001/04/xmlenc#sha256");
            el(doc, certDig, DS_NS, "ds:DigestValue", certDigestB64);
            Element issuerSerial = child(doc, cert, XADES_NS, "xades:IssuerSerial");
            el(doc, issuerSerial, DS_NS, "ds:X509IssuerName",
                    certificate.getIssuerX500Principal().getName());
            el(doc, issuerSerial, DS_NS, "ds:X509SerialNumber",
                    certificate.getSerialNumber().toString());

            // xades:SignaturePolicyIdentifier
            Element spi       = child(doc, ssp, XADES_NS, "xades:SignaturePolicyIdentifier");
            Element spid      = child(doc, spi, XADES_NS, "xades:SignaturePolicyId");
            Element spidId    = child(doc, spid, XADES_NS, "xades:SigPolicyId");
            el(doc, spidId, XADES_NS, "xades:Identifier", POLICY_URI);
            Element spHash    = child(doc, spid, XADES_NS, "xades:SigPolicyHash");
            elAttr(doc, spHash, DS_NS, "ds:DigestMethod", "Algorithm",
                    "http://www.w3.org/2001/04/xmlenc#sha256");
            el(doc, spHash, DS_NS, "ds:DigestValue", POLICY_HASH);

            // ── 7. Incluir QualifyingProperties como ds:Object dentro de la firma ──
            Element sigObject = doc.createElementNS(DS_NS, "ds:Object");
            sigObject.appendChild(qualifyingProps);
            sig.getElement().appendChild(sigObject);

            // ── 8. Referencia 2: SignedProperties (tipo XAdES) ────────────────────
            Transforms propsTransforms = new Transforms(doc);
            propsTransforms.addTransform(Canonicalizer.ALGO_ID_C14N_EXCL_OMIT_COMMENTS);
            sig.addDocument(
                    "#" + signedPropsId,
                    propsTransforms,
                    MessageDigestAlgorithm.ALGO_ID_DIGEST_SHA256,
                    null,
                    "http://uri.etsi.org/01903#SignedProperties");

            // ── 9. KeyInfo (certificado) ───────────────────────────────────────────
            sig.addKeyInfo(certificate);
            sig.addKeyInfo(certificate.getPublicKey());

            // ── 10. Firmar ────────────────────────────────────────────────────────
            sig.sign(privateKey);

            // ── 11. Serializar a String ────────────────────────────────────────────
            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            transformer.setOutputProperty(OutputKeys.INDENT, "no");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");

            StringWriter out = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(out));

            String signed = out.toString();
            logger.info("XML firmado con XAdES-EPES exitosamente. Longitud: {} caracteres", signed.length());
            return signed;

        } catch (Exception e) {
            logger.error("Error al firmar el XML con XAdES-EPES: {}", e.getMessage(), e);
            throw new RuntimeException("Fallo en la firma criptográfica XAdES: " + e.getMessage(), e);
        }
    }

    // ── Utilidades DOM ────────────────────────────────────────────────────────

    /** Crea y agrega un elemento con texto */
    private void el(Document doc, Element parent, String ns, String name, String text) {
        Element e = doc.createElementNS(ns, name);
        e.setTextContent(text);
        parent.appendChild(e);
    }

    /** Crea y agrega un elemento hijo vacío */
    private Element child(Document doc, Element parent, String ns, String name) {
        Element e = doc.createElementNS(ns, name);
        parent.appendChild(e);
        return e;
    }

    /** Crea y agrega un elemento con un atributo */
    private void elAttr(Document doc, Element parent, String ns, String name,
                        String attrName, String attrValue) {
        Element e = doc.createElementNS(ns, name);
        e.setAttribute(attrName, attrValue);
        parent.appendChild(e);
    }
}
