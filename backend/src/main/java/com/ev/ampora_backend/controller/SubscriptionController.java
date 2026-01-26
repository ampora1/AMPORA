package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.SubscriptionDto;
import com.ev.ampora_backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping
    public SubscriptionDto SetSubscription(@RequestBody SubscriptionDto subscriptionDto){
        return  subscriptionService.createSubscription(subscriptionDto);
    }

    @PutMapping("/{id}")
    public  SubscriptionDto updateSubscription(@PathVariable String id,@RequestBody SubscriptionDto dto){
        return  subscriptionService.updateSubscription(id,dto);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDto>> getAllSubscription(){
        return  ResponseEntity.ok(subscriptionService.getAllSubscription());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionDto> getSubscription(@PathVariable String id){
        return  ResponseEntity.ok(subscriptionService.getSubscriptionById(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubscription(@PathVariable String id){
        subscriptionService.deleteSubscription(id);
      return  ResponseEntity.ok("Delete Successfully");
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<SubscriptionDto> getSubscriptionByuser(@PathVariable String id){
       return ResponseEntity.ok(subscriptionService.getSubscriptionByUserId(id));
    }
}
