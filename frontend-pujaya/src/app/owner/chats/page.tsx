'use client';

import { useEffect, useState } from 'react';
import AuctionChat from '@/components/AuctionChat';
import { getIdToken, getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserConversations } from './conversationsApi';
import { uniqBy } from 'lodash';

interface Conversation {
  auctionId: string;
  auctionTitle: string;
  otherUserId: string;
  otherUserName: string;
  room: string;
  lastmessagetext?: string;
  lastmessageat?: string;
  type: string;
  displayName: string;
  displayRoom: string;
  displayAuction: string;
  displayLast?: string;
}

export default function OwnerChatsPage() {
  const [allConvs, setAllConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<{ type: string; conv: Conversation } | null>(null);
  const [token, setToken] = useState<string>('');
  const [uid, setUid] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const auth = getAuth();
    const unsuscribe = onAuthStateChanged(auth, async (user) => {
      const session = localStorage.getItem('userSession');
      let uuid = '';
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed && parsed.user && parsed.user.id) {
            uuid = parsed.user.id;
          }
        } catch {}
      }
      if (user && uuid) {
        setUid(user.uid);
        setUsername(user.displayName || user.email || 'Owner');
        const t = await getIdToken(user);
        setToken(t);
        // Fetch todas las conversaciones del usuario (como owner o bidder)
        const userConvs = await fetchUserConversations(t);
        const all = userConvs.map((c: Conversation) => ({
          ...c,
          type: 'user',
          displayName: c.otherUserName,
          displayRoom: c.room,
          displayAuction: c.auctionTitle,
          displayLast: c.lastmessagetext,
        }));
        setAllConvs(uniqBy(all, 'displayRoom') as unknown as Conversation[]);
      }
    });
    return () => unsuscribe();
  }, []);

  return (
    <div className="flex h-screen bg-blue-50 flex-col md:flex-row">
      {/* Sidebar estilo WhatsApp */}
      <aside className="w-full md:w-[380px] min-w-0 md:min-w-[320px] max-w-full md:max-w-[400px] bg-white flex flex-col shadow-lg md:rounded-none border-r border-blue-100">
        <div className="flex items-center gap-2 p-4 border-b border-blue-100">
          <h2 className="font-bold text-lg text-blue-800 tracking-wide">PujaYa! Chats</h2>
        </div>
        <div className="flex-1 flex flex-col gap-2 p-2 md:p-4 overflow-y-auto">
          <ul className="space-y-1">
            {allConvs.length === 0 && (
              <li className="text-blue-300 text-sm italic">No conversations.</li>
            )}
            {allConvs.map((conv, i) => (
              <li
                key={i}
                className={`rounded-lg p-3 cursor-pointer flex flex-col border-l-4 transition-colors
                  ${
                    selected?.conv.displayRoom === conv.displayRoom
                      ? 'bg-blue-100 border-blue-500 shadow text-blue-900'
                      : 'bg-transparent border-transparent text-blue-800 hover:bg-blue-100'
                  }`}
                onClick={() => setSelected({ type: conv.type, conv })}
              >
                <span className="font-semibold text-base truncate">{conv.displayAuction}</span>
                <span className="text-xs text-blue-500 truncate">{conv.displayName}</span>
                {conv.displayLast && (
                  <span className="text-xs text-blue-400 truncate mt-1">{conv.displayLast}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {/* Chat area estilo WhatsApp */}
      <main className="flex-1 flex flex-col h-full bg-blue-50">
        {selected && token && uid ? (
          <div className="flex flex-col h-full w-full max-w-full">
            {/* Header del chat */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-100 bg-white">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-lg">
                {selected.conv.displayName[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-blue-900 text-base md:text-lg">
                  {selected.conv.displayName}
                </span>
                <span className="text-xs text-blue-500">en {selected.conv.displayAuction}</span>
              </div>
            </div>
            {/* Mensajes */}
            <div className="flex-1 flex flex-col justify-end bg-transparent p-2 md:p-8 relative overflow-hidden">
              {/* Logo eliminado, ahora solo en AuctionChat */}
              <div className="relative z-10 h-full flex flex-col">
                <AuctionChat
                  auctionId={selected.conv.auctionId}
                  token={token}
                  room={selected.conv.displayRoom}
                  username={username}
                  targetUserId={selected.conv.otherUserId}
                  uid={uid}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-blue-400 text-lg font-semibold">Select a chat to start</p>
          </div>
        )}
      </main>
    </div>
  );
}
