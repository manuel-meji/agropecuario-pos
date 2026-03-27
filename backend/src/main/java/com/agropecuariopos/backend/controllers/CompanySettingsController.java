package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.CompanySettings;
import com.agropecuariopos.backend.repositories.CompanySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/settings")
public class CompanySettingsController {

    @Autowired
    private CompanySettingsRepository repository;

    @GetMapping
    public ResponseEntity<CompanySettings> getSettings() {
        CompanySettings settings = repository.findFirst().orElse(new CompanySettings());
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<CompanySettings> updateSettings(@RequestBody CompanySettings newSettings) {
        CompanySettings current = repository.findFirst().orElse(new CompanySettings());
        
        // Update basic info
        current.setBusinessName(newSettings.getBusinessName());
        current.setLegalId(newSettings.getLegalId());
        current.setPhone(newSettings.getPhone());
        current.setEmail(newSettings.getEmail());
        current.setAddress(newSettings.getAddress());
        current.setProvince(newSettings.getProvince());
        current.setCanton(newSettings.getCanton());
        current.setDistrito(newSettings.getDistrito());
        current.setBarrio(newSettings.getBarrio());
        current.setCurrency(newSettings.getCurrency());
        current.setPrintMode(newSettings.getPrintMode());
        current.setPrinterName(newSettings.getPrinterName());
        current.setCashierName(newSettings.getCashierName());
        current.setTaxExempt(newSettings.isTaxExempt());
        current.setEnabledPaymentMethods(newSettings.getEnabledPaymentMethods());
        
        // Hacienda info
        current.setHaciendaUsername(newSettings.getHaciendaUsername());
        if (newSettings.getHaciendaPassword() != null && !newSettings.getHaciendaPassword().isBlank()) {
            current.setHaciendaPassword(newSettings.getHaciendaPassword());
        }
        current.setHaciendaAmbiente(newSettings.getHaciendaAmbiente());
        current.setHaciendaClientId(newSettings.getHaciendaClientId());
        current.setHaciendaTokenUrl(newSettings.getHaciendaTokenUrl());
        current.setHaciendaRecepcionUrl(newSettings.getHaciendaRecepcionUrl());
        current.setHaciendaActividadEconomica(newSettings.getHaciendaActividadEconomica());
        
        if (newSettings.getHaciendaKeystorePassword() != null && !newSettings.getHaciendaKeystorePassword().isBlank()) {
            current.setHaciendaKeystorePassword(newSettings.getHaciendaKeystorePassword());
        }

        return ResponseEntity.ok(repository.save(current));
    }

    @PostMapping("/certificate")
    public ResponseEntity<String> uploadCertificate(@RequestParam("file") MultipartFile file) throws IOException {
        CompanySettings settings = repository.findFirst().orElse(new CompanySettings());
        settings.setHaciendaKeystoreFile(file.getBytes());
        repository.save(settings);
        return ResponseEntity.ok("Certificado cargado exitosamente");
    }
}
