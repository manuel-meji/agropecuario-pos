package com.agropecuariopos.backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
@EnableScheduling
public class DatabaseBackupService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupService.class);

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    // Ejecuta todos los dias a las 2:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void backupDatabase() {
        String dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String backupFileName = "backup_agropecuario_" + dateFormat + ".sql";
        String backupDirectoryPath = System.getProperty("user.dir") + "/backups/";

        File backupDir = new File(backupDirectoryPath);
        if (!backupDir.exists()) {
            backupDir.mkdirs();
        }



        try {
            ProcessBuilder processBuilder = new ProcessBuilder("mysqldump", "-u", dbUser, "-p" + dbPassword, "--add-drop-table", "--databases", "agropecuario_pos", "-r", backupDirectoryPath + backupFileName);
            // Redirigir errores para ver por qué falla si sucede
            processBuilder.redirectErrorStream(true);
            Process runtimeProcess = processBuilder.start();
            int processComplete = runtimeProcess.waitFor();

            if (processComplete == 0) {
                logger.info("Backup successfully generated at: {}", backupDirectoryPath + backupFileName);
                // Implementation note: Here we could zip the file using java.util.zip and
                // optionally upload to S3/Drive
            } else {
                logger.error("Could not create the backup for the database.");
            }
        } catch (IOException | InterruptedException ex) {
            logger.error("Error at Backup generation: {}", ex.getMessage());
        }
    }
}
