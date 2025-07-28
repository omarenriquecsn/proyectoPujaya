'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createAuction, updateAuction } from '@/app/auctions/actions';
import { useAuctionForm } from '@/app/context/AuctionFormContext';
import MapLibreMap from '@/components/MapLibreMap';

interface FormErrors {
  name?: string;
  description?: string;
  endDate?: string;
  productId?: string;
  location?: string;
}

interface AuctionFormInitialData {
  id?: string;
  name?: string;
  description?: string;
  endDate?: string;
  product?: {
    id?: string;
    name?: string;
  };
  latitude?: number;
  longitude?: number;
}

interface FormAuctionProps {
  initialData?: AuctionFormInitialData;
  mode?: 'edit' | 'create';
}

export default function FormAuction({ initialData, mode = 'create' }: FormAuctionProps) {
  const { userData } = useAuth();
  const { auctionForm, setAuctionForm, clearAuctionForm } = useAuctionForm();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the selected product from URL parameters
  const productIdFromUrl = searchParams.get('productId');
  const productId = productIdFromUrl || auctionForm.productId;
  const productNameFromUrl = searchParams.get('productName');
  const productName = productNameFromUrl || auctionForm.productName;

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [name, setName] = useState(initialData?.name || auctionForm.name || '');
  const [description, setDescription] = useState(
    initialData?.description || auctionForm.description || ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? initialData.endDate.slice(0, 16) : auctionForm.endDate || ''
  );

  // State for the minimum value of the date input
  const [minEndDate, setMinEndDate] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // If initialData changes (navigating between auctions), update fields
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setEndDate(initialData.endDate ? initialData.endDate.slice(0, 16) : '');
      setLatitude(initialData.latitude || null);
      setLongitude(initialData.longitude || null);
    }
  }, [initialData]);

  useEffect(() => {
    // Only calculate on client side to avoid hydration mismatch
    const now = new Date();
    setMinEndDate(now.toISOString().slice(0, 16));
  }, []);

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const endDate = formData.get('endDate') as string;

    if (!name || name.length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    if (!description || description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }

    if (!endDate) {
      errors.endDate = 'End date is required';
    } else {
      const selectedDate = new Date(endDate);
      const now = new Date();
      if (selectedDate <= now) {
        errors.endDate = 'End date must be in the future';
      }
    }

    if (!productId) {
      errors.productId = 'Product is required';
    }

    if (latitude === null || longitude === null) {
      errors.location = 'Location is required';
    }

    return errors;
  };

  // Añadir validación en vivo para cada campo
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
      case 'endDate':
        if (!value) {
          errors.endDate = 'End date is required';
        } else {
          const selectedDate = new Date(value);
          const now = new Date();
          if (selectedDate <= now) {
            errors.endDate = 'End date must be in the future';
          } else {
            delete errors.endDate;
          }
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleFieldChange = (field: string, value: string) => {
    setAuctionForm({ [field]: value });
    if (field === 'name') setName(value);
    if (field === 'description') setDescription(value);
    if (field === 'endDate') setEndDate(value);
    liveValidateField(field, value);
  };

  // Adaptar el handler para maplibre-gl y tipar correctamente
  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    setLatitude(lngLat.lat);
    setLongitude(lngLat.lng);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuctionForm({ name, description, endDate, productId, productName });
    const formData = new FormData(event.currentTarget);
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setError(null);
      setIsSubmitting(true);
      formData.append('productId', productId || '');
      formData.append('token', userData?.token || '');
      if (latitude !== null && longitude !== null) {
        formData.append('latitude', String(latitude));
        formData.append('longitude', String(longitude));
      }
      if (mode === 'edit' && initialData?.id) {
        await updateAuction(initialData.id, formData);
      } else {
        await createAuction(formData);
      }
      clearAuctionForm();
      router.push('/auctions');
    } catch (error) {
      setError((error as Error).message || 'An error occurred while saving the auction');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAddProduct = () => {
    // Redirect to product creation form
    const currentUrl = window.location.pathname;
    router.push(`/products/create?returnTo=${encodeURIComponent(currentUrl)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-sm rounded-lg p-6">
      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Auction Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            required
            min={minEndDate}
            value={endDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {formErrors.endDate && <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>}
        </div>

        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
            Product <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                id="product"
                name="product"
                value={productName || ''}
                readOnly
                placeholder="No product selected"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddProduct}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              Add Product
            </button>
          </div>
          {formErrors.productId && (
            <p className="mt-1 text-sm text-red-600">{formErrors.productId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="h-64 w-full rounded-md overflow-hidden mb-2">
            <MapLibreMap
              lng={longitude || -58.3816}
              lat={latitude || -34.6037}
              zoom={10}
              style={{ width: '100%', height: '100%' }}
              radius={1} // Radio de 1 km, puedes ajustar este valor
              onClick={handleMapClick}
              onUserLocation={(coords) => {
                setLatitude(coords.lat);
                setLongitude(coords.lng);
              }}
            />
          </div>
          {formErrors.location && (
            <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
          )}
          {latitude && longitude && (
            <p className="text-xs text-gray-500">
              Lat: {latitude}, Lng: {longitude}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !productId}
            className="flex-1 bg-blue-700 text-white py-3 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? mode === 'edit'
                ? 'Saving...'
                : 'Creating Auction...'
              : mode === 'edit'
                ? 'Save Changes'
                : 'Create Auction'}
          </button>
        </div>

        {!productId && (
          <p className="text-sm text-gray-500 text-center">
            Please add a product before creating the auction
          </p>
        )}
      </div>
    </form>
  );
}
