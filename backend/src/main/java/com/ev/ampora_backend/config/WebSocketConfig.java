package com.ev.ampora_backend.config;

import com.ev.ampora_backend.websocket.ChargingWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChargingWebSocketHandler handler;

    public WebSocketConfig(ChargingWebSocketHandler handler) {
        this.handler = handler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
                .addHandler(handler, "/ws/charging")
                .setAllowedOriginPatterns("*"); // 🔥 REQUIRED for browser
    }
}
