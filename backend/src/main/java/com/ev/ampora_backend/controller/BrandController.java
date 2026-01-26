package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.BrandDTO;
import com.ev.ampora_backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BrandController {
    private final BrandService brandService;
    @GetMapping
    public List<BrandDTO> getAllBrands() {
        return  brandService.getAllBrands();
    }

    @PostMapping
    public BrandDTO createBrand(@RequestBody BrandDTO brandDTO) {
        return brandService.addBrand(brandDTO);
    }

    @PutMapping("/{id}")
    public BrandDTO updateBrand(@PathVariable Long id, @RequestBody BrandDTO brandDTO) {
        return brandService.updateBrand(id,brandDTO);
    }
}
