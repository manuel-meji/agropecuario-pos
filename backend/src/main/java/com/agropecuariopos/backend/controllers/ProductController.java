package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Cabys;
import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.repositories.CabysRepository;
import com.agropecuariopos.backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")

public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CabysRepository cabysRepository;

    private void validateCabys(Product product) {
        if (product.getCabysCode() == null || product.getCabysCode().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código Cabys es requerido.");
        }

        Cabys cabys = cabysRepository.findByCabysCode(product.getCabysCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El código Cabys digitado no existe."));

        BigDecimal expectedTaxRate = cabys.getTaxRate().multiply(BigDecimal.valueOf(100));

        if (product.getTaxRate() != null && product.getTaxRate().compareTo(expectedTaxRate) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El impuesto ingresado no coincide con el impuesto de Hacienda para este código CABYS. El impuesto correcto debería ser "
                            + expectedTaxRate.stripTrailingZeros().toPlainString() + "%.");
        }
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        validateCabys(product);
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        validateCabys(product);
        Product existing = productRepository.findById(id).orElseThrow();
        existing.setName(product.getName());
        existing.setCabysCode(product.getCabysCode());
        existing.setInternalCode(product.getInternalCode());
        existing.setPurchaseCost(product.getPurchaseCost());
        existing.setSalePrice(product.getSalePrice());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setCategory(product.getCategory());
        existing.setTaxRate(product.getTaxRate());
        existing.setIsAgrochemicalInsufficiency(product.getIsAgrochemicalInsufficiency());
        return productRepository.save(existing);
    }
}
