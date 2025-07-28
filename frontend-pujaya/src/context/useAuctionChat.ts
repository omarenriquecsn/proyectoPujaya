'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  sender: string;
  senderId?: string;
  receiverId?: string;
  text: string;
  createdAt?: string;
}

interface UseAuctionChatProps {
  auctionId: string;
  token: string;
  room: string;
  targetUserId: string;
  uid: string; // <-- nuevo parámetro
}

export function useAuctionChat({ auctionId, token, room, targetUserId, uid }: UseAuctionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_CHAT_WS_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      path: process.env.NEXT_PUBLIC_CHAT_WS_PATH || '/chat',
      auth: { token, uid }, // <-- ahora se envía el uid
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Chat] Socket conectado');
      socket.emit('joinRoom', { room, token, auctionId, targetUserId });
    });

    socket.on('joinRoomSuccess', () => {
      console.log('[Chat] joinRoomSuccess');
      setJoined(true);
      setError(null);
      socket.emit('getChatHistory', { room });
    });

    socket.on('chatHistory', (history: ChatMessage[]) => {
      console.log('[Chat] chatHistory recibido:', history);
      setMessages(history);
    });

    socket.on('joinRoomError', (data) => {
      console.error('[Chat] joinRoomError:', data);
      setError(data.message || 'Unauthorized');
      setJoined(false);
    });

    socket.on('message', (msg: ChatMessage) => {
      console.log('[Chat] Mensaje recibido:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('joinRoomSuccess');
      socket.off('chatHistory');
      socket.off('joinRoomError');
      socket.off('message');
      socket.disconnect();
    };
  }, [auctionId, token, room, targetUserId, uid]);

  const sendMessage = useCallback(
    (text: string, sender: string) => {
      if (socketRef.current && joined) {
        const payload = {
          room,
          sender,
          text,
          auctionId,
          receiverId: targetUserId,
        };
        console.log('[Chat] Emitiendo mensaje:', payload);
        socketRef.current.emit('message', payload);
      }
    },
    [joined, room, auctionId, targetUserId]
  );

  return { messages, sendMessage, error, joined };
}
