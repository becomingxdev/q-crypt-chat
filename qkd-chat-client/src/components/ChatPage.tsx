import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { useChat } from '../hooks/useChat';
import axios from 'axios';

export const ChatPage = () => {
  const { messages, isConnected, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isQkdRunning, setIsQkdRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Type-safe message filtering
  const chatMessages = messages.filter(msg => msg.type !== 'QKD_LOG');
  const logMessages = messages.filter(msg => msg.type === 'QKD_LOG');

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      sendMessage(newMessage);
      setNewMessage('');
      setError(null); // Clear any previous errors
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Improved QKD start function with better error handling
  const startQKD = async () => {
    if (!user) {
      setError("You must be logged in to start a secure session.");
      return;
    }

    if (!isConnected) {
      setError("Not connected to chat server. Please wait for connection.");
      return;
    }

    setIsQkdRunning(true);
    setError(null);
    
    try {
      const token = await user.getIdToken();

      const response = await axios.get('https://qkd-chat-server.onrender.com/api/qkd/start', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('QKD process started successfully:', response.data);
    } catch (error) {
      console.error("Error starting QKD process:", error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          setError("Authentication failed. Please sign in again.");
        } else if (status === 403) {
          setError("Access denied. You don't have permission to start QKD.");
        } else if (error.code === 'ECONNABORTED') {
          setError("Request timeout. The server might be busy.");
        } else if (status && status >= 500) {
          setError("Server error. Please try again later.");
        } else if (!error.response) {
          setError("Network error. Please check your connection.");
        } else {
          setError(`Failed to start secure session: ${error.response.data?.message || error.message}`);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsQkdRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-cyan-400">Q-Crypt Chat</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">Welcome, {user?.displayName || user?.email || 'User'}</span>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-600 text-white p-3 text-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-4 text-red-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800 rounded-lg">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400 italic">
                No messages yet. Start a conversation!
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.sender === user?.displayName ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-lg ${
                      msg.type === 'JOIN' || msg.type === 'LEAVE'
                        ? 'bg-gray-700 text-gray-400 italic w-full text-center'
                        : msg.sender === user?.displayName
                        ? 'bg-blue-600'
                        : 'bg-gray-700'
                    }`}>
                    {msg.type === 'CHAT' && msg.sender && (
                      <p className="font-bold text-cyan-300">{msg.sender}</p>
                    )}
                    <p className="break-words">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              className="flex-1 p-3 bg-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
              maxLength={500} // Prevent extremely long messages
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-r-lg transition disabled:bg-gray-500"
              disabled={!isConnected || !newMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>

        {/* Log Panel */}
        <div className="w-1/3 flex flex-col border-l-2 border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-300">System Logs</h2>
            <button 
              onClick={startQKD}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isQkdRunning || !isConnected}
              title={!isConnected ? "Not connected to server" : isQkdRunning ? "QKD process running" : "Start quantum key distribution"}
            >
              {isQkdRunning ? 'Generating Key...' : 'Start Secure Session'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-black rounded-lg font-mono text-sm">
            <p className={`text-${isConnected ? 'green' : 'red'}-400 mb-2`}>
              ● Connection status: {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            {logMessages.length === 0 ? (
              <p className="text-gray-500 italic">No system logs yet...</p>
            ) : (
              logMessages.map((log, index) => (
                <p key={index} className={`whitespace-pre-wrap mb-1 ${
                  log.content.includes('HACKER') ? 'text-red-500' : 
                  log.content.includes('ERROR') ? 'text-yellow-500' :
                  'text-green-400'
                }`}>
                  {log.content}
                </p>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};