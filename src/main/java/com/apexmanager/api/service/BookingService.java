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

    public Booking createBooking(Booking booking) {

        if (booking.getBookingType() == BookingType.PRIVATE) {
            checkSacredTimeConflicts(booking);
        }

        checkTrackAvailability(booking);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    private void checkSacredTimeConflicts(Booking booking) {
        String dayOfWeek = booking.getStartTime().getDayOfWeek().toString();
        List<ScheduleRule> rules = scheduleRuleRepository.findByDayOfWeek(dayOfWeek);

        for (ScheduleRule rule : rules) {
            if ("LOCKED_PUBLIC".equals(rule.getRestrictionType())) {
                if (isOverlappingRule(booking, rule)) {
                    throw new RuntimeException("Cannot book PRIVATE event during LOCKED_PUBLIC hours.");
                }
            }
        }
    }

    private void checkTrackAvailability(Booking newBooking) {
        List<Booking> existingBookings = bookingRepository.findByTrackId(newBooking.getTrack().getId());

        int currentCapacityUsed = 0;

        for (Booking existing : existingBookings) {
            if (isOverlappingBooking(newBooking, existing)) {

                if (newBooking.getBookingType() == BookingType.PRIVATE ||
                        existing.getBookingType() == BookingType.PRIVATE) {
                    throw new RuntimeException("Track is already booked for an exclusive event at this time.");
                }

                currentCapacityUsed += existing.getDriverCount();
            }
        }

        if (newBooking.getBookingType() != BookingType.PRIVATE) {
            int trackLimit = trackRepository.findById(newBooking.getTrack().getId()).get().getMaxKarts();
            if (currentCapacityUsed + newBooking.getDriverCount() > trackLimit) {
                throw new RuntimeException("Track is full! Remaining capacity: " + (trackLimit - currentCapacityUsed));
            }
        }
    }

    private boolean isOverlappingRule(Booking booking, ScheduleRule rule) {
        LocalTime reqStart = booking.getStartTime().toLocalTime();
        LocalTime reqEnd = booking.getEndTime().toLocalTime();

        return reqStart.isBefore(rule.getEndTime()) && reqEnd.isAfter(rule.getStartTime());
    }

    private boolean isOverlappingBooking(Booking newBooking, Booking existingBooking) {
        return newBooking.getStartTime().isBefore(existingBooking.getEndTime())
                && newBooking.getEndTime().isAfter(existingBooking.getStartTime());
    }
}