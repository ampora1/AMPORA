package com.ev.ampora_backend.websocket;

import com.ev.ampora_backend.dto.RFIDResponse;
import com.ev.ampora_backend.service.RFIDService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class ChargingWebSocketHandler extends TextWebSocketHandler {

    private final ChargingSessionManager sessionManager;
    private final RFIDService rfidService;
    private final ObjectMapper mapper = new ObjectMapper();

    public ChargingWebSocketHandler(
            ChargingSessionManager sessionManager,
            RFIDService rfidService
    ) {
        this.sessionManager = sessionManager;
        this.rfidService = rfidService;
    }

    /* ================= CONNECT ================= */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessionManager.add(session);
        System.out.println("🟢 WS CONNECTED: " + session.getId());
    }

    /* ================= MESSAGE ================= */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        System.out.println("📥 WS IN: " + message.getPayload());

        JsonNode root = mapper.readTree(message.getPayload());
        String type = root.get("type").asText();

        switch (type) {

            case "AUTH_REQUEST" -> handleAuth(session, root);

            case "LIVE" -> broadcast(message);

            case "SESSION_END" -> broadcastSessionEnd(message);

            default -> System.out.println("⚠️ Unknown WS type: " + type);
        }
    }

    /* ================= AUTH ================= */
    private void handleAuth(WebSocketSession session, JsonNode root) throws Exception {

        String uid = root.get("uid").asText();
        System.out.println("🔐 AUTH REQUEST UID: " + uid);

        RFIDResponse user = rfidService.getUserRFID(uid);

        String response = """
        {
          "type": "AUTH_RESPONSE",
          "authorized": true,
          "name": "%s"
        }
        """.formatted(user.getUsername());

        session.sendMessage(new TextMessage(response));
        System.out.println("✅ AUTH OK: " + user.getUsername());
    }

    /* ================= BROADCAST LIVE ================= */
    private void broadcast(TextMessage message) throws Exception {
        for (WebSocketSession client : sessionManager.getSessions()) {
            if (client.isOpen()) {
                client.sendMessage(message);
            }
        }
    }

    /* ================= SESSION END ================= */
    private void broadcastSessionEnd(TextMessage message) throws Exception {
        System.out.println("🧾 SESSION END BROADCAST: " + message.getPayload());

        for (WebSocketSession client : sessionManager.getSessions()) {
            if (client.isOpen()) {
                client.sendMessage(message);
            }
        }
    }

    /* ================= DISCONNECT ================= */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionManager.remove(session);
        System.out.println("🔴 WS CLOSED: " + session.getId());
    }
}
