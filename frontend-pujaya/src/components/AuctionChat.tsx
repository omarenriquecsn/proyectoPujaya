'use client';

import { useState, useEffect } from 'react';
// import { useAuctionChat } from '../context/useAuctionChat';
import { useAuctionChatPusher } from '../context/useAuctionChatPusher';
import Image from 'next/image';

interface AuctionChatProps {
  auctionId: string;
  token: string;
  room: string;
  username: string;
  targetUserId: string;
  onMessages?: (msgs: { sender: string; text: string }[]) => void;
  uid: string; // <-- nuevo prop
}

export default function AuctionChat({
  auctionId,
  token,
  room,
  username,
  targetUserId,
  onMessages,
  uid,
}: AuctionChatProps) {
  // const { messages, sendMessage, error, joined } = useAuctionChat({
  //   auctionId,
  //   token,
  //   room,
  //   targetUserId,
  //   uid,
  // });
  const { messages, sendMessage, error, joined } = useAuctionChatPusher({
    auctionId,
    token,
    room,
    targetUserId,
    uid,
    username,
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    if (onMessages) onMessages(messages);
  }, [messages, onMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;
  }

  if (!joined) {
    return <div className="p-4 bg-yellow-100 text-yellow-700 rounded">Joining chat...</div>;
  }

  return (
    <div className="flex flex-col h-full border rounded shadow bg-white transition-all relative overflow-hidden">
      {/* Logo de fondo como watermark en el área de mensajes */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <Image
          src="/pujaya-bg.png"
          alt="PujaYa Logo"
          width={420}
          height={420}
          className="w-80 md:w-[420px] opacity-20 select-none drop-shadow-lg"
          style={{ filter: 'brightness(1.1)' }}
          priority
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 md:p-6 space-y-2 flex flex-col relative z-10">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg shadow text-sm md:text-base break-words whitespace-pre-line
                ${
                  msg.sender === username
                    ? 'bg-green-200 text-right text-green-900 rounded-br-none'
                    : 'bg-white text-left text-gray-900 border rounded-bl-none'
                }
              `}
            >
              <span className="font-semibold block text-xs md:text-sm mb-1">{msg.sender}</span>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex p-2 border-t bg-white gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!joined}
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50"
          disabled={!joined || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
