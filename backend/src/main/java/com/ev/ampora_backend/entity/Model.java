package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "model")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Model {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Relationship: Many models belong to one brand
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;
}