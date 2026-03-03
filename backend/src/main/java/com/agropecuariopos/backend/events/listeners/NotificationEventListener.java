package com.agropecuariopos.backend.events.listeners;

import com.agropecuariopos.backend.dto.alerts.EODReportAlert;
import com.agropecuariopos.backend.events.EndOfDayReportEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Component
public class NotificationEventListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEventListener.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * @Async aisla este subproceso del Request Principal de Cierre de Caja.
     *        Si el servidor SMTP estalla, no jode el Arqueo Financiero del Cajero.
     */
    @Async
    @EventListener
    public void onEndOfDayReportEvent(EndOfDayReportEvent event) {
        EODReportAlert report = event.getReportAlert();
        logger.info("Recibido el Evento Async de Fin de Día. Preparando la plantilla HTML. Titulo: {}",
                report.getTitle());

        try {
            Context context = new Context();
            context.setVariable("title", report.getTitle());
            context.setVariable("timestamp", report.getTimestamp());
            context.setVariable("totalSalesValue", report.getTotalSalesValue());
            context.setVariable("totalTransactions", report.getTotalTransactions());
            context.setVariable("documentsInContingency", report.getDocumentsInContingency());
            context.setVariable("netProfitEstimation", report.getNetProfitEstimation());

            String processContent = templateEngine.process("eod-report", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo("propietario@agropecuariaelsol.com");
            helper.setSubject("POS Agropecuario - Resumen EOD: " + report.getTitle());
            helper.setText(processContent, true);

            mailSender.send(mimeMessage);

            logger.info("Reporte EOD Email Disparado de forma exitosa via SMTP.");

        } catch (MessagingException me) {
            logger.error("Error Construyendo MimeMessage para Reporte EOD: {}", me.getMessage());
        } catch (Exception e) {
            logger.error("Error Global en Listener Asyncrónico Notificaciones: {}", e.getMessage());
        }
    }
}
