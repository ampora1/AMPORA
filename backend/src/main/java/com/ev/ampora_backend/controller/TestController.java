package com.ev.ampora_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "AMPORA Backend Running Successfully ⚡";
    }

    @GetMapping("/test")
    public String test() {
        return "Backend API Test OK!";
    }
}
