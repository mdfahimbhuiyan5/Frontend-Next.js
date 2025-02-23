import { fetchProduct } from 'src/app/services/api';
import Image from 'next/image';

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const product = await fetchProduct(params.id);
    
    if (!product) {
      return (
        <div className="max-w-4xl mx-auto text-center p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Product not found</h2>
          <p className="text-gray-600">The product you are looking for does not exist.</p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative w-full h-96">
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl text-primary mb-4">৳{product.price.toLocaleString('en-BD')}</p>
            <p className="text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return (
      <div className="max-w-4xl mx-auto text-center p-6">
        <h2 className="text-2xl font-semibold text-red-600">Error loading product</h2>
        <p className="text-gray-600">Something went wrong. Please try again later.</p>
      </div>
    );
  }
}
