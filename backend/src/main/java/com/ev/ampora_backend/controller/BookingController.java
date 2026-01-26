package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.AvailabilityResponse;
import com.ev.ampora_backend.dto.BookingDTO;
import com.ev.ampora_backend.entity.BookingStatus;
import com.ev.ampora_backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    // ===================== CREATE BOOKING =====================
    @PostMapping
    public BookingDTO createBooking(@RequestBody BookingDTO dto) {
        dto.setStatus(BookingStatus.PENDING); // default
        return bookingService.createBooking(dto);
    }

    // ===================== CHECK AVAILABILITY =====================
    @PostMapping("/availability")
    public AvailabilityResponse checkAvailability(@RequestBody BookingDTO dto) {
        return bookingService.isAvailable(dto.getChargerId(), dto.getDate(), dto.getStartTime(), dto.getEndTime());
    }

    // ===================== GET ALL BOOKINGS =====================
    @GetMapping
    public List<BookingDTO> getAll() {
        return bookingService.getAllBookings();
    }

    // ===================== GET BOOKINGS BY USER =====================
    @GetMapping("/user/{userId}")
    public List<BookingDTO> getByUser(@PathVariable String userId) {
        return bookingService.getBookingsForUser(userId);
    }
//
//    // ===================== GET BOOKINGS BY STATION =====================
//    @GetMapping("/charger/{chargerId}")
//    public List<BookingDTO> getByCharger(@PathVariable String chargerId) {
//        return bookingService.getBookingsByCharger(chargerId);
//    }
//
//    // ===================== CANCEL BOOKING =====================
//    @PutMapping("/{bookingId}/cancel")
//    public BookingDTO cancelBooking(@PathVariable String bookingId) {
//        return bookingService.cancelBooking(bookingId);
//    }

    @PutMapping("/{id}")
    public BookingDTO updateBooking(
            @PathVariable String id,
            @RequestBody BookingDTO dto
    ) {
        dto.setBookingId(id);   // 🔥 force path ID into DTO
        return bookingService.updateBooking(dto);
    }

}
