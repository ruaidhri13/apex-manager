package com.apexmanager.api.repository;

import com.apexmanager.api.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTrackId(Long trackId);
}