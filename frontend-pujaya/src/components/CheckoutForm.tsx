'use client';

import { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(14.99); // default
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const router = useRouter();
  const { userData, updateUserRole } = useAuth();

  useEffect(() => {
    if (!userData?.user?.id) return;
    const createPaymentIntent = async () => {
      try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/payments/create-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: plan === 'monthly' ? 14.99 * 100 : 99.99 * 100, // en centavos
            currency: 'usd',
            plan,
            userId: userData.user.id,
          }),
        });
        const data = await res.json();
        console.log(data);
        setClientSecret(data.clientSecret);
      } catch {
        toast.error('Error creating payment intent');
      }
    };
    createPaymentIntent();
  }, [plan, userData?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
    if (error) {
      toast.error(error.message || 'Payment failed');
    } else if (paymentIntent?.status === 'succeeded') {



      const res = await fetch(`${API_URL.replace(/\/$/, '')}/payments/update-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData?.user.id, plan, paymentIntentId: paymentIntent?.id }),
      });
      const data = await res.json();
      if (!data) {
        toast.error(data.message);
        return;
      }
      toast.success('Payment successful! Premium activated soon.');
      updateUserRole('premium');
      router.push(`/payment-success?amount=${amount}&plan=${plan}`);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow border"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Complete your payment</h2>
      <div className="mb-6 flex justify-center gap-4">
        <button
          type="button"
          className={`px-4 py-2 rounded ${plan === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setPlan('monthly');
            setAmount(14.99);
          }}
        >
          Premium Monthly ($14.99)
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${plan === 'annual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setPlan('annual');
            setAmount(99.99);
          }}
        >
          Premium Annual ($99.99)
        </button>
      </div>
      <p className="text-lg text-gray-600 text-center mb-6">
        Amount: <span className="font-bold text-blue-600">${amount} USD</span>
      </p>
      <div className="mb-6 p-4 bg-gray-50 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1a202c',
                '::placeholder': { color: '#cbd5e0' },
              },
              invalid: { color: '#e53e3e' },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 rounded-md text-white font-semibold transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'}`}
      >
        {loading ? 'Processing...' : `Pay ${amount} USD`}
      </button>
    </form>
  );
};

export default CheckoutForm;
