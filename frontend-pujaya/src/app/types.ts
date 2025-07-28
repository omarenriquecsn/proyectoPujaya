import { IBid } from "./types/index";

export interface IAuction {
  id: string;
  name: string;
  description: string;
  endDate: string;
  isActive: boolean;
  owner?: {
    id: string;
    name: string;
    email: string;
  };

  product: {
    id: string;
    name: string;
    imgProduct: string[];
    description: string;
    initialPrice: number;
    currentHighestBid?: number;
    category?: {
      categoryName: string;
    };
  };
  currentHighestBid?: number;
  bids?: IBid[];
}



export interface IProduct {
  id: string;
  name: string;
  imgProduct: string[];
  description: string;
  initialPrice: number;
  currentHighestBid?: number;
  category?: {
    categoryName: string;
  };
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  imgProfile?: string;
  createdAt?: string;
  role?: string;
  isActive?: boolean;
  firebaseId?: string;
}
