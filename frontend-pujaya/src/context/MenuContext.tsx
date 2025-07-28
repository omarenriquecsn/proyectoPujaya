'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextType {
  navbarOpen: boolean;
  setNavbarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  anyMenuOpen: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenuContext must be used within a MenuProvider');
  return context;
};

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const anyMenuOpen = navbarOpen || sidebarOpen;

  return (
    <MenuContext.Provider
      value={{ navbarOpen, setNavbarOpen, sidebarOpen, setSidebarOpen, anyMenuOpen }}
    >
      {children}
    </MenuContext.Provider>
  );
};
