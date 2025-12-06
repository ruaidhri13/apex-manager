package com.apexmanager.api.repository;

import com.apexmanager.api.model.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {
    // We don't need to write code here
    // JpaRepository gives us .findAll(), .save(), .findById() for free.
}