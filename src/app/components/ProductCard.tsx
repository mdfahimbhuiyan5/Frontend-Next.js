import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative h-48">
          <Image
            src={product.image}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="/placeholder.jpg"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {product.name}
          </h3>
          <p className="text-primary font-medium mt-2">
            ৳{product.price.toLocaleString('en-BD')}
          </p>
        </div>
      </Link>
    </div>
  );
}
