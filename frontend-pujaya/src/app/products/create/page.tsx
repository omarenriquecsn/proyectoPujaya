'use client';

import FormProduct from '@/components/Forms/product/FormProduct';
import { useSearchParams } from 'next/navigation';

export default function CreateProductPage() {
  const searchParams = useSearchParams();
  const returnPath = searchParams.get('returnTo') || '/auctions/create';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Product</h1>
        <FormProduct returnPath={returnPath} />
      </div>
    </div>
  );
} 