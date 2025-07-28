"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateProduct, uploadImages } from "@/app/products/actions";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";


interface Category {
  id: string;
  name: string;
}

interface EditProductFormProps {
  initialData: unknown;
}

function isValidProduct(obj: unknown): obj is {
  id: string;
  name?: string;
  description?: string;
  initialPrice?: string | number;
  finalPrice?: string | number;
  categoryId?: string;
  category?: { id: string; name: string };
  imgProduct?: string[];
} {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    (obj as { name?: unknown }).name !== 'BadRequestException'
  );
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const router = useRouter();
  const { userData } = useAuth();
  // Default values (empty)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const url = useSearchParams().get('url');
  // Populate state if initialData is valid
  useEffect(() => {
    if (isValidProduct(initialData)) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setInitialPrice(initialData.initialPrice?.toString() || '');
      setFinalPrice(initialData.finalPrice?.toString() || '');
      setCategoryId(initialData.categoryId || initialData.category?.id || '');
      setUploadedImages(Array.isArray(initialData.imgProduct) ? initialData.imgProduct : []);
    }
  }, [initialData]);
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load categories');
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.items)) {
          setCategories(
            data.items.map((cat: { id: string; categoryName: string }) => ({
              id: cat.id,
              name: cat.categoryName,
            }))
          );
        } else {
          throw new Error('Invalid categories data format');
        }
        setIsLoadingCategories(false);
      })
      .catch(() => {
        setError('Failed to load categories. Please try again later.');
        setIsLoadingCategories(false);
      });
    }, []);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      setIsUploadingImages(true);
      setFormErrors({});
      try {
      const urls = await uploadImages(Array.from(files), userData?.token || '');
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (error) {
      setFormErrors({ images: (error as Error).message });
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };
  
  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name || name.length < 3) errors.name = 'Name must be at least 3 characters long';
    if (!description || description.length < 10)
      errors.description = 'Description must be at least 10 characters long';
    if (!initialPrice || Number(initialPrice) <= 0)
      errors.initialPrice = 'Initial price must be greater than 0';
    if (!finalPrice || Number(finalPrice) <= Number(initialPrice))
      errors.finalPrice = 'Final price must be greater than initial price';
    if (!categoryId) errors.categoryId = 'Category is required';
    if (uploadedImages.length === 0) errors.images = 'At least one image is required';
    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('initialPrice', String(initialPrice));
      formData.append('finalPrice', String(finalPrice));
      formData.append('categoryId', categoryId);
      uploadedImages.forEach((url) => formData.append('imgProduct', url));
      formData.append('token', userData?.token || '');
      await updateProduct((initialData as { id: string }).id, formData);
      // Redirect to auction detail page instead of product detail
      const auctionId =
      (initialData as { auctionId?: string; auction?: { id?: string } }).auctionId ||
      (initialData as { auction?: { id?: string } }).auction?.id;
      console.log(url); 
      if (auctionId && !url) {
        router.push(`/auctions/${auctionId}`);
      } else if (url) {
        router.push(`${url}&productName=${formData.get('name')}`);
      } else {
        setError('Could not determine the auction for this product. Please contact support.');
      }
    } catch (err) {
      setError((err as Error).message || 'Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate initialData after hooks
  if (!isValidProduct(initialData)) {
    return (
      <div className="text-red-600 bg-red-100 p-4 rounded-md mt-4">
        Error: Product data could not be loaded. Please try again or contact support.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-sm rounded-lg p-6">
      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Initial price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {formErrors.initialPrice && (
              <p className="mt-1 text-sm text-red-600">{formErrors.initialPrice}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Final price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {formErrors.finalPrice && (
              <p className="mt-1 text-sm text-red-600">{formErrors.finalPrice}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={isLoadingCategories}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formErrors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{formErrors.categoryId}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product images <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={isUploadingImages}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
          {isUploadingImages && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">Uploading images...</span>
            </div>
          )}
          {formErrors.images && <p className="mt-1 text-sm text-red-600">{formErrors.images}</p>}
        </div>
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative">
                <Image
                  src={url}
                  alt={`Uploaded image ${index + 1}`}
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="flex-1 bg-blue-700 text-white py-3 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
