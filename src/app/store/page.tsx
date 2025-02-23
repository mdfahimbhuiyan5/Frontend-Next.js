'use client';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { ExclamationCircleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const StorePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    country: 'Bangladesh',
    category: 'Fashion',
    currency: 'BDT',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Domain availability check with debounce
  const checkDomainAvailability = useCallback(
    debounce(async (domain: string) => {
      if (domain.length < 3) {
        setDomainStatus('idle');
        return;
      }

      setDomainStatus('checking');
      try {
        const response = await axios.get(
          `https://interview-task-green.vercel.app/task/domains/check/${domain}.expressitbd.com`
        );
        const isAvailable = !response.data;
        setDomainStatus(isAvailable ? 'available' : 'unavailable');
        setErrors(prev => ({
          ...prev,
          domain: isAvailable ? '' : 'Domain not available'
        }));
      } catch (error) {
        console.error('Domain check failed:', error);
        setDomainStatus('idle');
      }
    }, 500),
    []
  );

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors: Record<string, string> = {};

    // Validation checks
    if (formData.name.length < 3) newErrors.name = 'Store name must be at least 3 characters long';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format!';
    
    // Domain validation
    if (!formData.domain) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.domain)) {
      newErrors.domain = 'Invalid domain format (only lowercase letters, numbers, and hyphens)';
    } else if (domainStatus === 'checking') {
      newErrors.domain = 'Domain check in progress';
    } else if (domainStatus !== 'available') {
      newErrors.domain = 'Domain not available';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('https://interview-task-green.vercel.app/task/stores/create', {
        name: formData.name,
        currency: formData.currency,
        country: formData.country,
        domain: `${formData.domain}.expressitbd.com`,
        category: formData.category,
        email: formData.email
      });
      
      alert('Store created successfully!');
      // Reset form
      setFormData({
        name: '',
        domain: '',
        country: 'Bangladesh',
        category: 'Fashion',
        currency: 'BDT',
        email: '',
      });
      setDomainStatus('idle');
      setErrors({});
    } catch (error) {
      let errorMessage = 'Error creating store. Please try again.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      setErrors(prev => ({ ...prev, form: errorMessage }));
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create a store</h1>
        <p className="text-gray-600">Add your basic store information and complete the setup</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
              How'd you like to call your store?
            </label>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <input
                id="store-name"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-1 focus:outline-none`}
                placeholder="Enter store name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>
        </div>

        {/* Domain Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label htmlFor="store-domain" className="block text-sm font-medium text-gray-700">
              Your online store subdomain
            </label>
          </div>
          <div className="md:col-span-2">
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-grow">
                <input
                  id="store-domain"
                  className={`block w-full px-3 py-2 rounded-l-md border-r-0 ${
                    errors.domain ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                  } focus:ring-1 focus:outline-none`}
                  placeholder="enter your domain name"
                  value={formData.domain}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^a-zA-Z0-9-]/g, '')
                      .toLowerCase();
                    setFormData({ ...formData, domain: value });
                    checkDomainAvailability(value);
                    setErrors(prev => ({ ...prev, domain: '' }));
                  }}
                />
                {domainStatus === 'checking' && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                  </div>
                )}
                {domainStatus === 'unavailable' && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
                {domainStatus === 'available' && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-gray-50 text-gray-500 text-sm border-gray-300">
                .expressitbd.com
              </span>
            </div>
            {errors.domain && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.domain}
              </p>
            )}
          </div>
        </div>

        {/* Country Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label htmlFor="store-country" className="block text-sm font-medium text-gray-700">
              Where's your store located?
            </label>
          </div>
          <div className="md:col-span-2">
            <select
              id="store-country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:border-blue-500 focus:outline-none"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              <option>Bangladesh</option>
              <option>United States</option>
              <option>India</option>
            </select>
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label htmlFor="store-category" className="block text-sm font-medium text-gray-700">
              What's your Category?
            </label>
          </div>
          <div className="md:col-span-2">
            <select
              id="store-category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:border-blue-500 focus:outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Fashion</option>
              <option>Electronics</option>
              <option>Home & Living</option>
              <option>Beauty</option>
            </select>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label htmlFor="store-currency" className="block text-sm font-medium text-gray-700">
              Choose store currency
            </label>
          </div>
          <div className="md:col-span-2">
            <select
              id="store-currency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:border-blue-500 focus:outline-none"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="BDT">BDT (Taka)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Email Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">
              Store contact email
            </label>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <input
                id="store-email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-1 focus:outline-none`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button and Form Error */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {errors.form && (
            <p className="mb-4 text-sm text-red-600 flex items-center gap-1">
              <ExclamationCircleIcon className="h-4 w-4" />
              {errors.form}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Store'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StorePage;