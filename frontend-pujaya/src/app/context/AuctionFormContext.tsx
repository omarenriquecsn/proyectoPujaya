"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AuctionFormData {
  name: string;
  description: string;
  endDate: string;
  productId?: string;
  productName?: string;
}

interface AuctionFormContextType {
  auctionForm: Partial<AuctionFormData>;
  setAuctionForm: (data: Partial<AuctionFormData>) => void;
  clearAuctionForm: () => void;
}

const AuctionFormContext = createContext<AuctionFormContextType | undefined>(
  undefined
);

export const AuctionFormProvider = ({ children }: { children: ReactNode }) => {
  const [auctionForm, setAuctionFormState] = useState<Partial<AuctionFormData>>(
    {}
  );

  const setAuctionForm = (data: Partial<AuctionFormData>) => {
    setAuctionFormState((prev) => ({ ...prev, ...data }));
  };

  const clearAuctionForm = () => setAuctionFormState({});

  return (
    <AuctionFormContext.Provider
      value={{ auctionForm, setAuctionForm, clearAuctionForm }}>
      {children}
    </AuctionFormContext.Provider>
  );
};

export const useAuctionForm = () => {
  const context = useContext(AuctionFormContext);
  if (!context)
    throw new Error("useAuctionForm must be used within AuctionFormProvider");
  return context;
};
