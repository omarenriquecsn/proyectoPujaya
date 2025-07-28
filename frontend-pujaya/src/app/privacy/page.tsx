// app/privacy/page.tsx
export default function PrivacyPolicyPage() {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
  
        <p className="mb-4">
          At Pujaya, we take your privacy seriously. This policy describes how we collect, use, and protect your information.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Contact information such as your name and email address.</li>
          <li>Usage and browsing data within the platform.</li>
          <li>Technical details like IP address, device, and browser type.</li>
        </ul>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <p>
          We use your data to deliver and improve our services, personalize your experience, send important updates, and ensure compliance with our terms.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Third-Party Sharing</h2>
        <p>
          We only share your information with trusted third parties for payment processing, authentication, or analytics. We never sell your data.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Security</h2>
        <p>
          We implement technical and organizational measures to protect your data against unauthorized access, loss, or misuse.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@pujaya.com.
        </p>
  
        <p className="mt-8 text-sm text-gray-600">Last updated: June 15, 2025</p>
      </div>
    );
  }