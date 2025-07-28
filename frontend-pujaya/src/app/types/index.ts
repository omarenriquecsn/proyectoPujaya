/* public id: string;

@Column({
    type: 'varchar',
    length: 50,
    nullable: false,
})
public name: string;

@Column({
    type: 'text',
    default: [
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.shopify.com%2Fpartners%2Fblog%2Fimg-url-filter&psig=AOvVaw2EkP0J65Il4Nos_inEkDNc&ust=1742612582382000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNjajdCXmowDFQAAAAAdAAAAABAE',
    ],
})
public imgProduct: [string];

@Column({
    type: 'text',
    nullable: false,
})
public description: string;

@Column('decimal', {
    scale: 2,
    nullable: false,
    precision: 10,
})
public initialPrice: number;

@Column('decimal', {
    scale: 2,
    nullable: false,
    precision: 10,
})
public finalPrice: number; */

export interface ICategory {
  id: string;
  categoryName: string;
}

export interface IProduct {
  id: string;
  name: string;
  imgProduct: string[];
  description: string;
  initialPrice: number;
  finalPrice: number;
  isActive: boolean;
  auctionId?: string;
  category?: {
    categoryName: string;
  };
}

export interface IAuction {
  id: string;
  name: string;
  description: string;
  endDate: string;
  isActive: boolean;
  product?: IProduct;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateAuction {
  name: string;
  description: string;
  endDate: string;
}

export interface ICreateProduct {
  name: string;
  description: string;
  initialPrice: number;
  finalPrice: number;
  categoryId: string;
  imgProduct: string[];
  auctionId: string;
}

export interface ILoginProps {
  email: string;
  password: string;
}

export interface ILoginErrors {
  email?: string;
  password?: string;
}

export interface IRegisterProps {
  name: string;
  email: string;
  password: string;
  imgProfile?: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface IRegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  imgProfile?: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface IUserSession {
  token: string;
  user: {
    id: string; // Puede ser string o string según backend, pero mejor string para UUID
    firebaseUid: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: 'regular' | 'admin' | 'premium';
    imgProfile?: string;
    country: string;
    createdAt: string;
    // Puedes agregar aquí otros campos opcionales si los necesitas
  };
}

export interface IUserFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
}

export interface UpdateUserProps {
  user: IUser;
  onUpdateSuccess?: () => void;
}

export interface IBid {
  id: string;
  amount: number;
  userId: string;
  auctionId: string;
  createdAt: string;
  user: IUser;
}

export interface IAuction {
  id: string;
  name: string;
  endDate: string;
  startDate: string;
  description: string;
  isActive: boolean;
  deactivateAt: string;
  createdAt: string;
  currentHighestBid: number;
  bids: IBid[];
  owner?: IUser;
  product?: IProduct;
}

export interface IProduct {
  id: string;
  name: string;
  initialPrice: number;
  finalPrice: number;
  // startDate: string;
  endDate: string;
  isActive: boolean;
  imgProduct: string[];
}

export interface DashboardStats {
  totalUsers: number;
  activeAuctions: number;
  totalAuctions: number;
  premiumUsers: number;
  regularUsers: number;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'regular' | 'admin' | 'premium';
  firebaseUid: string;
  phone: string;
  country: string;
  address: string;
  createdAt: string;
  imgProfile?: string;
  isActive: boolean;
}

// Definir tipo para la subasta y el producto
export interface IAuctionDetailType {
  id: string;
  name: string;
  description: string;
  endDate: string;
  isActive: boolean;
  userId?: string; // opcional, legacy
  owner: {
    id: string;
    name: string;
    email: string;
    // ...otros campos si los necesitas
  };
  product: {
    id: string;
    name: string;
    imgProduct: string[];
    description: string;
    initialPrice: number | string;
    finalPrice: number | string;
    isActive: boolean;
    category?: {
      categoryName: string;
    };
  };
}

export interface IEditAuctionFormValues {
  name: string;
  description: string;
  endDate: string;
}

export interface IEditAuctionFormProps {
  auction: {
    id: string;
    name: string;
    description: string;
    endDate: string;
  };
}


export interface IEditAuctionErrors {
  name?: string;
  description?: string;
  endDate?: string;
  id?: string;
}
