import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const ChatWindow = (props) => {
  const [messageInput, setMessageInput] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messageWindowRef = useRef(null);
  const inputRef = useRef(null);

  // Styles object
  const styles = {
    chatWindow: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(to bottom, #f8faff 0%, #f0f4ff 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    chatHeader: {
      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
      color: 'white',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '12px 12px 0 0',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#4AE66F',
      borderRadius: '50%',
      marginRight: '8px',
      boxShadow: '0 0 0 2px rgba(74, 230, 111, 0.3)',
      animation: 'pulse 2s infinite',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '8px',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(0, 0, 0, 0.2)',
      },
    },
    message: (isOwn) => ({
      maxWidth: '85%',
      wordBreak: 'break-word',
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
      animation: 'messageSlide 0.3s ease-out',
    }),
    messageContent: (isOwn) => ({
      padding: '8px 12px',
      borderRadius: '12px',
      background: isOwn 
        ? 'linear-gradient(135deg, #e3efff 0%, #d5e5ff 100%)'
        : 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    }),
    messageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px',
    },
    messageSender: (isOwn) => ({
      fontWeight: 600,
      fontSize: '11px',
      color: isOwn ? '#357abd' : '#4a90e2',
    }),
    messageTime: {
      fontSize: '10px',
      color: '#999',
    },
    messageText: {
      fontSize: '13px',
      lineHeight: 1.4,
      color: '#333',
    },
    inputContainer: {
      padding: '12px',
      background: 'white',
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      display: 'flex',
      gap: '8px',
    },
    input: {
      flex: 1,
      padding: '10px 14px',
      border: '1px solid #e6e6e6',
      borderRadius: '20px',
      outline: 'none',
      fontSize: '13px',
      resize: 'none',
      maxHeight: '100px',
      transition: 'all 0.3s ease',
      '&:focus': {
        borderColor: '#4a90e2',
        boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.1)',
      },
    },
    sendButton: {
      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '0 20px',
      height: '36px',
      fontSize: '13px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(74, 144, 226, 0.2)',
      },
      '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    typingIndicator: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.8)',
      animation: 'fadeInOut 1s infinite',
    },
  };

  // Add keyframes for animations
  const keyframes = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(74, 230, 111, 0.4); }
      70% { box-shadow: 0 0 0 4px rgba(74, 230, 111, 0); }
      100% { box-shadow: 0 0 0 0 rgba(74, 230, 111, 0); }
    }

    @keyframes messageSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `;

  // Add keyframes to document
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessageList = useCallback(async () => {
    try {
      const response = await axios.get(`https://civic-bridge-backend-1.onrender.com/${props.complaintId}`);
      setMessageList(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [props.complaintId]);

  useEffect(() => {
    fetchMessageList();
    const interval = setInterval(fetchMessageList, 5000);
    return () => clearInterval(interval);
  }, [fetchMessageList]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      const data = {
        name: props.name,
        message: messageInput,
        complaintId: props.complaintId
      };
      
      const tempMessage = {
        ...data,
        createdAt: new Date().toISOString(),
        _id: 'temp-' + Date.now(),
        sending: true
      };
      
      setMessageList(prev => [...prev, tempMessage]);
      setMessageInput('');
      
      const response = await axios.post('https://civic-bridge-backend-1.onrender.com', data);
      
      setMessageList(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id ? response.data : msg
        )
      );
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    if (messageWindowRef.current) {
      messageWindowRef.current.scrollTop = messageWindowRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  return (
    <div style={styles.chatWindow}>
      <div style={styles.chatHeader}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span style={styles.statusDot}></span>
          Messages
        </span>
        {isTyping && <span style={styles.typingIndicator}>typing...</span>}
      </div>
      
      <div ref={messageWindowRef} style={styles.messagesContainer}>
        {messageList.slice().reverse().map((msg, index) => (
          <div 
            key={msg._id || index}
            style={styles.message(msg.name === props.name)}
          >
            <div style={styles.messageContent(msg.name === props.name)}>
              <div style={styles.messageHeader}>
                <span style={styles.messageSender(msg.name === props.name)}>
                  {msg.name}
                </span>
                <span style={styles.messageTime}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              
              <div style={styles.messageText}>
                {msg.message}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={styles.inputContainer}>
        <textarea 
          ref={inputRef}
          value={messageInput}
          placeholder="Type"
          onChange={(e) => {
            setMessageInput(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          style={styles.input}
          rows="1"
        />
        <button 
          onClick={sendMessage}
          style={styles.sendButton}
          disabled={!messageInput.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
