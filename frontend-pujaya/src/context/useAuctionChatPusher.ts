import { useEffect, useState, useCallback } from 'react';
import Pusher from 'pusher-js';

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
  uid: string;
  username: string;
}

export function useAuctionChatPusher({
  auctionId,
  token,
  room,
  targetUserId,
}: UseAuctionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth', // optional if you use private channels
    });
    const channel = pusher.subscribe(room);
    setJoined(true);
    setError(null);

    channel.bind('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Optionally: load history from backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/history?room=${room}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        // Ensure it is always an array
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => setMessages([]));

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [room, token]);

  const sendMessage = useCallback(
    async (text: string) => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            auctionId,
            receiverId: targetUserId,
            text,
            room,
          }),
        });
      } catch {
        setError('Failed to send message');
      }
    },
    [auctionId, targetUserId, room, token]
  );

  return { messages, sendMessage, error, joined };
}
