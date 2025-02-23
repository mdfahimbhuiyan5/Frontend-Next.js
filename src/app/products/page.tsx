import { fetchProduct } from 'src/app/services/api';
import { Product } from '@/types';
import Image from 'next/image';

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const product: Product | null = await fetchProduct(params.id);

    if (!product) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for does not exist.</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative h-96">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-2xl text-primary mb-4">
                ৳{product.price.toLocaleString('en-BD')}
              </p>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="mt-6">
                <button className="bg-primary text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Product</h2>
        <p className="text-gray-600">Something went wrong. Please try again later.</p>
      </div>
    );
  }
}
