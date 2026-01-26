package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.BrandDTO;
import com.ev.ampora_backend.entity.Brand;
import com.ev.ampora_backend.repository.BrandRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service

public class BrandService {
    private BrandRepository brandRepository;
    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandDTO> getAllBrands() {

        return  brandRepository.findAll().stream()
                .map(
                        brand -> BrandDTO.builder().
                                brand_id(Math.toIntExact(brand.getId()))
                                .brand_name(brand.getName())
                                .build()
                ).toList();
    }

    public BrandDTO addBrand(BrandDTO brandDTO) {
        Brand brand = new Brand();
        brand.setName(brandDTO.getBrand_name());
        brandRepository.save(brand);
        return BrandDTO.builder().brand_id(Math.toIntExact(brand.getId())).brand_name(brand.getName()).build();
    }

    public BrandDTO updateBrand(Long id,BrandDTO brandDTO) {
        Optional<Brand> brand = brandRepository.findById(id);

        brand.get().setName(brandDTO.getBrand_name());
        brandRepository.save(brand.get());

        return BrandDTO.builder().brand_id(Math.toIntExact(brand.get().getId())).brand_name(brand.get().getName()).build();
    }


}
