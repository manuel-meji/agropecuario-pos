package com.agropecuariopos.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.print.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/printer")
@CrossOrigin("*")
public class PrinterController {

    @GetMapping("/list")
    public ResponseEntity<List<String>> listPrinters() {
        List<String> printers = new ArrayList<>();
        PrintService[] printServices = PrintServiceLookup.lookupPrintServices(null, null);
        for (PrintService printer : printServices) {
            printers.add(printer.getName());
        }
        return ResponseEntity.ok(printers);
    }

    @PostMapping("/print")
    public ResponseEntity<String> printRaw(@RequestBody Map<String, String> request) {
        String printerName = request.get("printerName");
        String text = request.get("text");

        if (printerName == null || printerName.trim().isEmpty() || text == null) {
            return ResponseEntity.badRequest().body("Falta el nombre de la impresora o el texto a imprimir.");
        }

        try {
            PrintService selectedService = null;
            PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);
            for (PrintService service : services) {
                if (service.getName().equalsIgnoreCase(printerName)) {
                    selectedService = service;
                    break;
                }
            }

            if (selectedService == null) {
                return ResponseEntity.badRequest().body("No se encontró la impresora o no está conectada: " + printerName);
            }

            // ESC/POS Commands
            byte[] init = new byte[] { 0x1B, 0x40 }; // ESC @ (Initialize)
            byte[] textBytes = text.getBytes("Cp850"); // Typical codepage 850
            
            // Feed 4 lines, Cut, and Open drawer
            byte[] end = new byte[] { 
                0x1B, 0x64, 0x05, // ESC d 5 (Feed 5 lines)
                0x1D, 0x56, 0x01, // GS V 1 (Cut paper)
                0x1B, 0x70, 0x00, 0x19, (byte)0xFA // ESC p 0 25 250 (Open drawer)
            };

            byte[] all = new byte[init.length + textBytes.length + end.length];
            System.arraycopy(init, 0, all, 0, init.length);
            System.arraycopy(textBytes, 0, all, init.length, textBytes.length);
            System.arraycopy(end, 0, all, init.length + textBytes.length, end.length);

            DocFlavor flavor = DocFlavor.BYTE_ARRAY.AUTOSENSE;
            Doc doc = new SimpleDoc(all, flavor, null);
            
            DocPrintJob job = selectedService.createPrintJob();
            job.print(doc, null);
            
            return ResponseEntity.ok("Enviado a impresora: " + printerName);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al imprimir: " + e.getMessage());
        }
    }
}
