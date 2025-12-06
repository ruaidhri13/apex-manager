package com.apexmanager.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tracks")
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

    // --- MANUAL GETTERS AND SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getMaxKarts() { return maxKarts; }
    public void setMaxKarts(Integer maxKarts) { this.maxKarts = maxKarts; }

    public BigDecimal getPrivateHourlyRatePp() { return privateHourlyRatePp; }
    public void setPrivateHourlyRatePp(BigDecimal privateHourlyRatePp) { this.privateHourlyRatePp = privateHourlyRatePp; }

    public BigDecimal getWalkinPrice() { return walkinPrice; }
    public void setWalkinPrice(BigDecimal walkinPrice) { this.walkinPrice = walkinPrice; }
}