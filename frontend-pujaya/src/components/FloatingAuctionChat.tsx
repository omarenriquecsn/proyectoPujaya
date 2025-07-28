'use client';

import { useState, useEffect, useCallback } from 'react';
import AuctionChatWrapper from './AuctionChatWrapper';

interface FloatingAuctionChatProps {
  auctionId: string;
  room: string;
  username: string;
  targetUserId: string;
  uid: string; // <-- nuevo prop
}

interface Message {
  sender: string;
  text: string;
  // Agrega aquí más campos si tu mensaje los tiene
}

export default function FloatingAuctionChat({
  auctionId,
  room,
  username,
  targetUserId,
  uid,
}: Omit<FloatingAuctionChatProps, 'token'>) {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hover, setHover] = useState(false);

  // Custom handler to receive messages from AuctionChat
  const handleMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  // Detect unread messages
  useEffect(() => {
    if (!open && messages.length > lastMessageCount) {
      setHasUnread(true);
    }
    setLastMessageCount(messages.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Clear unread when opening chat
  useEffect(() => {
    if (open) setHasUnread(false);
  }, [open]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {/* Animated tooltip on hover */}
        <div
          className={`transition-all duration-200 ${hover ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'} bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg mr-3 text-base font-semibold pointer-events-none select-none`}
        >
          Talk with the owner
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`relative bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl focus:outline-none transition-all duration-200 ${hover ? 'scale-110 ring-4 ring-blue-300' : ''}`}
          aria-label="Open chat"
        >
          💬
          {hasUnread && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white animate-bounce">
              !
            </span>
          )}
        </button>
      </div>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[95vw] h-[500px]">
          <AuctionChatWrapper
            auctionId={auctionId}
            room={room}
            username={username}
            targetUserId={targetUserId}
            uid={uid}
            onMessages={handleMessages}
          />
        </div>
      )}
    </>
  );
}
