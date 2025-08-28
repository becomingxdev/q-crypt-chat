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

    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    
    private final String QKD_SERVICE_URL = "http://localhost:5001/generate-key?eavesdrop=true"; // Set eavesdrop=true for demonstration

    @GetMapping("/start")
    public ResponseEntity<?> startQkdProcess() {
        try {
            
            RestTemplate restTemplate = new RestTemplate();

            
            JsonNode response = restTemplate.getForObject(QKD_SERVICE_URL, JsonNode.class);

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