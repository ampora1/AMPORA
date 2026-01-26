package com.ev.ampora_backend.dto;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelDTO {
    private Long model_id;
    private String model_name;
    private Long brand_id;

}