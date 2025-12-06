package com.apexmanager.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "tracks")
@Data // Lombok generates Getters, Setters, and toString automatically
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "max_karts", nullable = false)
    private Integer maxKarts;

    @Column(name = "private_hourly_rate_pp", nullable = false)
    private BigDecimal privateHourlyRatePp;

    @Column(name = "walkin_price", nullable = false)
    private BigDecimal walkinPrice;
}