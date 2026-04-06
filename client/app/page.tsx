"use client";

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Pin, Trash2, Send, Clock, User, XCircle, Info } from 'lucide-react';

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'https://real-time-chat-app-4pf1.onrender.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://real-time-chat-app-4pf1.onrender.com/api';

export default function ChatApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket and User
  useEffect(() => {
    const savedUserId = localStorage.getItem('chat_user_id') || Math.random().toString(36).substring(7);
    const savedUsername = localStorage.getItem('chat_username') || '';
    setUserId(savedUserId);
    setUsername(savedUsername);
    localStorage.setItem('chat_user_id', savedUserId);

    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);

    newSocket.on('connect_error', () => {
      setErrorMessage('Failed to connect to real-time server.');
    });
    
    newSocket.on('connect', () => {
      setErrorMessage(null);
    });

    newSocket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    newSocket.on('pin_toggle', (updatedMsg) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
    });

    newSocket.on('delete_broadcast', ({ id, type }) => {
      if (type === 'everyone') {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeletedEveryone: true } : m));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial messages
  useEffect(() => {
    if (isJoined && userId) {
      fetch(`${API_URL}/messages?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data);
            setErrorMessage(null);
            setTimeout(scrollToBottom, 500);
          } else {
            setErrorMessage('Database connection issue: ' + (data.error || 'Server error'));
            setMessages([]);
          }
        })
        .catch(err => {
          setErrorMessage('Could not connect to the backend server.');
          setMessages([]);
        });
    }
  }, [isJoined, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim().length > 500) {
      setErrorMessage('Message is too long (max 500 chars)');
    } else {
      setErrorMessage(null);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || !username) return;
    if (trimmedInput.length > 500) {
      setErrorMessage('Message is too long (max 500 chars)');
      return;
    }

    const msgData = {
      content: trimmedInput,
      sender: username,
      userId: userId
    };

    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      setInput('');
      setErrorMessage(null);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('chat_username', username);
      setIsJoined(true);
    }
  };

  const togglePin = async (id: string, currentPin: boolean) => {
    try {
      await fetch(`${API_URL}/messages/${id}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPin })
      });
    } catch (err) {
      console.error('Failed to pin', err);
    }
  };

  const deleteMessage = async (id: string, type: 'me' | 'everyone') => {
    if (type === 'everyone' && !window.confirm('Delete this for everyone?')) return;
    
    try {
      await fetch(`${API_URL}/messages/${id}/delete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId })
      });
      
      if (type === 'me') {
        setMessages(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const pinnedMessages = Array.isArray(messages) 
    ? messages.filter(m => m.isPinned && !m.isDeletedEveryone)
    : [];

  if (!isJoined) {
    return (
      <div className="chat-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <User size={64} style={{ marginBottom: '20px', color: 'var(--accent-blue)' }} />
          <h1 style={{ marginBottom: '10px' }}>Welcome to Chat</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Enter your name to start messaging</p>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              className="message-input" 
              placeholder="Username..." 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <button type="submit" className="send-btn">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Error Message */}
      {errorMessage && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '10px 20px', fontSize: '0.85rem', textAlign: 'center', borderBottom: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <Info size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          {errorMessage}
        </div>
      )}

      {/* Pinned Messages Area */}
      {pinnedMessages.length > 0 && (
        <div className="pinned-banner">
          <Info size={16} color="var(--accent-blue)" />
          {pinnedMessages.map((msg: any) => (
            <div key={msg._id} className="pinned-item">
              <Pin size={12} className="badge-pinned" fill="#fbbf24" />
              <span>{msg.sender}: {msg.content.substring(0, 30)}{msg.content.length > 30 ? '...' : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="chat-messages">
        {(!Array.isArray(messages) || messages.length === 0) && (
          <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>💬</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No messages yet!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Be the first to say hello and start the conversation 👋</p>
          </div>
        )}
        {Array.isArray(messages) && messages.map((msg: any) => {
          const isMe = msg.sender === username;
          
          return (
            <div key={msg._id} className={`message-wrapper ${isMe ? 'sent' : 'received'}`}>
              <div className={`message-bubble ${msg.isPinned ? 'pinned' : ''}`}>
                {msg.isPinned && !msg.isDeletedEveryone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#fbbf24', marginBottom: '4px' }}>
                    <Pin size={10} fill="#fbbf24" /> Pinned
                  </div>
                )}
                
                <div className="message-content">
                  {msg.isDeletedEveryone ? (
                    <span className="deleted-text">This message was deleted</span>
                  ) : (
                    msg.content
                  )}
                </div>

                {!msg.isDeletedEveryone && (
                  <div className="message-actions">
                    <button className="action-btn" onClick={() => togglePin(msg._id, msg.isPinned)}>
                      <Pin size={12} className={msg.isPinned ? 'badge-pinned' : ''} fill={msg.isPinned ? '#fbbf24' : 'none'} />
                    </button>
                    <button className="action-btn" onClick={() => deleteMessage(msg._id, 'me')}>
                      <Trash2 size={12} /> Me
                    </button>
                    {isMe && (
                      <button className="action-btn" onClick={() => deleteMessage(msg._id, 'everyone')}>
                        <XCircle size={12} /> All
                      </button>
                    )}
                  </div>
                )}

                <div className="message-meta">
                  <span className="message-info">{!isMe && msg.sender}</span>
                  <span className="message-info">
                    <Clock size={10} />
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="input-area" style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <input 
            className="message-input" 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || input.trim().length > 500}>
            <Send size={20} />
          </button>
        </div>
        <div className={`char-counter ${input.trim().length > 500 ? 'limit-exceeded' : ''}`}>
          {input.trim().length} / 500
        </div>
      </form>
    </div>
  );
}
