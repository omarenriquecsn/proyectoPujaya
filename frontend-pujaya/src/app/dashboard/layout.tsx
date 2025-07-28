'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMenuContext } from '@/context/MenuContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, anyMenuOpen } = useMenuContext();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (!userData) {
      router.push('/login');
      return;
    }

    if (userData.user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [userData, router]);

  // Hook extra para controlar el scroll del body
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  if (!userData || userData.user.role !== 'admin') {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* Botón menú hamburguesa solo visible cuando el sidebar está cerrado y ningún menú global está abierto */}
      {!sidebarOpen && !anyMenuOpen && (
        <button
          className="absolute top-4 left-4 z-50 md:hidden p-2 bg-white rounded shadow"
          onClick={toggleSidebar}
        >
          <svg
            className="h-6 w-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Overlay to close sidebar (only on mobile and when open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
                fixed top-0 left-0 h-full w-4/5 max-w-xs z-50 bg-white shadow-md transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:static md:w-60 md:max-w-none md:translate-x-0
            `}
      >
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 z-10">
        {children}
      </div>
    </div>
  );
}
