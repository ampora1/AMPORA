package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.SubscriptionDto;
import com.ev.ampora_backend.entity.Subscription;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.entity.Vehicle;
import com.ev.ampora_backend.repository.SubscriptionRepository;
import com.ev.ampora_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class  SubscriptionServiceImpl implements SubscriptionService {
    private final SubscriptionRepository subscriptionRepo;
    private final UserRepository userRepo;

    @Override
    public SubscriptionDto createSubscription(SubscriptionDto dto) {
        User user=userRepo.findById(dto.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        Subscription subscription =Subscription.builder().user(user).planName(dto.getPlanName()).monthlyFee(dto.getMonthlyFree()).active(dto.isActive()).build();
        Subscription saved= subscriptionRepo.save(subscription);
        dto.setSubscriptionId(saved.getSubscriptionId());
        return dto;
    }

    @Override
    public SubscriptionDto updateSubscription(String id, SubscriptionDto dto) {
        Subscription sub =subscriptionRepo.findById(id).orElseThrow(() -> new RuntimeException("Subscription not found"));
        User user=userRepo.findById(dto.getUserId()).orElseThrow(() -> new RuntimeException("User Not Found"));
        sub.setSubscriptionId(id);
        sub.setUser(user);
        sub.setPlanName(dto.getPlanName());
        sub.setMonthlyFee(dto.getMonthlyFree());
        sub.setActive(dto.isActive());
        subscriptionRepo.save(sub);
        dto.setSubscriptionId(id);
        return dto;
    }

    @Override
    public List<SubscriptionDto> getAllSubscription() {
            return   subscriptionRepo.findAll().stream().map(s -> SubscriptionDto.builder().subscriptionId(s.getSubscriptionId()).userId(s.getUser().getUserId()).planName(s.getPlanName()).monthlyFree(s.getMonthlyFee()).active(s.isActive()).build()).toList();
    }

    @Override
    public SubscriptionDto getSubscriptionById(String id) {
       Subscription s=  subscriptionRepo.findById(id).orElseThrow(() -> new RuntimeException("Subscription not found"));
       return SubscriptionDto.builder().subscriptionId(s.getSubscriptionId()).userId(s.getUser().getUserId()).planName(s.getPlanName()).monthlyFree(s.getMonthlyFee()).active(s.isActive()).build();
    }

    public SubscriptionRepository getSubscriptionByuserIdRepo(  ) {
        return subscriptionRepo;
    }

    @Override
    public void deleteSubscription(String id) {
        System.out.println("Deleting Vehicle ID: " + id);
       subscriptionRepo.deleteById(id);
    }

    @Override
    public SubscriptionDto getSubscriptionByUserId(String uId) {
        Subscription s = subscriptionRepo.findByUser_UserId(uId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        return SubscriptionDto.builder()
                .subscriptionId(s.getSubscriptionId())
                .userId(s.getUser().getUserId())
                .planName(s.getPlanName())
                .monthlyFree(s.getMonthlyFee())
                .active(s.isActive())
                .build();
    }

}
