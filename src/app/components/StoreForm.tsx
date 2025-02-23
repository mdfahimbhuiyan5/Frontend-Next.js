'use client';
import { useState, useCallback } from 'react';
import { checkDomain, createStore } from 'src/app/services/api';
import debounce from 'lodash/debounce';
import { ExclamationCircleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function StoreForm() {
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

  const validateEmail = (email: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkDomainAvailability = debounce(async (domain: string) => {
    if (domain.length < 3) {
      setDomainStatus('idle');
      return;
    }
  
    setDomainStatus('checking');
    try {
      const isAvailable = await checkDomain(domain);
      setDomainStatus(isAvailable ? 'available' : 'unavailable');
      setErrors(prev => ({
        ...prev,
        domain: isAvailable ? '' : 'Not Available Domain, Re-enter!'
      }));
    } catch (error) {
      console.error('Domain check failed:', error);
      setDomainStatus('idle');
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Domain check failed'
        : 'Domain check failed. Please try again.';
      setErrors(prev => ({ ...prev, domain: errorMessage }));
    }
  }, 500);
  
    []
  ;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors: Record<string, string> = {};

    // Enhanced client-side validation
    if (formData.name.trim().length < 3) {
      newErrors.name = 'Store name must be at least 3 characters long';
    }
    if (!formData.domain.match(/^[a-z0-9-]+$/i)) {
      newErrors.domain = 'Domain can only contain letters, numbers, and hyphens';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format!';
    }
    if (domainStatus === 'unavailable') {
      newErrors.domain = 'Not Available Domain, Re-enter!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare formatted data with server requirements
      const payload = {
        name: formData.name.trim(),
        currency: formData.currency,
        country: formData.country,
        domain: `${formData.domain.trim().toLowerCase()}.expressitbd.com`,
        category: formData.category,
        email: formData.email.trim().toLowerCase()
      };

      console.log('Submission payload:', payload); // Debug log
      
      const response = await createStore(payload);
      
      if (response.status === 201) {
        alert('Store created successfully!');
        // Reset form state
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
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMessage = 'Error creating store. Please check your inputs.';
      let domainError = '';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        // Handle nested server validation errors
        domainError = error.response?.data?.errors?.domain || '';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
      
      // Update error state for specific field errors
      if (domainError) {
        setErrors(prev => ({ ...prev, domain: domainError }));
      } else if (errorMessage.toLowerCase().includes('domain')) {
        setErrors(prev => ({ ...prev, domain: errorMessage }));
      }
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Name Field */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <input
                className={`w-full px-3 py-2.5 border rounded-lg ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-2 focus:outline-none`}
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
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>
        </div>

        {/* Domain Field */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Store Subdomain
            </label>
          </div>
          <div className="md:col-span-2">
            <div className="flex rounded-lg shadow-sm">
              <div className="relative flex-grow">
                <input
                  className={`block w-full px-3 py-2.5 rounded-l-lg border-r-0 ${
                    errors.domain ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                  } focus:ring-2 focus:outline-none`}
                  placeholder="Enter subdomain"
                  value={formData.domain}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-z0-9-]/gi, '');
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
              <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 bg-gray-50 text-gray-500 text-sm border-gray-300">
                .expressitbd.com
              </span>
            </div>
            {errors.domain && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.domain}
              </p>
            )}
          </div>
        </div>

        {/* Location & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Store Details
            </label>
          </div>
          <div className="md:col-span-2 space-y-6">
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              <option>Bangladesh</option>
              <option>United States</option>
              <option>India</option>
            </select>
            
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Currency & Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Financial Details
            </label>
          </div>
          <div className="md:col-span-2 space-y-6">
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="BDT">BDT (Taka)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            <div className="relative">
              <input
                type="email"
                className={`w-full px-3 py-2.5 border rounded-lg ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-2 focus:outline-none`}
                placeholder="contact@yourstore.com"
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
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-medium py-3 px-6 rounded-lg transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating Store...' : 'Create Store'}
          </button>
        </div>
      </form>
    </div>
  );
}