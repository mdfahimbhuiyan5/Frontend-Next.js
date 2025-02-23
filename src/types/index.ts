export type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  stock?: number;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Store = {
  name: string;
  domain: string;
  country: string;
  category: string;
  currency: string;
  email: string;
};

export type ApiError = {
  message?: string;
  errors?: {
    name?: string;
    domain?: string;
    email?: string;
    [key: string]: string | undefined;
  };
};

export type ApiResponse<T = unknown> = {
  data?: T;
  message?: string;
  errors?: ApiError['errors'];
};
