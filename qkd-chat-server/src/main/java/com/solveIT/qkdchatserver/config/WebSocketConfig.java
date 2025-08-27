package com.solveIT.qkdchatserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling SockJS fallback options.
        // SockJS is used to enable WebSocket functionality in browsers that don't support it.
        // setAllowedOriginPatterns("*") allows connections from any origin, which is fine for development.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Defines that messages whose destination starts with "/app" should be routed to message-handling methods (in our @Controller).
        registry.setApplicationDestinationPrefixes("/app");

        // Defines that messages whose destination starts with "/topic" should be routed to the message broker.
        // The broker broadcasts messages to all connected clients who are subscribed to a specific topic.
        registry.enableSimpleBroker("/topic");
    }
}