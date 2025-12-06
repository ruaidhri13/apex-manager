package com.apexmanager.api.service;

import com.apexmanager.api.model.Booking;
import com.apexmanager.api.model.BookingType;
import com.apexmanager.api.model.ScheduleRule;
import com.apexmanager.api.repository.BookingRepository;
import com.apexmanager.api.repository.ScheduleRuleRepository;
import com.apexmanager.api.repository.TrackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ScheduleRuleRepository scheduleRuleRepository;

    @Autowired
    private TrackRepository trackRepository;

    // The Main Method: Attempt to create a booking
    public Booking createBooking(Booking booking) {

        // 1. Check for "Sacred Public Times"
        // If they want a PRIVATE booking, we must check the ScheduleRules
        if (booking.getBookingType() == BookingType.PRIVATE) {
            checkSacredTimeConflicts(booking);
        }

        // 2. Check for Double Bookings (Exclusive Access)
        checkTrackAvailability(booking);

        // If we get here, no rules were broken! Save it.
        return bookingRepository.save(booking);
    }

    private void checkSacredTimeConflicts(Booking booking) {
        // Get the day of the week (e.g., "SATURDAY")
        String dayOfWeek = booking.getStartTime().getDayOfWeek().toString();

        // Fetch rules for this day
        List<ScheduleRule> rules = scheduleRuleRepository.findByDayOfWeek(dayOfWeek);

        // Check each rule
        for (ScheduleRule rule : rules) {
            if ("LOCKED_PUBLIC".equals(rule.getRestrictionType())) {
                // Check if the requested time overlaps with this restricted window
                if (isOverlappingRule(booking, rule)) {
                    throw new RuntimeException("Cannot book PRIVATE event during LOCKED_PUBLIC hours.");
                }
            }
        }
    }

    private void checkTrackAvailability(Booking newBooking) {
        // 1. Get all existing bookings for this track
        List<Booking> existingBookings = bookingRepository.findByTrackId(newBooking.getTrack().getId());

        for (Booking existing : existingBookings) {
            // Check if times overlap
            if (isOverlappingBooking(newBooking, existing)) {

                // Conflict Rule:
                // If EITHER the new one OR the existing one is PRIVATE, it's a conflict.
                // (Private means "Exclusive use of track")
                if (newBooking.getBookingType() == BookingType.PRIVATE ||
                        existing.getBookingType() == BookingType.PRIVATE) {
                    throw new RuntimeException("Track is already booked for an exclusive event at this time.");
                }
            }
        }
    }

    // Helper to check overlap between a Booking and a ScheduleRule (Time only)
    private boolean isOverlappingRule(Booking booking, ScheduleRule rule) {
        LocalTime reqStart = booking.getStartTime().toLocalTime();
        LocalTime reqEnd = booking.getEndTime().toLocalTime();

        // Logic: (StartA < EndB) and (EndA > StartB)
        return reqStart.isBefore(rule.getEndTime()) && reqEnd.isAfter(rule.getStartTime());
    }

    // Helper to check overlap between two Bookings (DateTime)
    private boolean isOverlappingBooking(Booking newBooking, Booking existingBooking) {
        // Logic: (StartA < EndB) and (EndA > StartB)
        return newBooking.getStartTime().isBefore(existingBooking.getEndTime())
                && newBooking.getEndTime().isAfter(existingBooking.getStartTime());
    }
}