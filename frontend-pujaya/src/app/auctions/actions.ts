'use server';

import { cookies } from 'next/headers';
import { ICreateProduct } from '../types/index';

interface ICreateAuction {
  name: string;
  description: string;
  endDate: string;
  productId: string;
  latitude: number;
  longitude: number;
}

export async function createAuction(formData: FormData) {
  const token = formData.get('token');

  if (!token) {
    throw new Error('Authentication required');
  }

  const auctionData: ICreateAuction = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    endDate: formData.get('endDate') as string,
    productId: formData.get('productId') as string,
    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(auctionData),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create auction');
    }

    return response.json();
  } catch (error: unknown) {
    throw new Error((error as Error).message || 'Failed to create auction');
  }
}

export async function createProduct(formData: FormData, auctionId: string) {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  const productData: ICreateProduct = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    initialPrice: Number(formData.get('initialPrice')),
    finalPrice: Number(formData.get('finalPrice')),
    categoryId: formData.get('categoryId') as string,
    imgProduct: Array.from(formData.getAll('imgProduct')).map((img) => img.toString()),
    auctionId: auctionId,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }

  return response.json();
}

export async function uploadImages(files: File[]) {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  });

  return Promise.all(uploadPromises);
}

export async function getAuctionById(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}

export async function updateAuction(id: string, formData: FormData) {
  let token = formData.get('token') as string | undefined;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  }
  if (!token) throw new Error('Authentication required');
  const auctionData: Partial<ICreateAuction> = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    endDate: formData.get('endDate') as string,
    productId: formData.get('productId') as string,
  };
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(auctionData),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Error al actualizar la subasta');
  return response.json();
}

export async function endAuction(auctionId: string) {
  console.log('endAuction', auctionId);
  // This method must be called from a server action, not from a client component
  throw new Error(
    'endAuction must be called from a server action, not directly from a client component'
  );
}
