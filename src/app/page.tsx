import StoreForm from 'src/app/components/StoreForm';

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Create Your Store
      </h1>
      <StoreForm />
    </div>
  );
}