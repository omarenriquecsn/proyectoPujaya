'use server';

interface ICreateProduct {
  name: string;
  description: string;
  initialPrice: number;
  finalPrice: number;
  categoryId: string;
  imgProduct: string[];
}

export async function createProduct(formData: FormData) {
  const token = formData.get('token');

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
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
      cache: 'no-store',
    });
    console.log(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    return response.json();
    } catch (error: unknown) {
    console.error("Error creating product:", error);
    throw new Error((error as Error).message || "Failed to create product");
  }
}

export async function uploadImages(files: File[], token: string) {
 
  if (!token) {
    throw new Error('Authentication required');
  }


  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
   
    console.log(process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/upload`, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    console.log(response);

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    // El backend ahora devuelve { urls: [...] }
    if (Array.isArray(data.urls)) {
      return data.urls;
    } else if (data.url) {
      // fallback por si solo devuelve una
      return [data.url];
    } else {
      throw new Error('No image URLs returned from server');
    }
  } catch (error: unknown) {
    console.error("Error uploading images:", error);
    throw new Error((error as Error).message || "Failed to upload images");
  }
}

export async function getProductById(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}

export async function updateProduct(id: string, formData: FormData) {
  let token = formData.get('token') as string | undefined;
  if (!token) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  }
  if (!token) throw new Error('Authentication required');
  const productData: Partial<ICreateProduct> = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    initialPrice: Number(formData.get('initialPrice')),
    finalPrice: Number(formData.get('finalPrice')),
    categoryId: formData.get('categoryId') as string,
    imgProduct: Array.from(formData.getAll('imgProduct')).map((img) => img.toString()),
  };
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Error al actualizar el producto');
  return response.json();
}
