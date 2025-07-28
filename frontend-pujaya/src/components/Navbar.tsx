'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useMenuContext } from '@/context/MenuContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useHasOwnAuctions } from './hooks/useHasOwnAuctions';

const Navbar = () => {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { setNavbarOpen } = useMenuContext();
  const hasOwnAuctions = useHasOwnAuctions(userData?.user.id, userData?.token);

  // Sincroniza el estado local con el contexto SOLO cuando cambia menuOpen
  React.useEffect(() => {
    setNavbarOpen(menuOpen);
  }, [menuOpen, setNavbarOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };
  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    if (user) {
      toast.warning(`User ${user.displayName} has logged out`, {
        position: 'top-center',
      });
      logout();
      router.refresh();
      router.push('/');
    }
  };

  return (
    <nav className="w-full bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold text-blue-800">
          PujaYa!
        </Link>

        {/* Botón hamburguesa - solo en móvil */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700 focus:outline-none z-50">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Enlaces - Escritorio */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-blue-800 font-medium hover:text-yellow-400 transition">
            Home
          </Link>
          <Link
            href="/auctions"
            className="text-blue-800 font-medium hover:text-yellow-400 transition"
          >
            Auctions
          </Link>
          <Link
            href="/contactUs"
            className="text-blue-800 font-medium hover:text-yellow-400 transition"
          >
            Contact Us
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-blue-800 font-medium hover:text-yellow-400 transition"
              >
                Profile
              </Link>
              {hasOwnAuctions && (
                <Link
                  href="/owner/chats"
                  className="text-blue-800 font-medium hover:text-yellow-400 transition"
                >
                  Messages
                </Link>
              )}
              {userData?.user.role === 'admin' && (
                <Link
                  href="/dashboard"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition">
                Log In
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Menú móvil deslizable */}
      <div
        className={`
    fixed inset-y-0 right-0 w-64 bg-white shadow-md transform transition-transform duration-300 z-40
    ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
    md:hidden
`}
      >
        <div className="flex flex-col p-6 space-y-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-blue-800 font-medium hover:text-yellow-400"
          >
            Home
          </Link>
          <Link
            href="/auctions"
            onClick={closeMenu}
            className="text-blue-800 font-medium hover:text-yellow-400"
          >
            Auctions
          </Link>
          <Link
            href="/contactUs"
            onClick={closeMenu}
            className="text-blue-800 font-medium hover:text-yellow-400"
          >
            Contact Us
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="text-blue-800 font-medium hover:text-yellow-400"
              >
                Profile
              </Link>
              {hasOwnAuctions && (
                <Link
                  href="/owner/chats"
                  onClick={closeMenu}
                  className="text-blue-800 font-medium hover:text-yellow-400"
                >
                  Messages
                </Link>
              )}
              {userData?.user.role === 'admin' && (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={closeMenu}>
              <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition">
                Log In
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Overlay (fondo oscuro para cerrar el menú móvil) */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={closeMenu} />
      )}
    </nav>
  );
};

export default Navbar;
