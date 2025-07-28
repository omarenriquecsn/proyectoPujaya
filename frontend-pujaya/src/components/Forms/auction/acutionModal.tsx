'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (auctionData: AuctionFormData) => void;
  auction?: {
    id: string;
    name: string;
    initialPrice: number;
    currentPrice: number;
    endDate: string;
    category: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
  };
}

interface AuctionFormData {
  name: string;
  initialPrice: number;
  endDate: string;
  category: string;
  description: string;
  image?: File;
}

export default function AuctionModal({
  isOpen,
  onClose,
  onSubmit,
  auction,
}: AuctionModalProps) {
  const [formData, setFormData] = useState<AuctionFormData>({
    name: '',
    initialPrice: 0,
    endDate: '',
    category: '',
    description: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (auction) {
      setFormData({
        name: auction.name,
        initialPrice: auction.initialPrice,
        endDate: auction.endDate,
        category: auction.category,
        description: auction.description,
      });
      setImagePreview(auction.imageUrl);
    }
  }, [auction]);

  const validateField = (name: keyof AuctionFormData, value: AuctionFormData[keyof AuctionFormData]) => {
    let message = '';

    if (name === 'name' && typeof value === 'string' && value.trim() === '')
      message = 'Item name is required.';

    if (name === 'initialPrice' && (typeof value !== 'number' || value <= 0 || isNaN(value)))
      message = 'Initial price must be greater than 0.';

    if (name === 'endDate' && (typeof value !== 'string' || new Date(value) <= new Date()))
      message = 'End date must be in the future.';

    if (name === 'category' && typeof value === 'string' && value === '')
      message = 'Category is required.';

    if (name === 'description' && typeof value === 'string' && value.trim() === '')
      message = 'Description is required.';

    setErrors((prev) => ({ ...prev, [name]: message }));
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'initialPrice' ? Number(value) : value,
    }));

    validateField(name as keyof AuctionFormData, name === 'initialPrice' ? Number(value) : value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const fields: (keyof AuctionFormData)[] = ['name', 'initialPrice', 'endDate', 'category', 'description'];
    let valid = true;

    fields.forEach((field) => {
      const value = formData[field];
      validateField(field, value);

      const isInvalid =
        (field === 'name' && typeof value === 'string' && value.trim() === '') ||
        (field === 'initialPrice' && (typeof value !== 'number' || value <= 0 || isNaN(value))) ||
        (field === 'endDate' && (typeof value !== 'string' || new Date(value) <= new Date())) ||
        (field === 'category' && typeof value === 'string' && value === '') ||
        (field === 'description' && typeof value === 'string' && value.trim() === '');

      if (isInvalid) valid = false;
    });

    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{auction ? 'Edit' : 'Create'} Auction</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Initial Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Initial Price</label>
            <input
              type="number"
              name="initialPrice"
              value={formData.initialPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.initialPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.initialPrice}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              <option value="art">Art</option>
              <option value="collectibles">Collectibles</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="jewelry">Jewelry</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Item Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm"
            />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                width={400}
                height={300}
                className="mt-2 w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {auction ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
