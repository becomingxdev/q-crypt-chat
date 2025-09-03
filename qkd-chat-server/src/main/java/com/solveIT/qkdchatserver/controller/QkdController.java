package com.solveIT.qkdchatserver.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.solveIT.qkdchatserver.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // <-- NEW IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/qkd")
public class QkdController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- THIS BLOCK IS CHANGED ---
    // Read the QKD service URL from an environment variable
    // If the variable is not set, it defaults to the localhost URL
    @Value("${qkd.service.url:http://localhost:5001/generate-key?eavesdrop=true}")
    private String qkdServiceUrl;
    // --- END OF CHANGE ---


    @GetMapping("/start")
    public ResponseEntity<?> startQkdProcess() {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // Use the configured URL
            JsonNode response = restTemplate.getForObject(qkdServiceUrl, JsonNode.class);

            if (response != null && response.has("log")) {
                JsonNode logArray = response.get("log");
                for (JsonNode logEntry : logArray) {
                    ChatMessage logMessage = new ChatMessage();
                    logMessage.setType(ChatMessage.MessageType.QKD_LOG);
                    logMessage.setContent(logEntry.asText());
                    logMessage.setSender("SYSTEM");
                    messagingTemplate.convertAndSend("/topic/public", logMessage);
                    Thread.sleep(500);
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error during QKD process: " + e.getMessage());
        }
    }
}