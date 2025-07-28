import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import AuctionChat from './AuctionChat';

interface AuctionChatWrapperProps {
  auctionId: string;
  room: string;
  username: string;
  targetUserId: string;
  onMessages?: (msgs: { sender: string; text: string }[]) => void;
  uid: string;
}

export default function AuctionChatWrapper(props: AuctionChatWrapperProps) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      user.getIdToken().then((t: string) => {
        if (isMounted) setToken(t);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!token) return <div>Loading chat...</div>;

  return <AuctionChat {...props} token={token} />;
}
