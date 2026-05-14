import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .limit(10);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Grocery Store 🛒</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{product.name}</h2>
            <p>₹{product.price}</p>
            <p>{product.unit}</p>
          </div>
        ))}
      </div>
    </main>
  );
}