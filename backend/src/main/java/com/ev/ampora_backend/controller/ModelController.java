package com.ev.ampora_backend.controller;
import com.ev.ampora_backend.dto.ModelDTO;
import com.ev.ampora_backend.service.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/model")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ModelController {
    private final ModelService modelService;
    @GetMapping
    public List<ModelDTO> getAllModels() {
        return modelService.getAllModels();
    }
    @GetMapping("/{id}")
    public ModelDTO getModel(@PathVariable Long id) {
        return modelService.getModel(id);
    }

    @GetMapping("/brand/{brandId}")
    public List<ModelDTO> getByBrand(@PathVariable Long brandId) {
        return modelService.getModelsByBrand(brandId);
    }

    @PostMapping
    public ModelDTO addModel(@RequestBody ModelDTO dto) {
        return modelService.addModel(dto);
    }

    @PutMapping("/{id}")
    public ModelDTO updateModel(@PathVariable Long id, @RequestBody ModelDTO dto) {
        return modelService.updateModel(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deleteModel(@PathVariable Long id) {
        modelService.deleteModel(id);
        return "Model deleted successfully";
    }
}
