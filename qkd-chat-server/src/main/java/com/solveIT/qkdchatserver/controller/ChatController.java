package com.solveIT.qkdchatserver.controller;

import com.solveIT.qkdchatserver.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    /**
     * Handles incoming chat messages.
     * The @MessageMapping annotation ensures that if a message is sent to the destination "/app/chat.sendMessage",
     * this method is called.
     * The @SendTo annotation broadcasts the return value to all subscribers of "/topic/public".
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // For now, we just take the incoming message and broadcast it.
        // Later, we will add logic here to handle encrypted messages.
        return chatMessage;
    }

    /**
     * Handles a new user joining the chat.
     * When a user connects, they will send a message to "/app/chat.addUser".
     * This method adds the username to the WebSocket session and broadcasts a JOIN message.
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add username in WebSocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }
}