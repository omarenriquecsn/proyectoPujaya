'use client';

import { useEffect, useState } from 'react';

export function useHasOwnAuctions(userId: string | undefined, token: string | undefined) {
  const [hasOwnAuctions, setHasOwnAuctions] = useState(false);
  useEffect(() => {
    if (!userId || !token) return;
    const fetchOwnAuctions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products?ownerId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setHasOwnAuctions(Array.isArray(data) && data.length > 0);
        } else {
          setHasOwnAuctions(false);
        }
      } catch {
        setHasOwnAuctions(false);
      }
    };
    fetchOwnAuctions();
  }, [userId, token]);
  return hasOwnAuctions;
}
