import { Product } from '@/types';
import axios from 'axios';

const API_BASE = 'https://interview-task-green.vercel.app/task';
const PRODUCTS_API = 'https://glore-bd-backend-node-mongo.vercel.app/api/product';

export interface StoreFormData {
  name: string;
  domain: string;  // Should be full domain (subdomain.expressitbd.com)
  country: string;
  category: string;
  currency: string;
  email: string;
}

export const checkDomain = async (subdomain: string): Promise<boolean> => {
  try {
    const response = await axios.get<{ available: boolean }>(
      `${API_BASE}/domains/check/${subdomain}`
    );
    return response.data.available;
  } catch (error) {
    console.error('Domain check failed:', error);
    return false;  // Consider throwing an error here if you need more detailed handling
  }
};

export const createStore = async (storeData: StoreFormData): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE}/stores/create`,
      {
        ...storeData,
        domain: `${storeData.domain.toLowerCase()}.expressitbd.com`
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Store creation failed:', error);
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || 
        error.response?.data?.error?.message || 
        'Store creation failed';
      throw new Error(message);  // You can throw a more detailed error message
    }
    throw new Error('Unknown error occurred');
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>(PRODUCTS_API);
    return response.data;
  } catch (error) {
    console.error('Fetching products failed:', error);
    throw new Error('Failed to fetch products');
  }
};

export const fetchProduct = async (id: string): Promise<Product | null> => {
  try {
    const response = await axios.get<Product>(`${PRODUCTS_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
};
