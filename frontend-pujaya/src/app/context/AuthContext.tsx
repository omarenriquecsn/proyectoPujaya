'use client';

import { IUserSession } from '@/app/types/index';
import { auth } from '@/components/lib/firebaseConfig';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export interface AuthContextProps {
  userData: IUserSession | null;
  user: User | null;
  setUser: (user: User | null) => void;
  setUserData: (userData: IUserSession | null) => void
  updateUserRole: (newRole: "regular" | "admin" | "premium") => void;
  logout: () => void
}

export const AuthContext = createContext<AuthContextProps>({
  userData: null,
  user: null,
  setUser: () => { },
  setUserData: () => { },
  updateUserRole: () => { },
  logout: () => { },
})

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<IUserSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // NUEVO: estado de carga

  useEffect(() => {
    if (userData) {
      localStorage.setItem(
        'userSession',
        JSON.stringify({ token: userData.token, user: userData.user })
      );
      Cookies.set('userSession', JSON.stringify({ token: userData.token, user: userData.user }));
    }
  }, [userData]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userSession')!);
    setUserData(userData);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsuscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsuscribe();
  });
  // save session in localStorage and cookies when userData changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem(
        'userSession',
        JSON.stringify({
          token: userData.token,
          user: userData.user,
        })
      );
      Cookies.set('userSession', JSON.stringify({ token: userData.token, user: userData.user }));
    }
  }, [userData]);

  useEffect(() => {
    // Recover session from localStorage ONLY once when mounting
    if (!userData) {
      const session = localStorage.getItem('userSession');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed && parsed.token && parsed.user) {
            if (!parsed.user.firebaseUid && parsed.user.firebase_uid) {
              parsed.user.firebaseUid = parsed.user.firebase_uid;
            }
            setUserData(parsed);
            // restored = true;

            // console.log(restored)
          }
        } catch {
          localStorage.removeItem('userSession');
        }
      }
      // loading must always end, whether there is a user or not
      setLoading(false);
    } else {
      // If there is already userData, loading ends the same
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // SOLO al montar

  // Keep the Firebase user updated
  useEffect(() => {
    const auth = getAuth();
    const unsuscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsuscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userSession');
      setUserData(null);
      Cookies.remove("userSession");
    } catch (error: unknown) {
      console.error("Fail to close session: ", error);
    }
  };

  const updateUserRole = (newRole: "regular" | "admin" | "premium") => {
    if (userData) {
      const updatedUserData: IUserSession = {
        ...userData,
        user: {
          ...userData.user,
          role: newRole,
        },
      };
      setUserData(updatedUserData);
    }
  };

  return (
    <AuthContext.Provider value={{ userData, user, setUserData, setUser, updateUserRole, logout }}>
      {/* Global session loader */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="text-blue-700 font-semibold text-lg animate-pulse">
            <LoadingSpinner />
          </span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
