'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'How do I create an account?',
    answer: 'Click on "Sign Up" and fill in your name, email, and password. We’ll send a confirmation link to your inbox.',
  },
  {
    question: 'I forgot my password. What do I do?',
    answer: 'Click "Forgot password?" on the login page. Enter your email and we’ll send reset instructions.',
  },
  {
    question: 'Is my information secure?',
    answer: 'Yes. We use encryption, secure authentication, and follow best practices to protect your data.',
  },
  {
    question: 'Can I use Pujaya on mobile devices?',
    answer: 'Absolutely. Pujaya is fully responsive and works across modern browsers and devices.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b pb-4">
            <button
              className="text-left w-full text-lg font-medium text-blue-700 hover:underline"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
            </button>
            {openIndex === index && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}