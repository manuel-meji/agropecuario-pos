package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Cabys;
import com.agropecuariopos.backend.repositories.CabysRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/cabys")
public class CabysController {

    @Autowired
    private CabysRepository cabysRepository;

    @GetMapping("/search")
    public List<Cabys> searchCabys(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String q = query.trim();
        return cabysRepository.findTop50ByDescriptionContainingIgnoreCaseOrCabysCodeContainingIgnoreCase(q, q);
    }

    @GetMapping("/{code}")
    public Cabys getCabys(@PathVariable String code) {
        return cabysRepository.findByCabysCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código CABYS no encontrado"));
    }
}
