type PageProps = {
    params: {
      id: string;
    };
  };
  
  export default function OrderSuccessPage({ params }: PageProps) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-white shadow rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">
            Order Placed Successfully 🎉
          </h1>
  
          <p className="text-gray-600 mb-6">
            Your grocery order has been placed successfully.
          </p>
  
          <p className="font-medium mb-2">
            Order ID:
          </p>
  
          <p className="text-sm bg-gray-100 rounded p-3 mb-6 break-all">
            {params.id}
          </p>
  
          <p className="text-gray-500">
            Payment Method: Cash on Delivery
          </p>
        </div>
      </main>
    );
  }