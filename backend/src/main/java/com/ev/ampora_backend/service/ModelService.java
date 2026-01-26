package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.ModelDTO;
import com.ev.ampora_backend.entity.Brand;
import com.ev.ampora_backend.entity.Model;
import com.ev.ampora_backend.repository.BrandRepository;
import com.ev.ampora_backend.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelService {

    private final ModelRepository modelRepository;
    private final BrandRepository brandRepository;

    private ModelDTO toDTO(Model m) {
        return ModelDTO.builder()
                .model_id(m.getId())
                .model_name(m.getName())
                .brand_id((long) m.getBrand().getId())
                .build();
    }

    // GET ALL
    public List<ModelDTO> getAllModels() {
        return modelRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // GET BY BRAND
    public List<ModelDTO> getModelsByBrand(Long brandId) {
        return modelRepository.findAll()
                .stream()
                .filter(m -> m.getBrand().getId() == brandId)
                .map(this::toDTO)
                .toList();
    }

    // GET ONE
    public ModelDTO getModel(Long id) {
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found"));

        return toDTO(model);
    }

    // ADD
    public ModelDTO addModel(ModelDTO dto) {
        Brand brand = brandRepository.findById(dto.getBrand_id())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        Model model = Model.builder()
                .name(dto.getModel_name())
                .brand(brand)
                .build();

        modelRepository.save(model);

        return toDTO(model);
    }

    // UPDATE
    public ModelDTO updateModel(Long id, ModelDTO dto) {
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found"));

        Brand brand = brandRepository.findById(dto.getBrand_id())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        model.setName(dto.getModel_name());
        model.setBrand(brand);

        modelRepository.save(model);

        return toDTO(model);
    }

    // DELETE
    public void deleteModel(Long id) {
        if (!modelRepository.existsById(id)) {
            throw new RuntimeException("Model not found");
        }
        modelRepository.deleteById(id);
    }
}