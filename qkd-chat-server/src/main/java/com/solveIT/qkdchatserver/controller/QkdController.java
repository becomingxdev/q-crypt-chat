package com.solveIT.qkdchatserver.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.solveIT.qkdchatserver.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/qkd")
public class QkdController {

    // Helper to send messages over WebSocket
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // The URL of our Python QKD service
    private final String QKD_SERVICE_URL = "http://localhost:5001/generate-key?eavesdrop=true"; // Set eavesdrop=true for demonstration

    @GetMapping("/start")
    public ResponseEntity<?> startQkdProcess() {
        try {
            // 1. Create a RestTemplate to make the HTTP request
            RestTemplate restTemplate = new RestTemplate();

            // 2. Call the Python service and get the response
            JsonNode response = restTemplate.getForObject(QKD_SERVICE_URL, JsonNode.class);

            if (response != null && response.has("log")) {
                // 3. Get the 'log' array from the JSON response
                JsonNode logArray = response.get("log");

                // 4. Iterate through the logs and send them over WebSocket
                for (JsonNode logEntry : logArray) {
                    ChatMessage logMessage = new ChatMessage();
                    logMessage.setType(ChatMessage.MessageType.QKD_LOG);
                    logMessage.setContent(logEntry.asText());
                    logMessage.setSender("SYSTEM");

                    // Broadcast the log message to all clients
                    messagingTemplate.convertAndSend("/topic/public", logMessage);

                    // Add a small delay for a better visual effect on the frontend
                    Thread.sleep(500);
                }
            }

            // For now, we just return the final status from the Python service
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error during QKD process: " + e.getMessage());
        }
    }
}