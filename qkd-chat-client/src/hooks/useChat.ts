import { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
// --- CHANGE 1: Import IMessage for typing the message payload ---
import { Stomp, type IMessage } from '@stomp/stompjs';
import { auth } from '../firebase';
import { type User } from 'firebase/auth';

// Define the structure of a chat message
export interface ChatMessage {
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'QKD_LOG';
  content: string;
  sender: string;
}

// This is our custom hook
export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stompClient, setStompClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      connect(user);
    }

    // Disconnect when the component unmounts
    return () => {
      stompClient?.disconnect();
    };
  }, [auth.currentUser]); // Re-run effect if the user changes

  const connect = async (user: User) => {
    try {
      const token = await user.getIdToken();
      const socket = new SockJS('https://qkd-chat-server.onrender.com/ws');
      const client = Stomp.over(socket);

      // --- CHANGE 2: Explicitly type 'str' as string ---
      client.debug = (str: string) => {
        console.log(new Date(), str);
      };

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      client.connect(headers, () => {
        setIsConnected(true);
        setStompClient(client);

        // --- CHANGE 3: Explicitly type 'message' as IMessage ---
        client.subscribe('/topic/public', (message: IMessage) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        const joinMessage: ChatMessage = {
          type: 'JOIN',
          content: `${user.displayName} has joined!`, // Add content for join message
          sender: user.displayName || 'Anonymous',
        };
        client.send('/app/chat.addUser', {}, JSON.stringify(joinMessage));
      });

    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const sendMessage = (content: string) => {
    const user = auth.currentUser;
    if (stompClient && isConnected && user) {
      const chatMessage: ChatMessage = {
        type: 'CHAT',
        content: content,
        sender: user.displayName || 'Anonymous',
      };
      stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    }
  };

  return { messages, isConnected, sendMessage };
};