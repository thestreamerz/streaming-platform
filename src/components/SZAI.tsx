import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, MessageCircle, Search, Play, Info, Star, Clock, TrendingUp } from 'lucide-react';
import { tmdbService } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'content' | 'help';
  content?: any;
}

interface SZAIProps {
  isOpen: boolean;
  onClose: () => void;
  onWatch?: (item: any, type: string) => void;
  onSelect?: (item: any, type: string) => void;
  movies?: any[];
  tvShows?: any[];
}

export const SZAI: React.FC<SZAIProps> = ({ 
  isOpen, 
  onClose, 
  onWatch, 
  onSelect, 
  movies = [], 
  tvShows = [] 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm SZ AI, your personal streaming assistant. I can help you find movies, TV shows, answer questions about the platform, and provide recommendations. What would you like to know?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // AI Knowledge Base
  const aiKnowledge = {
    platform: {
      features: [
        "Stream unlimited movies and TV shows",
        "HD and 4K quality streaming",
        "Multiple server options for reliable playback",
        "Advanced search and filtering",
        "Personalized recommendations",
        "Continue watching feature",
        "User authentication and profiles",
        "Mobile responsive design"
      ],
      navigation: [
        "Use the header menu to navigate between Home, Movies, TV Shows, and Trending",
        "Search for content using the search bar",
        "Filter content by genre using the genre filter",
        "Click on movie/show cards to view details",
        "Use the video player with multiple server options"
      ],
      troubleshooting: [
        "If a video doesn't play, try switching servers using the server selector",
        "Make sure you have a stable internet connection",
        "Try refreshing the page if content doesn't load",
        "Use the back button in the video player to return to browsing"
      ]
    },
    content: {
      categories: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Documentary"],
      quality: ["HD", "4K", "1080p", "720p"],
      languages: ["English", "Hindi", "Spanish", "French", "German", "Korean", "Japanese", "Chinese"]
    }
  };

  // Helper: run a combined TMDB search
  const searchTitles = async (query: string) => {
    try {
      const [moviesRes, showsRes] = await Promise.all([
        tmdbService.searchMovies(query),
        tmdbService.searchTVShows(query)
      ]);
      const results = [
        ...moviesRes.map((r: any) => ({ ...r, __type: 'movie' })),
        ...showsRes.map((r: any) => ({ ...r, __type: 'tv' }))
      ];
      return results;
    } catch (e) {
      return [];
    }
  };

  // AI Response Generator
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Platform-related questions
    if (lowerMessage.includes('help') || lowerMessage.includes('how to') || lowerMessage.includes('guide')) {
      return "I can help you with:\n• Finding movies and TV shows\n• Using platform features\n• Troubleshooting playback issues\n• Content recommendations\n\nWhat specific help do you need?";
    }
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return "To search for content:\n• Use the search bar in the header\n• Type movie or show names\n• Use advanced filters for specific criteria\n• Browse by genre using the genre filter";
    }
    
    if (lowerMessage.includes('play') || lowerMessage.includes('watch') || lowerMessage.includes('stream')) {
      return "To watch content:\n• Click on any movie/show card\n• Use the 'Play Now' button in the hero section\n• Select from multiple servers if one doesn't work\n• Use the back button to return to browsing";
    }
    
    if (lowerMessage.includes('server') || lowerMessage.includes('not working') || lowerMessage.includes('error')) {
      return "If you're having playback issues:\n• Try switching servers using the server selector\n• Check your internet connection\n• Refresh the page if needed\n• We have 22+ servers for maximum reliability";
    }
    
    if (lowerMessage.includes('quality') || lowerMessage.includes('hd') || lowerMessage.includes('4k')) {
      return "We offer multiple quality options:\n• HD (720p/1080p)\n• 4K Ultra HD\n• Multiple server options for best quality\n• Automatic quality selection based on your connection";
    }
    
    if (lowerMessage.includes('genre') || lowerMessage.includes('category')) {
      return `Available genres: ${aiKnowledge.content.categories.join(', ')}\n\nUse the genre filter to browse specific categories or ask me to recommend something!`;
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      const allContent = [...movies, ...tvShows];
      if (allContent.length > 0) {
        const recommendations = allContent
          .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
          .slice(0, 3);
        
        let response = "Here are some top recommendations:\n\n";
        recommendations.forEach((item, index) => {
          const title = item.title || item.name;
          const rating = item.vote_average?.toFixed(1) || 'N/A';
          response += `${index + 1}. ${title} (★ ${rating})\n`;
        });
        response += "\nWould you like me to show you more details about any of these?";
        return response;
      }
      return "I'd be happy to recommend content! What genres do you enjoy? (Action, Comedy, Drama, Horror, etc.)";
    }
    
    if (lowerMessage.includes('trending') || lowerMessage.includes('popular')) {
      const allContent = [...movies, ...tvShows];
      if (allContent.length > 0) {
        const trending = allContent
          .filter(item => item.trending || (item.vote_average && item.vote_average > 7))
          .slice(0, 3);
        
        if (trending.length > 0) {
          let response = "🔥 Currently trending:\n\n";
          trending.forEach((item, index) => {
            const title = item.title || item.name;
            const rating = item.vote_average?.toFixed(1) || 'N/A';
            response += `${index + 1}. ${title} (★ ${rating})\n`;
          });
          return response;
        }
      }
      return "Check out the 'Trending' section in the header menu for the latest popular content!";
    }
    
    if (lowerMessage.includes('bollywood') || lowerMessage.includes('indian') || lowerMessage.includes('hindi')) {
      return "We have extensive Bollywood and Indian content! We've added special servers optimized for Indian movies and shows. Try searching for Bollywood movies or ask me for specific recommendations!";
    }
    
    if (lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('sign up')) {
      return "To create an account:\n• Click the user icon in the header\n• Choose 'Sign up' to create a new account\n• Use Google sign-in for quick access\n• Or create an account with email/password\n\nThis gives you access to personalized features!";
    }
    
    // Fallback: try searching TMDB with the user's text
    if (userMessage.trim().length >= 2) {
      const results = await searchTitles(userMessage.trim());
      if (results.length > 0) {
        const top = results
          .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
          .slice(0, 5);
        let response = 'Here is what I found:\n\n';
        top.forEach((item: any, index: number) => {
          const title = item.title || item.name;
          const year = (item.release_date || item.first_air_date || '').slice(0, 4);
          const rating = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : 'No rating';
          response += `${index + 1}. ${title} (${item.__type.toUpperCase()}${year ? ` • ${year}` : ''}) — ${rating}\n`;
        });
        response += '\nSay "watch <title>" or "details <title>" to open it.';
        return response;
      }
    }

    // Default help
    return "I'm here to help! You can ask me about:\n• Finding specific movies or shows\n• Platform features and navigation\n• Content recommendations\n• Troubleshooting issues\n• Bollywood and international content\n\nTry typing a title to search, e.g., \"Inception\".";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    const aiResponse = await generateAIResponse(inputText);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "How to search?", icon: Search },
    { text: "Recommend movies", icon: Star },
    { text: "Trending content", icon: TrendingUp },
    { text: "Bollywood movies", icon: Play },
    { text: "Platform help", icon: MessageCircle }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 p-0 pointer-events-auto">
      <div className="bg-slate-900 rounded-2xl w-[360px] sm:w-[420px] max-w-[95vw] h-[480px] sm:h-[520px] flex flex-col shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">SZ AI</h2>
              <p className="text-xs sm:text-sm text-gray-400">Your streaming assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors touch-feedback"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'ai' && (
                    <Bot className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  )}
                  <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-white rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-700">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => { setInputText(action.text); setTimeout(() => handleSendMessage(), 0); }}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs sm:text-sm transition-colors touch-feedback"
              >
                <action.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-slate-700">
          <div className="flex space-x-2 sm:space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about movies, shows, or the platform..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors touch-feedback"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
