import EditAuctionForm from '@/components/Forms/auction/EditAuctionForm';
import { getAuctionById } from '@/app/auctions/actions';
import { notFound } from 'next/navigation';



export default async function EditAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await getAuctionById(id);
  if (!auction) return notFound();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit auction</h1>
      <EditAuctionForm initialData={auction} />
    </div>
  );
}
