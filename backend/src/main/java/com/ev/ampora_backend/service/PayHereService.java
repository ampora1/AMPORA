package com.ev.ampora_backend.service;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class PayHereService {

    @Getter
    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    /* ================= HASH GENERATION ================= */
    public String generateHash(String orderId, String amount, String currency) {

        BigDecimal amt = new BigDecimal(amount)
                .setScale(2, RoundingMode.HALF_UP);

        String formattedAmount = amt.toPlainString();

        String secretHash = md5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + formattedAmount + currency + secretHash;
        System.out.println(merchantSecret);
        System.out.println(md5(raw).toUpperCase());
        return md5(raw).toUpperCase();
    }

    /* ================= MD5 ================= */
    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5 error", e);
        }
    }
}
