package com.ev.ampora_backend.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketBroadcaster {

    private final Set<WebSocketSession> sessions =
            ConcurrentHashMap.newKeySet();

    public void add(WebSocketSession s) {
        sessions.add(s);
    }

    public void remove(WebSocketSession s) {
        sessions.remove(s);
    }

    public void broadcast(String message) {
        sessions.forEach(s -> {
            try {
                s.sendMessage(new TextMessage(message));
            } catch (Exception ignored) {}
        });
    }
}

