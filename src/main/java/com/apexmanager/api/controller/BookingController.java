package com.apexmanager.api.controller;

import com.apexmanager.api.model.Booking;
import com.apexmanager.api.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173") // <--- ALLOWS REACT TO TALK TO JAVA
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // POST http://localhost:8080/api/bookings
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking newBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(newBooking);
        } catch (RuntimeException e) {
            // If the Service throws an error (like "Sacred Time Conflict"),
            // we return a 400 Bad Request with the error message.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET http://localhost:8080/api/bookings
    @GetMapping
    public java.util.List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
}