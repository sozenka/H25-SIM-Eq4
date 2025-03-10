import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { useMusicStore } from '../store/musicStore';
import { getChatResponse } from '../lib/openai'; // Assuming this is your API utility

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Bonjour ! Je suis votre assistant musical IA. Je peux vous aider avec la composition, la théorie musicale, ou simplement discuter de musique. Comment puis-je vous aider aujourd'hui ?",
  },
];

const AiSuggestions = () => {
  const { currentScale, setScale } = useMusicStore();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentResponse('');

    try {
      // Prepare the conversation history for the API
      const chatMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      chatMessages.push({ role: 'user', content: input });

      // Fetch the AI response from the API
      const stream = await getChatResponse(chatMessages);
      let fullResponse = '';

      // Stream the response chunk by chunk
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        setCurrentResponse((prev) => prev + content);
      }

      // Add the AI response to the messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentResponse('');
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-purple-500/20 flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Assistant Musical IA</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-200">Gamme actuelle:</span>
          <select
            value={currentScale}
            onChange={(e) => setScale(e.target.value)}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1 text-white"
          >
            <option value="C">Do majeur</option>
            <option value="G">Sol majeur</option>
            <option value="D">Ré majeur</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'flex items-start gap-4 max-w-3xl mx-auto',
              message.role === 'user' && 'flex-row-reverse'
            )}
          >
            <div
              className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                message.role === 'assistant' ? 'bg-purple-500' : 'bg-blue-500'
              )}
            >
              {message.role === 'assistant' ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={clsx(
                'flex-1 rounded-lg p-4',
                message.role === 'assistant' ? 'bg-purple-500/10' : 'bg-blue-500/10'
              )}
            >
              <ReactMarkdown className="prose prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-purple-200 max-w-none">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {currentResponse && (
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 rounded-lg p-4 bg-purple-500/10">
              <ReactMarkdown className="prose prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-purple-200 max-w-none">
                {currentResponse}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {isLoading && !currentResponse && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/20">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Parlez-moi de votre projet musical..."
            className="flex-1 bg-black/20 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={clsx(
              'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
              input.trim() && !isLoading
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-purple-500/20 text-purple-300 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
            <span className="text-white">Envoyer</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiSuggestions;