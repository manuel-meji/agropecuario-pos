package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product existing = productRepository.findById(id).orElseThrow();
        existing.setName(product.getName());
        existing.setCabysCode(product.getCabysCode());
        existing.setInternalCode(product.getInternalCode());
        existing.setPurchaseCost(product.getPurchaseCost());
        existing.setSalePrice(product.getSalePrice());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setCategory(product.getCategory());
        return productRepository.save(existing);
    }
}
