import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ClientNavbar from '../../components/client/ClientNavbar';
import FreelancerNavbar from '../../components/freelancer/FreelancerNavbar';
import api from '../../utils/api';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCheck, ArrowLeft, User, MoreVertical } from 'lucide-react';

export default function ChatPage() {
  const { otherId } = useParams();
  const { token, userId, role } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState({ name: 'Loading...' });
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Choose navbar
  const Navbar = role === 'client' ? ClientNavbar : FreelancerNavbar;

  // Init socket
  useEffect(() => {
    const url = (process.env.REACT_APP_API_URL || 'http://localhost:5000')
      .replace(/\/api\/?$/, '');
    const socket = io(url);
    socketRef.current = socket;

    // join our room
    socket.emit('joinUser', userId);

    socket.on('message', msg => {
      // if from this chat, append
      if ((msg.senderId === otherId) || (msg.receiverId === otherId)) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('typing', data => {
      if (data.userId === otherId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.emit('leaveUser', userId);
      socket.disconnect();
    };
  }, [userId, otherId]);

  // Load existing messages & mark read
  useEffect(() => {
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    
    // Fetch messages
    api.get(`/messages/${otherId}`, headers)
      .then(res => setMessages(res.data))
      .then(() =>
        api.patch(`/messages/${otherId}/read`, {}, headers)
      )
      .catch(console.error);
      
    // Fetch other user's info
    api.get(`/users/${otherId}`, headers)
      .then(res => setOtherUser(res.data))
      .catch(console.error);
  }, [token, otherId]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message
  const send = async e => {
    e.preventDefault();
    if (!input.trim()) return;
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await api.post('/messages', { receiverId: otherId, content: input }, headers);
      setInput('');
      // sent message arrives via socket to our own room
    } catch (err) {
      console.error(err);
    }
  };

  // Emit typing event
  const handleTyping = (e) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { userId, toUserId: otherId });
  };

  // Get time in readable format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get date for message groups
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Go back function
  const goBack = () => {
    navigate(-1);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 text-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto h-screen pt-16 pb-4 px-4">
        <div className="h-full rounded-xl overflow-hidden flex flex-col bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-indigo-900/20">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-800 to-purple-700 flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goBack}
              className="mr-3 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3"
            >
              {otherUser?.avatar ? (
                <img 
                  src={otherUser.avatar} 
                  alt={otherUser.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </motion.div>
            
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{otherUser?.name || 'Loading...'}</h2>
              <div className="text-xs text-indigo-200 opacity-80">
                {isTyping ? (
                  <span className="flex items-center">
                    <span>Typing</span>
                    <motion.span
                      animate={{
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >...</motion.span>
                  </span>
                ) : (
                  otherUser?.online ? 'Online' : otherUser?.lastSeen ? `Last seen at ${formatTime(otherUser.lastSeen)}` : ''
                )}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-black/20"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-3">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3 py-1 bg-gray-800/80 rounded-full text-xs text-gray-300 inline-block"
                  >
                    {date}
                  </motion.div>
                </div>
                
                {dateMessages.map((msg, index) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ 
                        opacity: 0, 
                        x: isMine ? 20 : -20,
                      }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.05
                      }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md ${
                          isMine 
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl rounded-br-sm' 
                            : 'bg-gray-700 text-gray-100 rounded-2xl rounded-bl-sm'
                        } p-3 shadow-lg relative overflow-hidden`}
                      >
                        {/* Message bubble highlight effect */}
                        {isMine && (
                          <div className="absolute top-0 right-0 w-full h-full bg-white/10 rounded-full blur-3xl -z-10 opacity-30" />
                        )}
                        
                        <p className="break-words">{msg.content}</p>
                        <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                          isMine ? 'text-indigo-200' : 'text-gray-400'
                        }`}>
                          {formatTime(msg.timestamp)}
                          {isMine && (
                            msg.readStatus ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <CheckCheck className="w-3 h-3 opacity-40" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
            
            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex"
                >
                  <div className="bg-gray-700/70 rounded-full px-4 py-2 text-gray-300 text-sm flex items-center">
                    <motion.div 
                      className="flex space-x-1"
                      animate={{
                        y: [0, -3, 0]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="block w-2 h-2 rounded-full bg-indigo-400"></span>
                      <motion.span 
                        className="block w-2 h-2 rounded-full bg-indigo-400"
                        animate={{
                          y: [0, -3, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: 0.2
                        }}
                      ></motion.span>
                      <motion.span 
                        className="block w-2 h-2 rounded-full bg-indigo-400"
                        animate={{
                          y: [0, -3, 0]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: 0.4
                        }}
                      ></motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Message Input */}
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            onSubmit={send} 
            className="p-4 bg-gray-800 border-t border-gray-700"
          >
            <div className="flex items-center gap-2 bg-gray-700 rounded-full pr-2 pl-4 py-1 shadow-inner">
              <input
                className="flex-1 bg-transparent p-2 focus:outline-none text-gray-100 placeholder-gray-400"
                value={input}
                onChange={handleTyping}
                placeholder="Type a message..."
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim()}
                className={`p-3 rounded-full ${input.trim() ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-600'} text-white`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}