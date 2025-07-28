'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useAuctionForm } from '@/app/context/AuctionFormContext';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createProduct, uploadImages } from '@/app/products/actions';
import Image from 'next/image';
import { ICategory } from '@/app/types/index';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  initialPrice?: string;
  finalPrice?: string;
  categoryId?: string;
  images?: string;
}

interface FormProductProps {
  returnPath?: string;
}

export default function FormProduct({ returnPath = '/auctions/create' }: FormProductProps) {
  const { userData } = useAuth();
  const { setAuctionForm } = useAuctionForm();
  const router = useRouter();

  // Estados para valores del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Cargar categorías
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load categories');
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.items)) {
          setCategories(
            data.items.map((cat: ICategory) => ({
              id: cat.id,
              name: cat.categoryName,
            }))
          );
        } else {
          throw new Error('Invalid categories data format');
        }
        setIsLoadingCategories(false);
      })
      .catch((error: unknown) => {
        console.error("Error loading categories:", error);
        setError("Failed to load categories. Please try again later.");
        setIsLoadingCategories(false);
      });
  }, []);

  // Validar un campo individualmente
  const validateField = useCallback((field: keyof FormErrors, value: string) => {
    let errorMsg = '';

    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) {
          errorMsg = 'Name must be at least 3 characters long';
        }
        break;

      case 'description':
        if (!value || value.trim().length < 10) {
          errorMsg = 'Description must be at least 10 characters long';
        }
        break;

      case 'initialPrice':
        if (!value || Number(value) <= 0) {
          errorMsg = 'Initial price must be greater than 0';
        }
        break;

      case 'finalPrice':
        if (!value || Number(value) <= Number(initialPrice)) {
          errorMsg = 'Final price must be greater than initial price';
        }
        break;

      case 'categoryId':
        if (!value) {
          errorMsg = 'Category is required';
        }
        break;

      case 'images':
        if (uploadedImages.length === 0) {
          errorMsg = 'At least one image is required';
        }
        break;
    }

    setFormErrors((prev) => ({ ...prev, [field]: errorMsg || undefined }));
  }, [initialPrice, uploadedImages.length]);

  // Validar todas las campos antes de submit
  const validateAll = (): boolean => {
    validateField('name', name);
    validateField('description', description);
    validateField('initialPrice', initialPrice);
    validateField('finalPrice', finalPrice);
    validateField('categoryId', categoryId);
    validateField('images', '');

    // Esperar que formErrors se actualice (no es inmediato, así que calculamos errores aquí también)
    const errors: FormErrors = {};

    if (!name || name.trim().length < 3) errors.name = 'Name must be at least 3 characters long';
    if (!description || description.trim().length < 10) errors.description = 'Description must be at least 10 characters long';
    if (!initialPrice || Number(initialPrice) <= 0) errors.initialPrice = 'Initial price must be greater than 0';
    if (!finalPrice || Number(finalPrice) <= Number(initialPrice)) errors.finalPrice = 'Final price must be greater than initial price';
    if (!categoryId) errors.categoryId = 'Category is required';
    if (uploadedImages.length === 0) errors.images = 'At least one image is required';

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    // Validar imágenes cada vez que cambian
    validateField('images', '');
  }, [uploadedImages, validateField]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    setUploadProgress(0);
    setFormErrors((prev) => ({ ...prev, images: undefined }));

    try {
      const urls = await uploadImages(Array.from(files), userData?.token || '');
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (error: unknown) {
      setFormErrors((prev) => ({
        ...prev,
        images: (error as Error).message || "Error uploading images"
      }));
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateAll()) {
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('initialPrice', initialPrice);
      formData.append('finalPrice', finalPrice);
      formData.append('categoryId', categoryId);
      formData.append('token', userData?.token || '');

      uploadedImages.forEach((url) => {
        formData.append('imgProduct', url);
      });

      const result = await createProduct(formData);

      if (result && result.id) {
        setAuctionForm({
          productId: result.id,
          productName: name,
        });
        setTimeout(() => setAuctionForm({}), 0);

        const returnUrl = new URL(returnPath, window.location.origin);
        returnUrl.searchParams.set('productId', result.id);
        returnUrl.searchParams.set('productName', name);
        router.push(returnUrl.toString());
      } else {
        throw new Error('Failed to get product ID from response');
      }
    } catch (error) {
      setError(
        (error as Error).message ||
        "An error occurred while creating the product"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* // Live validation for each field
  const liveValidateField = (field: string, value: string) => {
    const errors: FormErrors = { ...formErrors };
    switch (field) {
      case 'name':
        if (!value || value.length < 3) {
          errors.name = 'Name must be at least 3 characters long';
        } else {
          delete errors.name;
        }
        break;
      case 'description':
        if (!value || value.length < 10) {
          errors.description = 'Description must be at least 10 characters long';
        } else {
          delete errors.description;
        }
        break;
      case 'initialPrice':
        if (!value || Number(value) <= 0) {
          errors.initialPrice = 'Initial price must be greater than 0';
        } else {
          delete errors.initialPrice;
        }
        break;
      case 'finalPrice':
        const initial = Number(
          (document.getElementById('initialPrice') as HTMLInputElement)?.value || 0
        );
        if (!value || Number(value) <= initial) {
          errors.finalPrice = 'Final price must be greater than initial price';
        } else {
          delete errors.finalPrice;
        }
        break;
      case 'categoryId':
        if (!value) {
          errors.categoryId = 'Category is required';
        } else {
          delete errors.categoryId;
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };
 */
  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-sm rounded-lg p-6" noValidate>
      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateField('name', e.target.value);
            }}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          /*             onChange={(e) => liveValidateField('name', e.target.value)} */
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Product Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              validateField('description', e.target.value);
            }}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          /*             onChange={(e) => liveValidateField('description', e.target.value)} */
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="initialPrice" className="block text-sm font-medium text-gray-700">
              Initial Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="initialPrice"
              name="initialPrice"
              value={initialPrice}
              onChange={(e) => {
                setInitialPrice(e.target.value);
                validateField('initialPrice', e.target.value);
                // También validar finalPrice porque depende de initialPrice
                validateField('finalPrice', finalPrice);
              }}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            /*               onChange={(e) => liveValidateField('initialPrice', e.target.value)} */
            />
            {formErrors.initialPrice && (
              <p className="mt-1 text-sm text-red-600">{formErrors.initialPrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="finalPrice" className="block text-sm font-medium text-gray-700">
              Final Price (Reserve Price) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="finalPrice"
              name="finalPrice"
              value={finalPrice}
              onChange={(e) => {
                setFinalPrice(e.target.value);
                validateField('finalPrice', e.target.value);
              }}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            /*               onChange={(e) => liveValidateField('finalPrice', e.target.value)} */
            />
            {formErrors.finalPrice && (
              <p className="mt-1 text-sm text-red-600">{formErrors.finalPrice}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          {isLoadingCategories ? (
            <LoadingSpinner />
          ) : (
            <select
              id="categoryId"
              name="categoryId"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                validateField('categoryId', e.target.value);
              }}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
          {formErrors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{formErrors.categoryId}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images <span className="text-red-500">*</span>
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
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isUploadingImages ? (
                  <>Uploading... {Math.round(uploadProgress)}%</>
                ) : (
                  <LoadingSpinner />
                )}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4">
            {uploadedImages.map((url, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded overflow-hidden border border-gray-300"
              >
                <Image src={url} alt={`Uploaded ${index + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {uploadedImages.length === 0 && (
            <p className="mt-2 text-sm text-red-600">At least one image is required.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isUploadingImages}
        className={`inline-flex items-center justify-center rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSubmitting || isUploadingImages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Submitting...</span>
          </>
        ) : (
          "Create Product"
        )}
      </button>
    </form>
  );
}
