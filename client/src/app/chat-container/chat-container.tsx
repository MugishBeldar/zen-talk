import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatList from './chat-list/chat-list';

const ChatContainer = () => {
  // Example chat data (You can fetch this from an API or state management)
  const chats = [
    { id: '1', userId: 'user1', name: 'Alice' },
    { id: '2', userId: 'user2', name: 'Bob' },
    { id: '3', userId: 'user3', name: 'Charlie' },
    // Add more chats as needed
  ];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Chat List (Sidebar) */}
      <ChatList chats={chats} />

      {/* Chat Area (Messages) */}
      <div style={{ flex: 1, padding: '10px', borderLeft: '1px solid #ccc' }}>
        <h2>Welcome to Chat</h2>
        <Outlet /> {/* This renders the child routes for chat area */}
      </div>
    </div>
  );
};

export default ChatContainer;
