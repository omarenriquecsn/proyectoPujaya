import EditProductForm from "@/components/Forms/product/EditProductForm";
import { getProductById } from "@/app/products/actions";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: unknown) {
  const params = await (props as { params: { id: string } }).params;
  const product = await getProductById(params.id);
  if (!product) return notFound();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <EditProductForm initialData={product} />
    </div>
  );
}
