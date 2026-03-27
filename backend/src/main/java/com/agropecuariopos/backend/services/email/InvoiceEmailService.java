package com.agropecuariopos.backend.services.email;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class InvoiceEmailService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendInvoiceEmail(ElectronicInvoice invoice, String clientName, String destinatario) {
        if (invoice == null || destinatario == null || destinatario.isBlank()) {
            logger.info("El cliente {} no tiene un correo electrónico registrado. No se enviará factura por email.", clientName);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject("Factura Electrónica - " + invoice.getNumeroConsecutivo());

            String contenido = "<h3>Estimado(a) " + clientName + "</h3>"
                    + "<p>Adjunto a este correo encontrará la Factura Electrónica y la confirmación de aceptación por parte del Ministerio de Hacienda correspondiente a su reciente compra.</p>"
                    + "<p>Clave del comprobante: " + invoice.getClave() + "</p>"
                    + "<br><p>Gracias por su compra.</p>";

            helper.setText(contenido, true);

            // Adjuntar XML Firmado
            if (invoice.getXmlFirmadoBase64() != null && !invoice.getXmlFirmadoBase64().isBlank()) {
                @SuppressWarnings("null")
                byte[] xmlFirmadoBytes = invoice.getXmlFirmadoBase64().getBytes("UTF-8");
                helper.addAttachment("Factura_" + invoice.getNumeroConsecutivo() + ".xml", new ByteArrayResource(xmlFirmadoBytes));
            }

            // Adjuntar Respuesta de Hacienda
            if (invoice.getXmlRespuestaHacienda() != null && !invoice.getXmlRespuestaHacienda().isBlank()) {
                @SuppressWarnings("null")
                byte[] xmlRespuestaBytes;
                try {
                    xmlRespuestaBytes = Base64.getDecoder().decode(invoice.getXmlRespuestaHacienda());
                } catch (IllegalArgumentException base64Ex) {
                    // Por si acaso Hacienda devuelve texto plano en lugar de Base64
                    xmlRespuestaBytes = invoice.getXmlRespuestaHacienda().getBytes("UTF-8");
                }
                helper.addAttachment("RespuestaHacienda_" + invoice.getNumeroConsecutivo() + ".xml", new ByteArrayResource(xmlRespuestaBytes));
            }

            mailSender.send(message);
            logger.info("📧 Email con factura electrónica enviado exitosamente a {}", destinatario);

        } catch (Exception e) {
            logger.error("❌ Fallo enviando correo con factura a {}: {}", destinatario, e.getMessage());
        }
    }

    @Async
    public void sendReceiptPdf(com.agropecuariopos.backend.models.Sale sale, String email, String pdfBase64, ElectronicInvoice invoice) {
        if (email == null || email.isBlank()) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Comprobante de Pago - " + sale.getInvoiceNumber());

            String contenido = "<h3>Estimado(a) Cliente</h3>"
                    + "<p>Adjunto a este correo encontrará el recibo correspondiente a su compra.</p>";
            
            if (invoice != null) {
                contenido += "<p>Este documento incluye los comprobantes electrónicos procesados por el Ministerio de Hacienda.</p>";
                contenido += "<p>Clave del comprobante: " + invoice.getClave() + "</p>";
            }
            contenido += "<br><p>Gracias por preferirnos.</p>";
            
            helper.setText(contenido, true);

            // Adjuntar PDF
            if (pdfBase64 != null && !pdfBase64.isBlank()) {
                String base64Data = pdfBase64.contains(",") ? pdfBase64.split(",")[1] : pdfBase64;
                byte[] pdfBytes = Base64.getDecoder().decode(base64Data);
                helper.addAttachment("Recibo_" + sale.getInvoiceNumber() + ".pdf", new ByteArrayResource(pdfBytes));
            }

            // Adjuntar XMLs si existen
            if (invoice != null) {
                if (invoice.getXmlFirmadoBase64() != null && !invoice.getXmlFirmadoBase64().isBlank()) {
                    byte[] xmlFirmadoBytes = invoice.getXmlFirmadoBase64().getBytes("UTF-8");
                    helper.addAttachment("Factura_" + invoice.getNumeroConsecutivo() + ".xml", new ByteArrayResource(xmlFirmadoBytes));
                }
                if (invoice.getXmlRespuestaHacienda() != null && !invoice.getXmlRespuestaHacienda().isBlank()) {
                    byte[] xmlRespuestaBytes;
                    try {
                        xmlRespuestaBytes = Base64.getDecoder().decode(invoice.getXmlRespuestaHacienda());
                    } catch (IllegalArgumentException base64Ex) {
                        xmlRespuestaBytes = invoice.getXmlRespuestaHacienda().getBytes("UTF-8");
                    }
                    helper.addAttachment("RespuestaHacienda_" + invoice.getNumeroConsecutivo() + ".xml", new ByteArrayResource(xmlRespuestaBytes));
                }
            }

            mailSender.send(message);
            logger.info("📧 Email con recibo (y XMLs si aplica) enviado a {}", email);
        } catch (Exception e) {
            logger.error("❌ Fallo enviando recibo a {}: {}", email, e.getMessage());
        }
    }
}
