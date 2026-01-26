// src/main/java/com/ev/ampora_backend/repository/BookingRepository.java
package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.Booking;
import com.ev.ampora_backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUser_UserId(String userId);

    List<Booking> findByCharger_ChargerId(String chargerId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.charger.chargerId = :chargerId
        AND b.startTime < :endTime
        AND b.endTime > :startTime
    """)
    List<Booking> findOverlappingBookings(
            @Param("chargerId") String chargerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.charger.chargerId = :chargerId
        AND b.bookingId <> :bookingId
        AND b.startTime < :end
        AND b.endTime > :start
        """)
    List<Booking> findOverlapsForUpdate(
            @Param("chargerId") String chargerId,
            @Param("bookingId") String bookingId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

}
