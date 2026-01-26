package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.BookingDTO;
import com.ev.ampora_backend.dto.SubscriptionDto;
import com.ev.ampora_backend.dto.payment.PayHereHashRequest;
import com.ev.ampora_backend.dto.payment.PayHereHashResponse;
import com.ev.ampora_backend.entity.BookingStatus;
import com.ev.ampora_backend.service.BookingService;
import com.ev.ampora_backend.service.PayHereService;
import com.ev.ampora_backend.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PayHereService payHereService;
    private final SubscriptionService subscriptionService;
    private final BookingService bookingService;

    @PostMapping("/payhere/hash")
    public PayHereHashResponse generateHash(@RequestBody PayHereHashRequest req) {

        // Always normalize amount here
        BigDecimal amt = new BigDecimal(req.getAmount())
                .setScale(2, RoundingMode.HALF_UP);

        String formattedAmount = amt.toPlainString();

        String hash = payHereService.generateHash(
                req.getOrderId(),
                formattedAmount,
                req.getCurrency()
        );

        System.out.println(payHereService.getMerchantId()+req.getOrderId()+formattedAmount+req.getCurrency()+hash);
        return new PayHereHashResponse(
                payHereService.getMerchantId(),
                req.getOrderId(),
                formattedAmount,
                req.getCurrency(),
                hash
        );
    }
    @PostMapping("/payhere/notify1")
    public ResponseEntity<String> payHereNotify1(@RequestParam Map<String, String> params) {


        String statusCode = params.get("status_code");

        if (!"2".equals(statusCode)) {
            System.out.println("❌ Payment failed or cancelled");
            return ResponseEntity.ok("Payment not successful");
        }

        System.out.println("✅ Payment confirmed by PayHere");

        // ===== Extract booking metadata =====
        String chargerId = params.get("custom_1");
        String bookingDate = params.get("custom_2");   // yyyy-MM-dd
        String startTime = params.get("custom_3");     // HH:mm
        int duration = Integer.parseInt(params.get("custom_4"));
        String userId = params.get("custom_5");

        // ===== Calculate end time =====
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end = start.plusHours(duration);

        // ===== Create booking AFTER payment =====
        bookingService.createBooking(
                BookingDTO.builder()
                        .userId(userId)
                        .chargerId(chargerId)
                        .date(LocalDate.parse(bookingDate))
                        .startTime(start)
                        .endTime(end)
                        .status(BookingStatus.CONFIRMED)
                        .amount(300) // booking fee
                        .build()
        );

        System.out.println("⚡ Booking created successfully");

        return ResponseEntity.ok("OK");
    }
    @PostMapping("payhere/notify")
    public ResponseEntity<String> payHereNotify(@RequestBody SubscriptionDto request) {


            System.out.println("Payment Success");


        System.out.println(request.getSubscriptionId()+request.getUserId()+request.getPlanName());

            SubscriptionDto dto = SubscriptionDto.builder()
                    .subscriptionId(request.getSubscriptionId())
                    .userId(request.getUserId())
                    .planName(request.getPlanName())
                    .active(true)
                    .build();

            subscriptionService.createSubscription(dto);

        return ResponseEntity.ok("OK");
    }
    private double getMonthlyKwh(String planId) {
        return switch (planId) {
            case "basic" -> 100;
            case "premium" -> 500;
            case "enterprise" -> 1000;
            default -> 0;
        };
    }


}
