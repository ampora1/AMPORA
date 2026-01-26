package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.SubscriptionDto;

import java.util.List;

public interface SubscriptionService {
    SubscriptionDto createSubscription(SubscriptionDto dto);
    SubscriptionDto updateSubscription(String id,SubscriptionDto dto);
    List<SubscriptionDto> getAllSubscription();
    SubscriptionDto getSubscriptionById(String id);
    void deleteSubscription(String id);
    SubscriptionDto getSubscriptionByUserId(String uId);
}
