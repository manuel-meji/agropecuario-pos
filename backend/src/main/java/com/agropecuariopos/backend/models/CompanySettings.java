package com.agropecuariopos.backend.models;

import com.agropecuariopos.backend.utils.EncryptionConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_settings")
@Getter
@Setter
@NoArgsConstructor
public class CompanySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Info
    @Column(nullable = false)
    private String businessName = "Agropecuario S.A.";
    
    private String legalId;
    private String phone;
    private String email;
    private String address;
    private String province = "1"; // San José (código)
    private String canton = "01";
    private String distrito = "01";
    private String barrio = "01";
    private String currency = "CRC";
    private String cashierName; // Default cashier name

    // Hardware/Printing
    private String printMode = "browser"; // browser | escpos
    private String printerName;

    // Hacienda (Taxation)
    @Convert(converter = EncryptionConverter.class)
    private String haciendaUsername;
    
    @Convert(converter = EncryptionConverter.class)
    @Column(length = 2000) // Encrypted strings can be long
    private String haciendaPassword;

    private String haciendaAmbiente = "stag"; // stag | prod
    
    @Column(length = 50)
    private String haciendaClientId = "api-stag";
    
    private String haciendaTokenUrl;
    private String haciendaRecepcionUrl;

    public void setHaciendaTokenUrl(String haciendaTokenUrl) {
        this.haciendaTokenUrl = haciendaTokenUrl;
    }

    public String getHaciendaTokenUrl() {
        if (haciendaTokenUrl != null && !haciendaTokenUrl.isBlank()) return haciendaTokenUrl;
        return "prod".equals(haciendaAmbiente) 
            ? "https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/token"
            : "https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token";
    }

    public void setHaciendaRecepcionUrl(String haciendaRecepcionUrl) {
        this.haciendaRecepcionUrl = haciendaRecepcionUrl;
    }

    public String getHaciendaRecepcionUrl() {
        String base = (haciendaRecepcionUrl != null && !haciendaRecepcionUrl.isBlank()) 
            ? haciendaRecepcionUrl 
            : ("prod".equals(haciendaAmbiente)
                ? "https://api-prod.comprobanteselectronicos.go.cr/recepcion/v1"
                : "https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1");
        
        if (base != null && !base.endsWith("/recepcion")) {
            base = base.endsWith("/") ? base + "recepcion" : base + "/recepcion";
        }
        return base;
    }

    private String haciendaActividadEconomica;

    // Certificate
    @Lob
    @JsonIgnore
    @Column(columnDefinition = "LONGBLOB")
    private byte[] haciendaKeystoreFile; // .p12 file binary

    @JsonProperty("hasCertificate")
    public boolean getHasCertificate() {
        return haciendaKeystoreFile != null && haciendaKeystoreFile.length > 0;
    }

    @Convert(converter = EncryptionConverter.class)
    @Column(length = 2000)
    private String haciendaKeystorePassword;

    // Other flags
    private boolean taxExempt = false;
}
