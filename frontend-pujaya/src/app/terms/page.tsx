export default function TermsPage() {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
  
        <p className="mb-4">
          Welcome to Pujaya. By using this platform, you agree to abide by the following terms and conditions:
        </p>
  
        <ol className="list-decimal ml-6 space-y-4">
          <li>
            <strong>Authorized Use:</strong> You may only use this platform in accordance with applicable laws and for lawful purposes.
          </li>
          <li>
            <strong>Intellectual Property:</strong> All visual, textual, and software content is the property of Pujaya or its licensors.
          </li>
          <li>
            <strong>Privacy:</strong> By using this application, you agree to our privacy policy, which governs the collection and use of personal data.
          </li>
          <li>
            <strong>Disclaimer:</strong> Pujaya does not guarantee uninterrupted service and shall not be liable for errors or service interruptions.
          </li>
          <li>
            <strong>Modifications:</strong> We reserve the right to change these terms at any time. Users will be notified of updates accordingly.
          </li>
        </ol>
  
        <p className="mt-8 text-sm text-gray-600">Last updated: June 15, 2025</p>
      </div>
    );
  }