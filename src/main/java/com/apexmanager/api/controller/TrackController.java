package com.apexmanager.api.controller;

import com.apexmanager.api.model.Track;
import com.apexmanager.api.repository.TrackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {

    @Autowired
    private TrackRepository trackRepository;

    // GET http://localhost:8080/api/tracks
    @GetMapping
    public List<Track> getAllTracks() {
        return trackRepository.findAll();
    }
}